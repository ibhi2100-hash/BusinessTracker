
import "dotenv/config";

import { sendEmployeeInvitationEmail } from "../modules/employeeInvitations/emailService/InvitationEmailService.js"

async function main() {
    const recipient = process.env.TEST_EMAIL;

    if (!recipient) {
        throw new Error("TEST_EMAIL is missing");
    }

    const result = await sendEmployeeInvitationEmail(
        recipient,
        {
            employeeName: "Chinedu",
            businessName: "MrShrek Phone Service",
            branchName: "Wuse Branch",
            role: "Staff",
            inviterName: "BizTru Business Owner",
            invitationUrl: "localhost:5173/employee-signup",
            expiryDate: "25 October 2026",
        }
    );

    console.log("Resend accepted the email request:", result);
}

main().catch((error) => {
    console.error("Invitation email test failed:", error);
    process.exitCode = 1;
});
