import { BusinessPreparedStatementManager } from "./PreparedStatementManager";
import { BranchStatements } from "./branch/BranchStatements";
import { BusinessStatements } from "./business/BusinessStatements";
import { EmployeesStatements } from "./employees/EmployeesStatements";
import { EventStatements } from "./events/EventStatements";
import { InventoryStatements } from "./inventory/InventoryStatements";
import { ProductStatements } from "./products/ProductStatements";
import { PreparedStatementManager } from "../../PreparedStatement/PreparedStatementManager";
import { LogicClockStatements } from "./logicClock/logicClockStatements"
import { SalesStatement } from "./sales/salesStatements";

export class BusinessStatementRegistry {
    readonly events: EventStatements;
    readonly inventory: InventoryStatements;
    readonly products: ProductStatements;
    readonly sales: SalesStatement;
    readonly business: BusinessStatements;
    readonly branches: BranchStatements;
    readonly employees: EmployeesStatements;
    readonly logicClock: LogicClockStatements

    constructor(
        manager: PreparedStatementManager
    ){
        this.events =
            new EventStatements(manager);

        this.inventory =
            new InventoryStatements(manager);
        
        this.products = 
            new ProductStatements(manager);
        
        this.sales =  
            new SalesStatement(manager)

        this.business = 
            new BusinessStatements(manager);
        
        this.branches =
            new BranchStatements(manager);

        this.employees = 
            new EmployeesStatements(manager);

        this.logicClock = 
            new LogicClockStatements(manager)
    }
}