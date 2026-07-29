import { BusinessPreparedStatementManager } from "./PreparedStatementManager";
import { BranchStatements } from "./branch/BranchStatements";
import { BusinessStatements } from "./business/BusinessStatements";
import { EmployeesStatements } from "./employees/EmployeesStatements";
import { EventStatements } from "./events/EventStatements";
import { InventoryStatements } from "./inventory/InventoryStatements";
import { ProductStatements } from "./products/ProductStatements";
import { UserStatements } from "../../clientDatabase/statements/users/UserStatements";
import { PreparedStatementManager } from "../../PreparedStatement/PreparedStatementManager";

export class StatementRegistry {
    readonly events: EventStatements;
    readonly inventory: InventoryStatements;
    readonly products: ProductStatements;
    readonly business: BusinessStatements;
    readonly branches: BranchStatements;
    readonly employees: EmployeesStatements;

    constructor(
        manager: PreparedStatementManager
    ){
        this.events 
            new EventStatements(manager);

        this.inventory =
            new InventoryStatements(manager);
        
        this.products = 
            new ProductStatements(manager);
        
        this.business = 
            new BusinessStatements(manager);
        
        this.branches =
            new BranchStatements(manager);

        this.employees = 
            new EmployeesStatements(manager)
    }
}