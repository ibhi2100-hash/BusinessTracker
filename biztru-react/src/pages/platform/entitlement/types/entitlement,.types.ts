
export type EntitlementType =
  | "QUANTITY"
  | "FEATURE"
  | "BOOLEAN";

export type EntitlementSource =
  | "PLAN"
  | "ADDON"
  | "PROMOTION"
  | "ADMIN_OVERRIDE";

export interface EntitlementDefinition {
  id: string;
  key: string;
  name: string;
  description: string;
  type: EntitlementType;
  unit?: string;
}

export interface TenantEntitlement {
  id: string;
  businessId: string;
  businessName: string;
  entitlementKey: string;
  name: string;
  source: EntitlementSource;
  allowedValue: number | boolean;
  consumedValue: number;
  effectiveFrom: string;
  effectiveUntil?: string;
  active: boolean;
}

export interface AccessRole {
  id: string;
  name: string;
  description: string;
  permissionCount: number;
  assignedUsers: number;
  systemRole: boolean;
}
