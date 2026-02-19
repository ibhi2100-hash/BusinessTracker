export interface AuthUser {
  id: string;
  businessId: string;
  branchId?: string;   // active branch context
  role?: string;       // optional for RBAC
}
