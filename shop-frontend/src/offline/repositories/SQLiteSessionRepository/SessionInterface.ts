export interface Session {
    id: string;

    userId: string;

    accessToken: string;

    refreshToken: string;

    expiresAt: number;

    createdAt: number;

}

export interface SessionRepositoryContract{
    saveSession(session: Session): Promise<void>;
    getCurrentSession(): Promise<Session | undefined>;
    clearSession(): Promise<void>
}