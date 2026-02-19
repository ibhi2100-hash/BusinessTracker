export interface CreateBranchDto {
    name: string;
    address: string;
    phone : string;

}

export interface CreateManyBranchDto {
    branches: CreateBranchDto[];
}