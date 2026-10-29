
import type {
  ActorContext,
  BackendEvent,
  DomainEvent,
} from "@business/shared-types";

export interface TransformedRemoteEvent {
  event: DomainEvent;
  globalPosition: string;
}

type BackendEventWire = Omit<
  BackendEvent,
  | "globalPosition"
  | "aggregateVersion"
  | "logicClock"
  | "createdAt"
> & {
  globalPosition: string | number | bigint;
  aggregateVersion: number | string;
  logicClock: bigint | number | string;
  createdAt: Date | string | number;
};

function parseSafeInteger(
  value: number | string | bigint,
  field: string,
): number {
  let parsed: number;

  if (typeof value === "bigint") {
    if (
      value > BigInt(Number.MAX_SAFE_INTEGER) ||
      value < BigInt(Number.MIN_SAFE_INTEGER)
    ) {
      throw new Error(`${field} exceeds the safe integer range.`);
    }

    parsed = Number(value);
  } else if (typeof value === "string") {
    if (!/^-?\d+$/.test(value)) {
      throw new Error(`${field} must be an integer.`);
    }

    const bigValue = BigInt(value);

    if (
      bigValue > BigInt(Number.MAX_SAFE_INTEGER) ||
      bigValue < BigInt(Number.MIN_SAFE_INTEGER)
    ) {
      throw new Error(`${field} exceeds the safe integer range.`);
    }

    parsed = Number(bigValue);
  } else {
    parsed = value;
  }

  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`${field} must be a safe integer.`);
  }

  return parsed;
}

function parseGlobalPosition(
  value: string | number | bigint,
): string {
  const position = BigInt(value);

  if (position < 0n) {
    throw new Error("globalPosition cannot be negative.");
  }

  return position.toString();
}

function parseCreatedAt(
  value: Date | string | number,
): number {
  const timestamp =
    value instanceof Date
      ? value.getTime()
      : typeof value === "string"
        ? Date.parse(value)
        : value;

  if (!Number.isSafeInteger(timestamp) || timestamp < 0) {
    throw new Error("Invalid backend event createdAt.");
  }

  return timestamp;
}

export function backendEventToDomainEvent(
  remote: BackendEventWire,
): TransformedRemoteEvent {
  if (
    !remote.id ||
    !remote.businessId ||
    !remote.aggregateId ||
    !remote.aggregateType ||
    !remote.type ||
    !remote.userId ||
    !remote.deviceId
  ) {
    throw new Error("Backend event is missing required fields.");
  }

  if (
    remote.mode !== "OPENING" &&
    remote.mode !== "LIVE"
  ) {
    throw new Error(`Invalid event mode: ${remote.mode}`);
  }

  const aggregateVersion = parseSafeInteger(
    remote.aggregateVersion,
    "aggregateVersion",
  );

  if (aggregateVersion < 1) {
    throw new Error("aggregateVersion must be positive.");
  }

  const logicClock = parseSafeInteger(
    remote.logicClock,
    "logicClock",
  );

  const actor: ActorContext = {
    userId: remote.userId,
    deviceId: remote.deviceId,
  };

  const event: DomainEvent = {
    id: remote.id,
    businessId: remote.businessId,
    branchId: remote.branchId,
    aggregateId: remote.aggregateId,
    aggregateType: remote.aggregateType,

    // Assumes backend aggregateVersion is the resulting
    // version assigned to this event.
    expectedAggregateVersion: aggregateVersion - 1,

    type: remote.type,
    mode: remote.mode,
    payload: remote.payload,
    actor,

    // Your current frontend contract requires strings.
    // Use nullable fields instead if null is valid in your
    // domain event contract.
    causationId: remote.causationId ?? "",
    correlationId: remote.correlationId ?? "",

    logicClock,
    createdAt: parseCreatedAt(remote.createdAt),
    checksum: remote.checksum ?? "",
  };

  return {
    event,
    globalPosition: parseGlobalPosition(
      remote.globalPosition,
    ),
  };
}
