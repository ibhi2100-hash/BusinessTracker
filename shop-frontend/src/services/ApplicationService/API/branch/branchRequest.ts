export interface BranchCreationRequest {
    id: string;
    businessId: string;
    name: string;
    address?: string;
    phone?: string;

}
export interface BranchPayload {
    id: string;
    name: string;
    address?: string;
    phone?: string;
}