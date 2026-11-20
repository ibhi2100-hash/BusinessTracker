
export type TenantStatus =
  | "ACTIVE"
  | "TRIAL"
  | "SUSPENDED"
  | "PENDING"
  | "CANCELLED";

export interface TenantBranch {
  id: string;
  name: string;
  code: string;
  address: string;
  status: "ACTIVE" | "INACTIVE";
  employeeCount: number;
}

export interface Tenant {
  id: string;
  businessName: string;
  businessCode: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  industry: string;
  status: TenantStatus;
  planName: string;
  branchCount: number;
  employeeCount: number;
  productCount: number;
  createdAt: string;
  lastActiveAt: string;
  currency: string;
  branches: TenantBranch[];
}

export interface TenantFilters {
  search: string;
  status: TenantStatus | "ALL";
  industry: string;
  plan: string;
}

export interface TenantSummary {
  total: number;
  active: number;
  trial: number;
  suspended: number;
  pending: number;
}
