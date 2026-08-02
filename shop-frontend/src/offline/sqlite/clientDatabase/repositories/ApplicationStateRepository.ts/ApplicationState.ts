export interface ApplicationState {
    id: 1;

    currentBusinessId: string | null;

    currentBranchId: string | null;

    currentUserId: string | null;

    currentSessionId: string | null;

    currentWorkspaceVersion: number;

    initializedAt: number;
}