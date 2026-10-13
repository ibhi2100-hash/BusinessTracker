
import type { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { employeeKeys } from "./employeeKeys";

export class EmployeeStatements {
    private readonly manager: PreparedStatementManager;
  constructor(
    manager: PreparedStatementManager,
  ) {
    this.manager = manager
  }

  // =========================================================
  // EMPLOYEES
  // =========================================================

  get insert() {
    return this.manager.get(employeeKeys.insert);
  }

  get update() {
    return this.manager.get(employeeKeys.update);
  }

  get findById() {
    return this.manager.get(employeeKeys.findById);
  }

  get findByBusiness() {
    return this.manager.get(employeeKeys.findByBusiness);
  }

  get findByBranch() {
    return this.manager.get(employeeKeys.findByBranch);
  }

  get findByUser() {
    return this.manager.get(employeeKeys.findByUser);
  }

  get findReports() {
    return this.manager.get(employeeKeys.findReports);
  }

  get delete() {
    return this.manager.get(employeeKeys.delete);
  }

  get updateStatus() {
    return this.manager.get(employeeKeys.updateStatus);
  }

  get updateUser() {
    return this.manager.get(employeeKeys.updateUser);
  }

  get updateJoined() {
    return this.manager.get(employeeKeys.updateJoined);
  }

  get updateRole() {
    return this.manager.get(employeeKeys.updateRole);
  }

  get updateBranch() {
    return this.manager.get(employeeKeys.updateBranch);
  }

  get updateReportsTo() {
    return this.manager.get(employeeKeys.updateReportsTo);
  }

  // =========================================================
  // EMPLOYEE INVITATIONS
  // =========================================================

  get insertInvitation() {
    return this.manager.get(employeeKeys.insertInvitation);
  }

  get updateInvitation() {
    return this.manager.get(employeeKeys.updateInvitation);
  }

  get findInvitationById() {
    return this.manager.get(employeeKeys.findInvitationById);
  }

  get findInvitationsByEmployee() {
    return this.manager.get(employeeKeys.findInvitationsByEmployee);
  }

  get findInvitationsByBusiness() {
    return this.manager.get(employeeKeys.findInvitationsByBusiness);
  }

  get updateInvitationStatus() {
    return this.manager.get(employeeKeys.updateInvitationStatus);
  }

  get acceptInvitation() {
    return this.manager.get(employeeKeys.acceptInvitation);
  }

  get revokeInvitation() {
    return this.manager.get(employeeKeys.revokeInvitation);
  }

  get expireInvitation() {
    return this.manager.get(employeeKeys.expireInvitation);
  }

  // =========================================================
  // CURRENT COMPENSATION
  // =========================================================

  get insertCompensation() {
    return this.manager.get(employeeKeys.upsertCompensation);
  }

  get updateCompensation() {
    return this.manager.get(employeeKeys.updateCompensation);
  }

  get findCompensationByEmployee() {
    return this.manager.get(employeeKeys.findCompensationByEmployee);
  }

  // =========================================================
  // COMPENSATION HISTORY
  // =========================================================

  get insertCompensationHistory() {
    return this.manager.get(employeeKeys.insertCompensationHistory);
  }

  get closeOpenCompensationHistory() {
    return this.manager.get(employeeKeys.closeOpenCompensationHistory);
  }

  get findCompensationHistory() {
    return this.manager.get(employeeKeys.findCompensationHistory);
  }

  // =========================================================
  // REQUESTS — PRESERVED
  // =========================================================

  get insertRequest() {
    return this.manager.get(employeeKeys.insertRequest);
  }

  get updateRequest() {
    return this.manager.get(employeeKeys.updateRequest);
  }

  get updateRequestAssignment() {
    return this.manager.get(employeeKeys.updateRequestAssignment);
  }

  get updateRequestResolution() {
    return this.manager.get(employeeKeys.updateRequestResolution);
  }

  get findRequestById() {
    return this.manager.get(employeeKeys.findRequestById);
  }

  get findRequestsByBusiness() {
    return this.manager.get(employeeKeys.findRequestsByBusiness);
  }

  get findRequestsByBranch() {
    return this.manager.get(employeeKeys.findRequestsByBranch);
  }

  get findRequestsByAssignee() {
    return this.manager.get(employeeKeys.findRequestsByAssignee);
  }

  get findRequestsByStatus() {
    return this.manager.get(employeeKeys.findRequestsByStatus);
  }

  // =========================================================
  // NOTIFICATIONS — PRESERVED
  // =========================================================

  get insertNotification() {
    return this.manager.get(employeeKeys.insertNotification);
  }

  get markNotificationRead() {
    return this.manager.get(employeeKeys.markNotificationRead);
  }

  get findNotificationsByEmployee() {
    return this.manager.get(employeeKeys.findNotificationsByEmployee);
  }

  get findUnreadNotifications() {
    return this.manager.get(employeeKeys.findUnreadNotifications);
  }

  // =========================================================
  // PROJECTION RESET
  // =========================================================

  get resetEmployees() {
    return this.manager.get(employeeKeys.resetEmployees);
  }

  get resetInvitations() {
    return this.manager.get(employeeKeys.resetInvitations);
  }

  get resetCompensation() {
    return this.manager.get(employeeKeys.resetCompensation);
  }

  get resetCompensationHistory() {
    return this.manager.get(employeeKeys.resetCompensationHistory);
  }

  get resetRequests() {
    return this.manager.get(employeeKeys.resetRequests);
  }

  get resetNotifications() {
    return this.manager.get(employeeKeys.resetNotifications);
  }
}
