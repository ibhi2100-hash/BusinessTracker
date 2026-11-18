import {
  createPrivateKey,
  createPublicKey,
  sign,
  verify,
} from "node:crypto";
import { BillingLeaseStatus, PrismaClient } from "../../generated/client";

interface LeaseConfig {
  privateKeyPem: string;
  publicKeyPem: string;
  keyId: string;
  leaseDurationHours: number;
  gracePeriodHours: number;
}

interface IssueLeaseInput {
  businessId: string;
  subscriptionId: string;
  deviceId: string;
  branchId?: string;
}

interface LeasePayload {
  version: 1;
  keyId: string;
  leaseId: string;
  businessId: string;
  subscriptionId: string;
  deviceId: string;
  branchId: string | null;
  issuedAt: number;
  expiresAt: number;
  gracePeriodEnd: number;
  entitlements: Record<string, unknown>;
}

export class BillingLeaseService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly config: LeaseConfig,
  ) {
    if (!config.privateKeyPem || !config.publicKeyPem) {
      throw new Error("Billing lease signing keys are required");
    }

    if (config.leaseDurationHours <= 0 || config.gracePeriodHours < 0) {
      throw new Error("Invalid lease duration configuration");
    }
  }

  async issue(input: IssueLeaseInput) {
    const now = new Date();

    const subscription = await this.prisma.billingSubscription.findFirst({
      where: {
        id: input.subscriptionId,
        businessId: input.businessId,
        status: {
          in: ["TRIALING", "ACTIVE", "GRACE_PERIOD"],
        },
      },
    });

    if (!subscription) {
      throw new Error("No eligible subscription exists for this business");
    }

    if (
      subscription.currentPeriodEnd &&
      subscription.currentPeriodEnd <= now &&
      subscription.status !== "GRACE_PERIOD"
    ) {
      throw new Error("Subscription period has ended");
    }

    if (input.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: {
          id: input.branchId,
          businessId: input.businessId,
          isActive: true,
        },
        select: { id: true },
      });

      if (!branch) throw new Error("Branch does not belong to this business or is inactive");
    }

    const entitlements = await this.prisma.billingEntitlement.findMany({
      where: {
        businessId: input.businessId,
        status: "ACTIVE",
        validFrom: { lte: now },
        OR: [{ validUntil: null }, { validUntil: { gt: now } }],
      },
      select: {
        entitlementKey: true,
        value: true,
      },
    });

    const snapshot = Object.fromEntries(
      entitlements.map((item) => [item.entitlementKey, item.value]),
    );

    const issuedAt = now;
    const expiresAt = new Date(
      now.getTime() + this.config.leaseDurationHours * 60 * 60 * 1000,
    );

    const subscriptionGraceEnd =
      subscription.gracePeriodEnd &&
      subscription.gracePeriodEnd > expiresAt
        ? subscription.gracePeriodEnd
        : expiresAt;

    const gracePeriodEnd = new Date(
      subscriptionGraceEnd.getTime() +
        this.config.gracePeriodHours * 60 * 60 * 1000,
    );

    const lease = await this.prisma.billingSubscriptionLease.create({
      data: {
        businessId: input.businessId,
        subscriptionId: input.subscriptionId,
        branchId: input.branchId ?? null,
        deviceId: input.deviceId,
        issuedAt,
        expiresAt,
        gracePeriodEnd,
        status: BillingLeaseStatus.ACTIVE,
        entitlementSnapshot: snapshot,
        signedToken: "PENDING_SIGNATURE",
      },
    });

    const payload: LeasePayload = {
      version: 1,
      keyId: this.config.keyId,
      leaseId: lease.id,
      businessId: input.businessId,
      subscriptionId: input.subscriptionId,
      deviceId: input.deviceId,
      branchId: input.branchId ?? null,
      issuedAt: issuedAt.getTime(),
      expiresAt: expiresAt.getTime(),
      gracePeriodEnd: gracePeriodEnd.getTime(),
      entitlements: snapshot,
    };

    const token = this.signPayload(payload);

    return this.prisma.billingSubscriptionLease.update({
      where: { id: lease.id },
      data: { signedToken: token },
    });
  }

  async revoke(leaseId: string, reason: string) {
    const lease = await this.prisma.billingSubscriptionLease.findUnique({
      where: { id: leaseId },
    });

    if (!lease) throw new Error("Lease not found");

    return this.prisma.billingSubscriptionLease.update({
      where: { id: leaseId },
      data: {
        status: BillingLeaseStatus.REVOKED,
        revokedAt: new Date(),
      },
    });
  }

  async revokeForSubscription(subscriptionId: string) {
    return this.prisma.billingSubscriptionLease.updateMany({
      where: {
        subscriptionId,
        status: BillingLeaseStatus.ACTIVE,
      },
      data: {
        status: BillingLeaseStatus.REVOKED,
        revokedAt: new Date(),
      },
    });
  }

  verifyToken(token: string) {
    const [encodedPayload, encodedSignature] = token.split(".");

    if (!encodedPayload || !encodedSignature) {
      throw new Error("Malformed lease token");
    }

    const signature = Buffer.from(encodedSignature, "base64url");
    const valid = verify(
      null,
      Buffer.from(encodedPayload, "base64url"),
      createPublicKey(this.config.publicKeyPem),
      signature,
    );

    if (!valid) throw new Error("Invalid lease signature");

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as LeasePayload;

    if (payload.version !== 1 || payload.keyId !== this.config.keyId) {
      throw new Error("Unsupported lease token version or key");
    }

    const now = Date.now();

    if (now > payload.gracePeriodEnd) {
      throw new Error("Lease and grace period have expired");
    }

    return {
      ...payload,
      withinPrimaryLease: now <= payload.expiresAt,
      withinGracePeriod:
        now > payload.expiresAt && now <= payload.gracePeriodEnd,
    };
  }

  private signPayload(payload: LeasePayload) {
    const encodedPayload = Buffer.from(
      JSON.stringify(payload),
    ).toString("base64url");

    const signature = sign(
      null,
      Buffer.from(encodedPayload, "base64url"),
      createPrivateKey(this.config.privateKeyPem),
    ).toString("base64url");

    return `${encodedPayload}.${signature}`;
  }
}
