export class BusinessApi {

    constructor(
        readonly business: BusinessAPI,
        
        readonly branch: BranchApi,

        readonly sales: SalesApi,

        readonly inventory: InventoryApi,

        readonly customers: CustomerApi,

        readonly suppliers: SupplierApi,

        readonly finance: FinanceApi,

        readonly employees: EmployeeApi

    ){}

}