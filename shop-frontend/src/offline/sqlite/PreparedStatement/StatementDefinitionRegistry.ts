import { EventDefinitions } from "../businessDatabase/statements/events/EventDefinitions"
export class StatementDefinitionRegistry {
    difinitions(){
        return [
            ...EventDefinitions,
        ]
    }
}