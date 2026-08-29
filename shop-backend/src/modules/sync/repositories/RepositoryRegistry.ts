import { AggregateRepository } from "./aggregateRepository.js";
import { BranchRepository } from "./BranchRepository.js";
import { BusinessRepository } from "./BusinessRepository.js";
import { CustomersRepository } from "./CustomersRepository.js";
import { EmployeesRepository } from "./EmployeesRepository.js";
import { InventoryRepository } from "./InventoryRepository.js";
import { LedgerRepository } from "./LedgerRepository.js";
import { ProductRepository } from "./ProductRepository.js";
import { SalesRepository } from "./SalesRepsotory.js";

export class RepositoryRegistry {
    readonly aggregates: AggregateRepository;

    readonly business: BusinessRepository;

    readonly branch: BranchRepository;

    readonly products: ProductRepository;

    readonly inventory: InventoryRepository;

    readonly customers: CustomersRepository;

    readonly employess: EmployeesRepository;

    readonly sales: SalesRepository;

    readonly ledger: LedgerRepository;


    constructor(){
        this.aggregates = new AggregateRepository()

        this.business = new BusinessRepository()

        this.branch = new BranchRepository();

        this.products = new ProductRepository();

        this.inventory = new InventoryRepository();

        this.customers = new CustomersRepository();

        this.employess = new EmployeesRepository();

        this.sales = new SalesRepository();

        this.ledger = new LedgerRepository();
    }
}