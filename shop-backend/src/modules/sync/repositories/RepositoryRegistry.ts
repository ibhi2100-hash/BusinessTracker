import { AuthRepository } from "../../auth/repository/auth.repository.js";
import { AggregateRepository } from "./aggregateRepository.js";
import { BranchRepository } from "./BranchRepository.js";
import { BusinessRepository } from "./BusinessRepository.js";
import { CustomersRepository } from "./CustomersRepository.js";
import { EmployeeCompensationRepository } from "../../employeeInvitations/repository/employee/EmployeeCompensationRepository.js";
import { EmployeeInvitationRepository } from "../../employeeInvitations/repository/EmployeeInvitationRepository.js";
import { EmployeeNotificationRepository } from "../../employeeInvitations/repository/employee/EmployeeNotificationRepository.js";
import { EmployeeRequestRepository } from "../../employeeInvitations/repository/employee/EmployeeRequestRepository.js";
import { EmployeeRepository } from "../../employeeInvitations/repository/employee/EmployeesRepository.js";
import { EventRepository } from "./eventRepository.js";
import { ExpenseRepository } from "./expenseRepository.js";
import { InventoryRepository } from "./InventoryRepository.js";
import { LedgerRepositoryImpl } from "./LedgerRepository.js";
import { OutboxRepository } from "./OutboxRepository.js";
import { ProductRepository } from "./ProductRepository.js";
import { SalesRepository } from "./SalesRepsotory.js";

export class RepositoryRegistry {
    readonly aggregates: AggregateRepository;

    readonly business: BusinessRepository;

    readonly branch: BranchRepository;

    readonly events: EventRepository;

    readonly outbox: OutboxRepository;

    readonly products: ProductRepository;

    readonly inventory: InventoryRepository;

    readonly customers: CustomersRepository;

    readonly employees: EmployeeRepository;

    readonly employeeInvitation: EmployeeInvitationRepository;

    readonly employeeRequest: EmployeeRequestRepository;
    
    readonly employeeCompensation: EmployeeCompensationRepository;

    readonly employeeNotification: EmployeeNotificationRepository;

    readonly sales: SalesRepository;

    readonly expense: ExpenseRepository;

    readonly ledger: LedgerRepositoryImpl;

    readonly user: AuthRepository;


    constructor(){
        this.aggregates = new AggregateRepository()

        this.business = new BusinessRepository()

        this.branch = new BranchRepository();

        this.events = new EventRepository();

        this.outbox = new OutboxRepository();

        this.products = new ProductRepository();

        this.inventory = new InventoryRepository();

        this.customers = new CustomersRepository();

        this.employees = new EmployeeRepository();

        this.employeeInvitation = new EmployeeInvitationRepository();

        this.employeeRequest = new EmployeeRequestRepository();

        this.employeeCompensation = new EmployeeCompensationRepository();

        this.employeeNotification = new EmployeeNotificationRepository();
        
        this.sales = new SalesRepository();

        this.expense = new ExpenseRepository();

        this.ledger = new LedgerRepositoryImpl();

        this.user = new AuthRepository();
    }
}