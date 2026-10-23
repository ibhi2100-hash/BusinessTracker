
import { Resend } from "resend";
import { render } from "@react-email/components";

import EmployeeInvitationEmail, {
    type EmployeeInvitationEmailProps,
} from "../templates/EmployeeInvitationEmail.js";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL;

if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing");
}

if (!fromEmail) {
    throw new Error("RESEND_FROM_EMAIL is missing");
}

const resend = new Resend(apiKey);

export async function sendEmployeeInvitationEmail(
    recipient: string,
    props: EmployeeInvitationEmailProps
) {
    const html = await render(
        EmployeeInvitationEmail(props)
    );

    const result = await resend.emails.send({
        from: fromEmail,
        to: recipient,
        subject: `You're invited to join ${props.businessName} on BizTru`,
        html,
    });

    if (result.error) {
        throw new Error(
            `Failed to send invitation: ${result.error.message}`
        );
    }

    return result.data;
}
