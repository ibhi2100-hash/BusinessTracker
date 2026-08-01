import { Migration } from "../../../clientDatabase/migrations/migrationContracts";

export const GET_CURRENT_LOGIC_CLOCK = 
    `
        SELECT value
        FROM logic_clock
        WHERE id = 1
    `

export const INCREMENT_CLOCK = 
     `
        UPDATE logic_clock
        SET value = ?
        WHERE id = 1
    `
