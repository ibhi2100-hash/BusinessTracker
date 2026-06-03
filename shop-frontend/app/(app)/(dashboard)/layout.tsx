import { AuthGuard } from "@/hooks/useAuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardShell } from "@/components/layout/DashBoardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AppShell>
        <DashboardShell>
          {children}
        </DashboardShell>
      </AppShell>
    </AuthGuard>
  );
}