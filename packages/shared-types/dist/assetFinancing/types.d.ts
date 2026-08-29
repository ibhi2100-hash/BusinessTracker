export type AssetId = string & {
    readonly __brand: "AssetId";
};
export type AssetTypeId = string & {
    readonly __brand: "AssetTypeId";
};
export type OperatorId = string & {
    readonly __brand: "OperatorId";
};
export type FinancingApplicationId = string & {
    readonly __brand: "FinancingApplicationId";
};
export type FinancingContractId = string & {
    readonly __brand: "FinancingContractId";
};
export type RepaymentScheduleId = string & {
    readonly __brand: "RepaymentScheduleId";
};
export type InstallmentId = string & {
    readonly __brand: "InstallmentId";
};
export type PaymentId = string & {
    readonly __brand: "PaymentId";
};
export type DefaultCaseId = string & {
    readonly __brand: "DefaultCaseId";
};
export type RecoveryCaseId = string & {
    readonly __brand: "RecoveryCaseId";
};
export type CapitalAllocationId = string & {
    readonly __brand: "CapitalAllocationId";
};
export interface Money {
    readonly amount: bigint;
    readonly currency: Currency;
}
export type Currency = "NGN";
export type ISODate = string & {
    readonly __brand: "ISODate";
};
export type ISODateTime = string & {
    readonly __brand: "ISODateTime";
};
export interface Duration {
    readonly value: number;
    readonly unit: "day" | "week" | "month" | "year";
}
export type AssetStatus = "available" | "reserved" | "deployed" | "maintenance" | "delinquent" | "recovery" | "repossessed" | "liquidated" | "retired";
export type AssetCondition = "new" | "excellent" | "good" | "fair" | "poor" | "damaged";
export interface Asset {
    readonly id: AssetId;
    readonly assetTypeId: AssetTypeId;
    readonly acquisitionCost: Money;
    readonly acquisitionDate: ISODate;
    readonly status: AssetStatus;
    readonly condition: AssetCondition;
    readonly manufacturer?: string;
    readonly model?: string;
    readonly serialNumber?: string;
    readonly chassisNumber?: string;
    readonly engineNumber?: string;
    readonly registrationNumber?: string;
    readonly currentLocationId?: string;
    readonly marketValue?: Money;
    readonly metadata: Record<string, unknown>;
}
export interface AssetType {
    readonly id: AssetTypeId;
    readonly code: string;
    readonly name: string;
    readonly category: "mobility" | "energy" | "electronics" | "agriculture" | "industrial" | "other";
    readonly productive: boolean;
    readonly requiresRegistration: boolean;
    readonly requiresInsurance: boolean;
    readonly requiresInspection: boolean;
    readonly expectedUsefulLife?: Duration;
    readonly metadata: Record<string, unknown>;
}
export type OperatorStatus = "prospect" | "verified" | "active" | "suspended" | "blacklisted" | "inactive";
export interface Operator {
    readonly id: OperatorId;
    readonly partyId: string;
    readonly status: OperatorStatus;
    readonly verificationStatus: "pending" | "verified" | "failed";
    readonly riskGrade?: RiskGrade;
    readonly guarantorIds: string[];
    readonly activeContractIds: FinancingContractId[];
}
export type RiskGrade = "A" | "B" | "C" | "D" | "E";
export interface FinancingProduct {
    readonly id: string;
    readonly name: string;
    readonly supportedAssetTypes: AssetTypeId[];
    readonly ownershipModel: OwnershipModel;
    readonly pricing: PricingPolicy;
    readonly depositPolicy: DepositPolicy;
    readonly termPolicy: TermPolicy;
    readonly paymentPolicy: PaymentPolicy;
    readonly defaultPolicy: DefaultPolicy;
}
export type PricingModel = "fixed_total_price" | "principal_plus_markup" | "interest_rate" | "custom";
export interface PricingPolicy {
    readonly model: PricingModel;
    readonly markupRate?: number;
    readonly interestRate?: number;
    readonly fixedContractPrice?: Money;
}
export interface TermPolicy {
}
export interface DefaultPolicy {
}
export interface DepositPolicy {
    readonly required: boolean;
    readonly minimumAmount?: Money;
    readonly minimumPercentage?: number;
    readonly maximumPercentage?: number;
}
export type PaymentFrequency = "daily" | "weekly" | "biweekly" | "monthly";
export interface PaymentPolicy {
    readonly frequency: PaymentFrequency;
    readonly fixedAmount?: Money;
    readonly installmentCount?: number;
    readonly dueDay?: number;
    readonly gracePeriodDays: number;
}
export type FinancingApplicationStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "expired" | "converted";
export interface FinancingApplication {
    readonly id: FinancingApplicationId;
    readonly applicantId: string;
    readonly financingProductId: string;
    readonly assetTypeId: AssetTypeId;
    readonly requestedAssetValue: Money;
    readonly proposedDeposit: Money;
    readonly proposedTerm: Duration;
    readonly status: FinancingApplicationStatus;
    readonly submittedAt?: ISODateTime;
    readonly decision?: FinancingDecision;
}
export interface FinancingDecision {
    readonly outcome: "approved" | "rejected";
    readonly riskGrade: RiskGrade;
    readonly approvedAssetValue?: Money;
    readonly approvedDeposit?: Money;
    readonly approvedTerm?: Duration;
    readonly installmentAmount?: Money;
    readonly expectedLoss?: Money;
    readonly reasons: string[];
    readonly decidedAt: ISODateTime;
}
export type FinancingContractStatus = "draft" | "pending_activation" | "active" | "delinquent" | "default" | "recovery" | "completed" | "terminated" | "cancelled";
export interface FinancingContract {
    readonly id: FinancingContractId;
    readonly applicationId: FinancingApplicationId;
    readonly financingProductId: string;
    readonly assetId: AssetId;
    readonly operatorId: OperatorId;
    readonly financierId: string;
    readonly ownershipModel: OwnershipModel;
    readonly acquisitionCost: Money;
    readonly deposit: Money;
    readonly financedAmount: Money;
    readonly contractualPrice: Money;
    readonly term: Duration;
    readonly paymentFrequency: PaymentFrequency;
    readonly installmentAmount: Money;
    readonly startDate: ISODate;
    readonly maturityDate: ISODate;
    readonly status: FinancingContractStatus;
}
export interface RepaymentSchedule {
    readonly id: RepaymentScheduleId;
    readonly contractId: FinancingContractId;
    readonly installments: readonly RepaymentInstallment[];
    readonly totalDue: Money;
    readonly totalPaid: Money;
    readonly totalOutstanding: Money;
}
export type InstallmentStatus = "scheduled" | "due" | "partially_paid" | "paid" | "overdue" | "waived" | "cancelled";
export interface RepaymentInstallment {
    readonly id: InstallmentId;
    readonly sequence: number;
    readonly dueDate: ISODate;
    readonly amountDue: Money;
    readonly amountPaid: Money;
    readonly amountOutstanding: Money;
    readonly status: InstallmentStatus;
}
export interface PaymentAllocation {
    readonly installmentId: InstallmentId;
    readonly amount: Money;
}
export interface AssetRegistered {
    readonly type: "asset.registered";
    readonly aggregateId: AssetId;
    readonly payload: {
        assetTypeId: AssetTypeId;
        acquisitionCost: Money;
    };
}
export interface FinancingApplicationSubmitted {
    readonly type: "financing.application.submitted";
    readonly aggregateId: FinancingApplicationId;
    readonly payload: {
        applicantId: string;
        financingProductId: string;
        assetTypeId: AssetTypeId;
        requestedAssetValue: Money;
    };
}
export interface FinancingApplicationApproved {
    readonly type: "financing.application.approved";
    readonly aggregateId: FinancingApplicationId;
    readonly payload: FinancingDecision;
}
export interface FinancingContractActivated {
    readonly type: "financing.contract.activated";
    readonly aggregateId: FinancingContractId;
    readonly payload: {
        assetId: AssetId;
        operatorId: OperatorId;
        startDate: ISODate;
    };
}
export interface FinancingPaymentRecorded {
    readonly type: "financing.payment.recorded";
    readonly aggregateId: FinancingContractId;
    readonly payload: {
        paymentId: PaymentId;
        amount: Money;
        receivedAt: ISODateTime;
    };
}
export interface CapitalAllocated {
    readonly type: "capital.allocated";
    readonly aggregateId: CapitalAllocationId;
    readonly payload: {
        contractId: FinancingContractId;
        assetId: AssetId;
        capitalAccountId: string;
        amount: Money;
    };
}
export interface InstallmentBecameOverdue {
    readonly type: "financing.installment.overdue";
    readonly aggregateId: FinancingContractId;
    readonly payload: {
        installmentId: InstallmentId;
        amountOutstanding: Money;
        dueDate: ISODate;
        daysPastDue: number;
    };
}
export interface DefaultCaseOpened {
    readonly type: "financing.default.opened";
    readonly aggregateId: DefaultCaseId;
    readonly payload: {
        contractId: FinancingContractId;
        operatorId: OperatorId;
        amountPastDue: Money;
        daysPastDue: number;
    };
}
export interface RecoveryCaseOpened {
    readonly type: "financing.recovery.opened";
    readonly aggregateId: RecoveryCaseId;
    readonly payload: {
        contractId: FinancingContractId;
        assetId: AssetId;
        defaultCaseId: DefaultCaseId;
    };
}
export interface AssetRepossessed {
    readonly type: "asset.repossessed";
    readonly aggregateId: AssetId;
    readonly payload: {
        recoveryCaseId: RecoveryCaseId;
        recoveredAt: ISODateTime;
        condition: AssetCondition;
    };
}
export interface FinancingContractCompleted {
    readonly type: "financing.contract.completed";
    readonly aggregateId: FinancingContractId;
    readonly payload: {
        assetId: AssetId;
        operatorId: OperatorId;
        completedAt: ISODateTime;
        totalCollected: Money;
    };
}
export interface AssetOwnershipTransferred {
    readonly type: "asset.ownership.transferred";
    readonly aggregateId: AssetId;
    readonly payload: {
        fromOwnerId: string;
        toOwnerId: string;
        reason: "financing_completed";
    };
}
export interface OwnershipModel {
}
