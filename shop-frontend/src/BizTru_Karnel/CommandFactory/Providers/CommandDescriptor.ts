export interface CommandDescriptorProvider {
    resolve(
        type: string
    ): Promise<CommandDescriptor>;
}