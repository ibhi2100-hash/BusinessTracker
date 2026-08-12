export const CURRENT_STATE = 
                        `
                            SELECT *
                            FROM application_state
                            WHERE id = 1;
                        `

export const UPDATE_CURRENT_BUSINESS = 
                `
                UPDATE application_state
                SET 
                    currentBusinessId = ?,
                    currentBranchId = NULL
                WHERE id = 1;
                `
export const UPDATE_CURRENT_BRANCH = 
                `
                UPDATE application_state
                SET 
                    currentBranchId = ?
                WHERE id = 1;
                `

export const UPDATE_USER_DATA = 
                `
                UPDATE application_state
                SET
                    currentUserId = ?,
                    currentSessionId = ?
                WHERE id = 1;
                `
export const UPDATE_USER_LOGOUT = 
                `
                UPDATE application_state
                SET
                    currentUserId = NULL,
                    currentSessionId = NULL,
                    currentBusinessId = NULL,
                    currentBranchId = NULL;
                `

export const UPDATE_WORKSPACE = 
                `
                UPDATE application_state
                SET
                    currentWorkspaceId = ?,
                    currentWorkspaceVersion = ?
                WHERE id = 1;
       
       
         `

export const SAVED_ROUTE = 
                `
                UPDATE application_state
                SET 
                    lastRoute = ?
                WHERE id = 1;
                `

export const GET_LASTROUTE = `
    SELECT lastRoute
    FROM application_state
    WHERE id = 1
`