import { CurrentBusinessStatements } from "../../statements/currentBusiness/currentBusinessStatements";

export interface CurrentBusiness {
    id: number;
    businessId: string | null;
    businessName?: string | null;
    businessCode: string | null;
    stage?: string;
    status?: string;
    databaseVersion?: number;
    schemaVersion?: number;
    lastSequenceNumber?: number;
    initializedAt: number | null;
    activatedAt?: number | null;
    lastOpenedAt?: number | null;
    updatedAt?: number | null;
}

export class CurrentBusinessRepository {
    constructor(
        private readonly statements: CurrentBusinessStatements
    ) {}

    async save(currentBusiness: CurrentBusiness): Promise<void> {
        await this.statements.update.execute(
            CurrentBusinessMapper.toUpsertRow(currentBusiness)
        );
        const current = await this.find();
        console.log("This is the CurrentBusiness: ", current)
    }

    async find(): Promise<CurrentBusiness | undefined> {
        const rows = await this.statements.find.query<CurrentBusiness>();
        return rows[0]
    }
}

class CurrentBusinessMapper {
    static toUpsertRow(
        currentBusiness: CurrentBusiness
    ): readonly unknown[] {
        return [
            currentBusiness.businessId,
            currentBusiness.businessName ?? null,
            currentBusiness.businessCode,
            currentBusiness.stage ?? "ONBOARDING",
            currentBusiness.status ?? "CREATED",
            currentBusiness.databaseVersion ?? 1,
            currentBusiness.schemaVersion ?? 1,
            currentBusiness.lastSequenceNumber ?? 0,
            currentBusiness.initializedAt,
            currentBusiness.activatedAt ?? null,
            currentBusiness.lastOpenedAt ?? null,
            currentBusiness.updatedAt ?? null,
        ];
    }
}