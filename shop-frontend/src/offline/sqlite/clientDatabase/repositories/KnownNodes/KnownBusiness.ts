interface KnownBusiness {

    id: string;

    name: string;

    address: string;

    status: "ONBOARDING" | "ACTIVE";

    createdAt: string;

    lastOpenedAt?: string;

    icon?: string;

}