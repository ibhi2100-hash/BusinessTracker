
import express from "express";

import { EmployeeInvitationRepository } from "../modules/employeeInvitations/repository/EmployeeInvitationRepository.js";
import { EmployeeInvitationService } from "../modules/employeeInvitations/service/employeeInvitation.service.js";
import { EmployeeInvitationController } from "../modules/employeeInvitations/controller/employee-invitation.controller.js";

const router = express.Router();

const invitationRepository = new EmployeeInvitationRepository();
const invitationService = new EmployeeInvitationService(
    invitationRepository
);
const invitationController = new EmployeeInvitationController(
  invitationService,
);

/* =============================================
   Verify an invitation before showing signup
============================================= */

router.get(
  "/verify",
  invitationController.verify.bind(invitationController),
);

/* =============================================
   Accept invitation and create/link account
============================================= */

router.post(
  "/accept",
  invitationController.accept.bind(invitationController),
);

export default router;
