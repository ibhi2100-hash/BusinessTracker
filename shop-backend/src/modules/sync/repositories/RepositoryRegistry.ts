import { AggregateRepository } from "./aggregateRepository.js";
import { BranchRepository } from "./BranchRepository.js";
import { BusinessRepository } from "./BusinessRepository.js";
import { CustomersRepository } from "./CustomersRepository.js";
import { EmployeesRepository } from "./EmployeesRepository.js";
import { EventRepository } from "./eventRepository.js";
import { InventoryRepository } from "./InventoryRepository.js";
import { LedgerRepositoryImpl } from "./LedgerRepository.js";
import { ProductRepository } from "./ProductRepository.js";
import { SalesRepository } from "./SalesRepsotory.js";

export class RepositoryRegistry {
    readonly aggregates: AggregateRepository;

    readonly business: BusinessRepository;

    readonly branch: BranchRepository;

    readonly events: EventRepository;

    readonly products: ProductRepository;

    readonly inventory: InventoryRepository;

    readonly customers: CustomersRepository;

    readonly employess: EmployeesRepository;

    readonly sales: SalesRepository;

    readonly ledger: LedgerRepositoryImpl;


    constructor(){
        this.aggregates = new AggregateRepository()

        this.business = new BusinessRepository()

        this.branch = new BranchRepository();

        this.events = new EventRepository()

        this.products = new ProductRepository();

        this.inventory = new InventoryRepository();

        this.customers = new CustomersRepository();

        this.employess = new EmployeesRepository();

        this.sales = new SalesRepository();

        this.ledger = new LedgerRepositoryImpl();
    }
}