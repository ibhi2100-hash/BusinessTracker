
import type { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { EMPLOYEE_SQL } from "./sql";
import { employeeKeys } from "./employeeKeys";

export const EmployeeStatementDefinitions: readonly StatementDefinition[] = [
  // Employees
  { key: employeeKeys.insert, sql: EMPLOYEE_SQL.INSERT },
  { key: employeeKeys.update, sql: EMPLOYEE_SQL.UPDATE },
  { key: employeeKeys.findById, sql: EMPLOYEE_SQL.FIND_BY_ID },
  { key: employeeKeys.findByBusiness, sql: EMPLOYEE_SQL.FIND_BY_BUSINESS },
  { key: employeeKeys.findByBranch, sql: EMPLOYEE_SQL.FIND_BY_BRANCH },
  { key: employeeKeys.findByUser, sql: EMPLOYEE_SQL.FIND_BY_USER },
  { key: employeeKeys.findReports, sql: EMPLOYEE_SQL.FIND_REPORTS },
  { key: employeeKeys.delete, sql: EMPLOYEE_SQL.DELETE },
  { key: employeeKeys.updateStatus, sql: EMPLOYEE_SQL.UPDATE_STATUS },
  { key: employeeKeys.updateUser, sql: EMPLOYEE_SQL.UPDATE_USER },
  { key: employeeKeys.updateJoined, sql: EMPLOYEE_SQL.UPDATE_JOINED },
  { key: employeeKeys.updateRole, sql: EMPLOYEE_SQL.UPDATE_ROLE },
  { key: employeeKeys.updateBranch, sql: EMPLOYEE_SQL.UPDATE_BRANCH },
  { key: employeeKeys.updateReportsTo, sql: EMPLOYEE_SQL.UPDATE_REPORTS_TO },

  // Invitations
  { key: employeeKeys.insertInvitation, sql: EMPLOYEE_SQL.INSERT_INVITATION },
  { key: employeeKeys.updateInvitation, sql: EMPLOYEE_SQL.UPDATE_INVITATION },
  { key: employeeKeys.findInvitationById, sql: EMPLOYEE_SQL.FIND_INVITATION_BY_ID },
  { key: employeeKeys.findInvitationsByEmployee, sql: EMPLOYEE_SQL.FIND_INVITATIONS_BY_EMPLOYEE },
  { key: employeeKeys.findInvitationsByBusiness, sql: EMPLOYEE_SQL.FIND_INVITATIONS_BY_BUSINESS },
  { key: employeeKeys.updateInvitationStatus, sql: EMPLOYEE_SQL.UPDATE_INVITATION_STATUS },
  { key: employeeKeys.acceptInvitation, sql: EMPLOYEE_SQL.ACCEPT_INVITATION },
  { key: employeeKeys.revokeInvitation, sql: EMPLOYEE_SQL.REVOKE_INVITATION },
  { key: employeeKeys.expireInvitation, sql: EMPLOYEE_SQL.EXPIRE_INVITATION },

  // Current compensation
  { key: employeeKeys.upsertCompensation, sql: EMPLOYEE_SQL.UPSERT_COMPENSATION },
  { key: employeeKeys.updateCompensation, sql: EMPLOYEE_SQL.UPDATE_COMPENSATION },
  { key: employeeKeys.findCompensationByEmployee, sql: EMPLOYEE_SQL.FIND_COMPENSATION_BY_EMPLOYEE },

  // Compensation history
  { key: employeeKeys.insertCompensationHistory, sql: EMPLOYEE_SQL.INSERT_COMPENSATION_HISTORY },
  { key: employeeKeys.closeOpenCompensationHistory, sql: EMPLOYEE_SQL.CLOSE_OPEN_COMPENSATION_HISTORY },
  { key: employeeKeys.findCompensationHistory, sql: EMPLOYEE_SQL.FIND_COMPENSATION_HISTORY },

  // Requests
  { key: employeeKeys.insertRequest, sql: EMPLOYEE_SQL.INSERT_REQUEST },
  { key: employeeKeys.updateRequest, sql: EMPLOYEE_SQL.UPDATE_REQUEST },
  { key: employeeKeys.updateRequestAssignment, sql: EMPLOYEE_SQL.UPDATE_REQUEST_ASSIGNMENT },
  { key: employeeKeys.updateRequestResolution, sql: EMPLOYEE_SQL.UPDATE_REQUEST_RESOLUTION },
  { key: employeeKeys.findRequestById, sql: EMPLOYEE_SQL.FIND_REQUEST_BY_ID },
  { key: employeeKeys.findRequestsByBusiness, sql: EMPLOYEE_SQL.FIND_REQUESTS_BY_BUSINESS },
  { key: employeeKeys.findRequestsByBranch, sql: EMPLOYEE_SQL.FIND_REQUESTS_BY_BRANCH },
  { key: employeeKeys.findRequestsByAssignee, sql: EMPLOYEE_SQL.FIND_REQUESTS_BY_ASSIGNEE },
  { key: employeeKeys.findRequestsByStatus, sql: EMPLOYEE_SQL.FIND_REQUESTS_BY_STATUS },

  // Notifications
  { key: employeeKeys.insertNotification, sql: EMPLOYEE_SQL.INSERT_NOTIFICATION },
  { key: employeeKeys.markNotificationRead, sql: EMPLOYEE_SQL.MARK_NOTIFICATION_READ },
  { key: employeeKeys.findNotificationsByEmployee, sql: EMPLOYEE_SQL.FIND_NOTIFICATIONS_BY_EMPLOYEE },
  { key: employeeKeys.findUnreadNotifications, sql: EMPLOYEE_SQL.FIND_UNREAD_NOTIFICATIONS },

  // Projection reset
  { key: employeeKeys.resetEmployees, sql: EMPLOYEE_SQL.RESET_EMPLOYEES },
  { key: employeeKeys.resetInvitations, sql: EMPLOYEE_SQL.RESET_INVITATIONS },
  { key: employeeKeys.resetCompensation, sql: EMPLOYEE_SQL.RESET_COMPENSATION },
  { key: employeeKeys.resetCompensationHistory, sql: EMPLOYEE_SQL.RESET_COMPENSATION_HISTORY },
  { key: employeeKeys.resetNotifications, sql: EMPLOYEE_SQL.RESET_NOTIFICATIONS },
];
