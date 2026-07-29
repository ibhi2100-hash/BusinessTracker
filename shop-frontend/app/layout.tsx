
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { AppShell } from "@/components/layout/AppShell";
import { SQLiteBootstrap } from "@/offline/bootstrap/SQLiteBootstrap";
import { StorageBusCreator } from "@/src/offline/sqlite/bus/StorageBusCreator";
import { BootstrapProvider } from "@/components/Bootstrap/Bootstrap";

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
          <BootstrapProvider>
              <AppShell>
                  
                  {children}
              </AppShell>
              <Toaster richColors position="top-right" />
          </BootstrapProvider>
        </Providers>
      </body>
    </html>
  );
}
