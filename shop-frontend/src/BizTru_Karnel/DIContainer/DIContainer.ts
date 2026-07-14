export class DIContainer {
    private static instance: DIContainer;

    private services: Map<string, any>=
    new Map();

    private factories: Map<string, ()=> any>=
    new Map();

    private singletons: Set<string> =
    new Set();

    activeBusiness
}