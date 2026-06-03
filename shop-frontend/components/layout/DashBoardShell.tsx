// DashboardShell.tsx

import BottomNav from "@/components/navigation/BottomNav";

interface Props {
  children: React.ReactNode;
}

export function DashboardShell({
  children,
}: Props) {
  return (
    <div className="relative z-10 min-h-screen pb-24">
      {children}

      <BottomNav />
    </div>
  );
}