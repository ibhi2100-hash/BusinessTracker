import { CommandContext } from "../factoryDependencies/EventContext";
export interface AggregateIdentity {

    aggregateId: string;

    aggregateVersion: number;

    aggregateType: string

}
export interface AggregateIdentityProvider {
    resolve(
        descriptor: CommandDescriptor,
        payload: unknown,
        context: CommandContext,
    ): Promise<AggregateIdentity>
}