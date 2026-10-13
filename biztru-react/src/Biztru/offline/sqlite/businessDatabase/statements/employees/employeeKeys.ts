
export const employeeKeys = {
  // Employees
  insert: "employees.insert",
  update: "employees.update",
  updateStatus: "employees.update_status",
  updateUser: "employees.update_user",
  updateJoined: "employees.update_joined",
  updateRole: "employees.update_role",
  updateBranch: "employees.update_branch",
  updateReportsTo: "employees.update_reports_to",
  findById: "employees.find_by_id",
  findByBusiness: "employees.find_by_business",
  findByBranch: "employees.find_by_branch",
  findByUser: "employees.find_by_user",
  findReports: "employees.find_reports",
  delete: "employees.delete",

  // Invitations
  insertInvitation: "employee_invitations.insert",
  updateInvitation: "employee_invitations.update",
  updateInvitationStatus: "employee_invitations.update_status",
  acceptInvitation: "employee_invitations.accept",
  revokeInvitation: "employee_invitations.revoke",
  expireInvitation: "employee_invitations.expire",
  findInvitationById: "employee_invitations.find_by_id",
  findInvitationsByEmployee: "employee_invitations.find_by_employee",
  findInvitationsByBusiness: "employee_invitations.find_by_business",

  // Current compensation
  upsertCompensation: "employee_compensation.insert",
  updateCompensation: "employee_compensation.update",
  findCompensationByEmployee: "employee_compensation.find_by_employee",

  // Compensation history
  insertCompensationHistory: "employee_compensation_history.insert",
  closeOpenCompensationHistory:
    "employee_compensation_history.close_open_period",
  findCompensationHistory: "employee_compensation_history.find",

  // Requests — retain existing functionality
  insertRequest: "employee_requests.insert",
  updateRequest: "employee_requests.update",
  updateRequestAssignment: "employee_requests.update_assignment",
  updateRequestResolution: "employee_requests.update_resolution",
  findRequestById: "employee_requests.find_by_id",
  findRequestsByBusiness: "employee_requests.find_by_business",
  findRequestsByBranch: "employee_requests.find_by_branch",
  findRequestsByAssignee: "employee_requests.find_by_assignee",
  findRequestsByStatus: "employee_requests.find_by_status",

  // Notifications — retain existing functionality
  insertNotification: "employee_notifications.insert",
  markNotificationRead: "employee_notifications.mark_read",
  findNotificationsByEmployee: "employee_notifications.find_by_employee",
  findUnreadNotifications: "employee_notifications.find_unread",

  // Projection reset
  resetEmployees: "projection.reset.employees",
  resetInvitations: "projection.reset.employee_invitations",
  resetCompensation: "projection.reset.employee_compensation",
  resetCompensationHistory:
    "projection.reset.employee_compensation_history",
  resetRequests: "projection.reset.employee_requests",
  resetNotifications: "projection.reset.employee_notifications",
} as const;
