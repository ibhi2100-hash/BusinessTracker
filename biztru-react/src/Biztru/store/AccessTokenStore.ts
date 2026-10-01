class AccessTokenStore {

    private token: string | null = null;

    get(): string | null {
        return this.token;
    }

    set(token: string): void {
        this.token = token;
    }

    clear(): void {
        this.token = null;
    }
}

export const accessTokenStore =
    new AccessTokenStore();