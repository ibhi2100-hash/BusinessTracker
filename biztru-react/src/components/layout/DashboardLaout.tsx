
import { AuthGuard } from "../../hooks/useAuthGuard"; 
import { AppShell }from "./AppShell" 

export default function DashboardLayout() {
    return (
        <AuthGuard>
            <AppShell />
        </AuthGuard>
    );
}