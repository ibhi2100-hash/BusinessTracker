
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import SyncBootstrap from "@/offline/bootstrap/syncBootstrap";
import { AppShell } from "@/components/layout/AppShell";
import { SQLiteProvider } from "@/src/offline/sqlite/SQLiteProvider";

export const metadata = {
  title: "BizTru",
  description: "Financial control for growing businesses",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Providers>
          <SQLiteProvider>
          <SyncBootstrap />
          <AppShell>
              {children}
          </AppShell>
          <Toaster richColors position="top-right" />
          </SQLiteProvider>
        </Providers>
      </body>
    </html>
  );
}
