// DashboardShell.tsx

import AppNav from "@/components/navigation/BottomNav";
// If you kept the filename as BottomNav, use:
// import AppNav from "@/components/navigation/BottomNav";

interface Props {
  children: React.ReactNode;
}

export function DashboardShell({ children }: Props) {
  return (
    <div className="relative z-10 min-h-screen bg-neutral-950 text-white">
      <AppNav />

      {/*
        Mobile: extra bottom padding for floating bar
        Desktop: left padding for fixed sidebar (w-64)
      */}
      <main
        className="
          min-h-screen
          pb-28
          lg:pb-8
          lg:pl-64
        "
      >
        {children}
      </main>
    </div>
  );
}