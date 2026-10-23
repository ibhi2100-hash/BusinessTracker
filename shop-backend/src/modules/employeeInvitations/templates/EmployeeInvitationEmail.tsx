
import {
    Html,
    Head,
    Preview,
    Body,
    Container,
    Section,
    Heading,
    Text,
    Button,
    Hr,
} from "@react-email/components";

export interface EmployeeInvitationEmailProps {
    employeeName: string;
    businessName: string;
    branchName?: string | null;
    role: string;
    inviterName: string;
    invitationUrl: string;
    expiryDate: string;
}

export default function EmployeeInvitationEmail({
    employeeName,
    businessName,
    branchName,
    role,
    inviterName,
    invitationUrl,
    expiryDate,
}: EmployeeInvitationEmailProps) {
    return (
        <Html lang="en">
            <Head />
            <Preview>
                You're invited to join {businessName} on BizTru.
            </Preview>

            <Body style={styles.body}>
                <Container style={styles.container}>
                    <Section style={styles.header}>
                        <Heading style={styles.logo}>
                            BizTru
                        </Heading>
                        <Text style={styles.tagline}>
                            Business operations, under control.
                        </Text>
                    </Section>

                    <Section style={styles.content}>
                        <Heading style={styles.heading}>
                            You're invited to join a team
                        </Heading>

                        <Text style={styles.text}>
                            Hello {employeeName},
                        </Text>

                        <Text style={styles.text}>
                            {inviterName} has invited you to join
                            {" "}{businessName} on BizTru.
                            Accept the invitation to continue with
                            your account setup.
                        </Text>

                        <Section style={styles.details}>
                            <Text style={styles.label}>
                                BUSINESS
                            </Text>
                            <Text style={styles.businessName}>
                                {businessName}
                            </Text>

                            {branchName ? (
                                <>
                                    <Text style={styles.label}>
                                        BRANCH
                                    </Text>
                                    <Text style={styles.value}>
                                        {branchName}
                                    </Text>
                                </>
                            ) : null}

                            <Text style={styles.label}>
                                INVITED ROLE
                            </Text>
                            <Text style={styles.value}>
                                {role}
                            </Text>
                        </Section>

                        <Section style={styles.buttonSection}>
                            <Button
                                href={invitationUrl}
                                style={styles.button}
                            >
                                Accept Invitation
                            </Button>
                        </Section>

                        <Text style={styles.expiry}>
                            This invitation expires on {expiryDate}.
                        </Text>

                        <Hr style={styles.divider} />

                        <Text style={styles.notice}>
                            If you weren't expecting this invitation,
                            you can ignore this email. Never share your
                            invitation link with anyone else.
                        </Text>
                    </Section>

                    <Section style={styles.footer}>
                        <Text style={styles.footerText}>
                            Powered by BizTru
                        </Text>
                        <Text style={styles.footerText}>
                            Business management made clearer.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const styles = {
    body: {
        backgroundColor: "#f3f4f6",
        fontFamily: "Arial, Helvetica, sans-serif",
        margin: "0",
        padding: "24px 0",
    },
    container: {
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        margin: "0 auto",
        maxWidth: "560px",
        overflow: "hidden" as const,
    },
    header: {
        backgroundColor: "#101827",
        padding: "28px 24px",
        textAlign: "center" as const,
    },
    logo: {
        color: "#ffffff",
        fontSize: "30px",
        fontWeight: "700",
        margin: "0",
    },
    tagline: {
        color: "#d1d5db",
        fontSize: "13px",
        margin: "8px 0 0",
    },
    content: {
        padding: "32px 28px",
    },
    heading: {
        color: "#111827",
        fontSize: "25px",
        lineHeight: "1.35",
        margin: "0 0 24px",
        textAlign: "center" as const,
    },
    text: {
        color: "#374151",
        fontSize: "15px",
        lineHeight: "1.7",
    },
    details: {
        backgroundColor: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        margin: "24px 0",
        padding: "20px",
    },
    label: {
        color: "#6b7280",
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "1px",
        margin: "8px 0 4px",
    },
    businessName: {
        color: "#111827",
        fontSize: "20px",
        fontWeight: "700",
        margin: "0 0 16px",
    },
    value: {
        color: "#111827",
        fontSize: "15px",
        margin: "0 0 16px",
    },
    buttonSection: {
        padding: "12px 0",
        textAlign: "center" as const,
    },
    button: {
        backgroundColor: "#15803d",
        borderRadius: "8px",
        color: "#ffffff",
        display: "inline-block",
        fontSize: "15px",
        fontWeight: "700",
        padding: "15px 28px",
        textDecoration: "none",
    },
    expiry: {
        color: "#6b7280",
        fontSize: "12px",
        lineHeight: "1.6",
        textAlign: "center" as const,
    },
    divider: {
        borderColor: "#e5e7eb",
        margin: "24px 0",
    },
    notice: {
        color: "#6b7280",
        fontSize: "12px",
        lineHeight: "1.7",
    },
    footer: {
        backgroundColor: "#f9fafb",
        borderTop: "1px solid #e5e7eb",
        padding: "16px 24px",
        textAlign: "center" as const,
    },
    footerText: {
        color: "#9ca3af",
        fontSize: "11px",
        margin: "4px 0",
    },
};
