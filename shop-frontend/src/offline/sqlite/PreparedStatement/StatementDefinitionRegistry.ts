import { EventDefinition } from "../businessDatabase/statements/events/EventDefinitions";

export class StatementDefinitionRegistry {
    difinitions(){
        return [
            ...EventDefinition,
            ...UserDefinition
        ]
    }
}