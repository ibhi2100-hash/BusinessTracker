import { Command } from "../../KarnelTypes/types";

export interface CommandValidator {
    validate(command: Command, schema: any): void;
}