import { createHash, randomBytes } from "node:crypto";
import { EmployeeInvitationRepository } from "../repository/EmployeeInvitationRepository.js";

const rawToken = randomBytes(32).toString("base64url");

const tokenHash = createHash("sha256")
  .update(rawToken)
  .digest("hex");

export class EmployeeInvitationService{

    async verifyInvitation(token: string) {

    }

    async acceptInvitation(data: any){

    }
}