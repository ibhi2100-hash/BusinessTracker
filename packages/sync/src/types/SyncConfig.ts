import { ConflictResolver } from "../contracts/ConflictResolver";
import { ConnectivityProvider } from "../contracts/ConnectivityProvider";
import { SyncRepository } from "../contracts/SyncRepository";
import { SyncTransport } from "../contracts/SyncTransport";

export interface SyncConfig {

  repository: SyncRepository;

  transport: SyncTransport;

  connectivity: ConnectivityProvider;

  conflictResolver: ConflictResolver;

  maxRetry: number;
}