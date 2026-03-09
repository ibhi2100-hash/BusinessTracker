export interface AuthUser {
  id: string;
  email: string;
  businessId: string;
  branchId: string;   // active branch context
  role?: "ADMIN" | "STAFF"; 
  
}
