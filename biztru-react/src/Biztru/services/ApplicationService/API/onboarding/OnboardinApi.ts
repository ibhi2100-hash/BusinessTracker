
import { AggregateType } from "../../../../../offline/domain/aggregate";

import type {
  CommandIntent,
} from "../../../../BizTru_Karnel/CommandFactory/CommandIntent";

import { BusinessManager } from "../../../../Composer/BusinessManager";

import {
  BusinessEventTypes,
} from "@business/shared-types";

import type {
  CreateBusinessRequest,
} from "../types";

import type {
  BranchCreationRequest,
  BranchPayload,
} from "../branch/branchRequest";

/* ============================================================
   BUSINESS EVENT PAYLOAD
   ============================================================ */

interface BusinessPayload {
  id: string;

  name: string;
  legalName?: string | null;

  businessType?: string | null;
  industry?: string | null;
  legalStructure?: string | null;

  countryCode: string;
  countryName: string;

  currencyCode: string;
  currencyName: string;
  currencySymbol: string;

  timezone: string;

  address?: string | null;

  email?: string | null;
  phone?: string | null;
  website?: string | null;

  registrationNumber?: string | null;
  taxId?: string | null;
}

/* ============================================================
   WORKSPACE CREATION REQUEST
   ============================================================ */

export interface CreateBusinessWorkspaceRequest {
  business: CreateBusinessRequest;
  primaryBranch: BranchCreationRequest;
}

/* ============================================================
   WORKSPACE CREATION RESULT
   ============================================================ */

export interface CreateBusinessWorkspaceResult {
  businessId: string;
  branchId: string;
}

/* ============================================================
   ONBOARDING API
   ============================================================ */

export class OnboardingApi {
  private readonly manager: BusinessManager;

  constructor(manager: BusinessManager) {
    this.manager = manager;
  }

  /* ==========================================================
     BUSINESS PAYLOAD
     ========================================================== */

  private buildBusinessPayload(
    request: CreateBusinessRequest
  ): BusinessPayload {
    return {
      id: request.id,

      name: request.name.trim(),
      legalName: request.legalName ?? null,

      businessType: request.businessType ?? null,
      industry: request.industry ?? null,
      legalStructure: request.legalStructure ?? null,

      countryCode: request.countryCode,
      countryName: request.countryName,

      currencyCode: request.currencyCode,
      currencyName: request.currencyName,
      currencySymbol: request.currencySymbol,

      timezone: request.timezone,

      address: request.address ?? null,

      email: request.email ?? null,
      phone: request.phone ?? null,
      website: request.website ?? null,

      registrationNumber:
        request.registrationNumber ?? null,

      taxId: request.taxId ?? null,
    };
  }

  /* ==========================================================
     CREATE BUSINESS COMMAND
     ========================================================== */

  private async executeBusinessCreation(
    app: Awaited<ReturnType<BusinessManager["bootstrap"]>>,
    request: CreateBusinessRequest
  ) {
    const intent: CommandIntent<BusinessPayload> = {
      aggregateId: request.id,
      aggregateType: AggregateType.BUSINESS,
      type: BusinessEventTypes.BUSINESS_CREATED,
      mode: "OPENING",

      payload: this.buildBusinessPayload(request),
    };

    const command =
      await app.domain.commandFactory.create(intent);

    await app.domain.kernel.execute(command);
  }

  /* ==========================================================
     CREATE BRANCH COMMAND
     ========================================================== */

  private async executeBranchCreation(
    app: Awaited<ReturnType<BusinessManager["bootstrap"]>>,
    request: BranchCreationRequest
  ) {
    const branchIntent: CommandIntent<BranchPayload> = {
      type: BusinessEventTypes.BRANCH_CREATED,

      aggregateId: request.id,
      aggregateType: AggregateType.BRANCH,

      mode: "OPENING",

      payload: {
        id: request.id,
        name: request.name.trim(),
        address: request.address || undefined,
        phone: request.phone || undefined,
      },
    };

    const command =
      await app.domain.commandFactory.create(branchIntent);

    await app.domain.kernel.execute(command);
  }

  /* ==========================================================
     CREATE BUSINESS WORKSPACE
     
     Creates:
       1. Business
       2. Primary branch

     Both commands use the SAME application instance.
     ========================================================== */

  async createBusinessWorkspace(
    request: CreateBusinessWorkspaceRequest
  ): Promise<CreateBusinessWorkspaceResult> {

    const {
      business,
      primaryBranch,
    } = request;

    if (!business.id) {
      throw new Error("Business ID is required.");
    }

    if (!primaryBranch.id) {
      throw new Error("Primary branch ID is required.");
    }

    if (!business.name.trim()) {
      throw new Error("Business name is required.");
    }

    if (primaryBranch.businessId !== business.id) {
      throw new Error(
        "Primary branch must belong to the created business."
      );
    }

    if (!business.countryCode || !business.currencyCode) {
      throw new Error(
        "Business country and currency are required."
      );
    }

    if (!business.timezone) {
      throw new Error(
        "Business timezone is required."
      );
    }

    /*
     * 1. Bootstrap the business application.
     */

    const app = await this.manager.bootstrap(business.id);

    if (!app) {
      throw new Error(
        "Could not initialize the business application."
      );
    }

    /*
     * 2. Create business aggregate.
     */

    await this.executeBusinessCreation(
      app,
      business
    );

    /*
     * 3. Create primary branch aggregate.
     *
     * Do not call manager.current() here.
     * Use the application returned by bootstrap().
     */

    await this.executeBranchCreation(
      app,
      primaryBranch
    );

    return {
      businessId: business.id,
      branchId: primaryBranch.id,
    };
  }

  /* ==========================================================
     LEGACY: CREATE BUSINESS
     ========================================================== */

  async createBusiness(
    request: CreateBusinessRequest
  ) {
    const app = await this.manager.bootstrap(request.id);

    if (!app) {
      throw new Error(
        "Could not initialize the business application."
      );
    }

    await this.executeBusinessCreation(
      app,
      request
    );
  }

  /* ==========================================================
     LEGACY: CREATE MAIN BRANCH
     ========================================================== */

  async createMainBranch(
    request: BranchCreationRequest
  ) {
    const app = await this.manager.current();

    if (!app) {
      throw new Error(
        "Business application does not exist."
      );
    }

    await this.executeBranchCreation(
      app,
      request
    );
  }

  /* ==========================================================
     ACTIVATE BUSINESS
     ========================================================== */

  async activateBusiness(businessId: string) {

    if (!businessId) {
      throw new Error("Business ID is required.");
    }

    const app = await this.manager.current();

    if (!app) {
      throw new Error(
        "Business application does not exist."
      );
    }

    const intent: CommandIntent<any> = {
      aggregateId: businessId,
      aggregateType: AggregateType.BUSINESS,

      type: BusinessEventTypes.BUSINESS_ACTIVATION,

      mode: "OPENING",

      payload: {},
    };

    const command =
      await app.domain.commandFactory.create(intent);

    await app.domain.kernel.execute(command);
  }
}
