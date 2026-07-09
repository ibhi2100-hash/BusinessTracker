
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { AppShell } from "@/components/layout/AppShell";
import { SQLiteBootstrap } from "@/offline/bootstrap/SQLiteBootstrap";
import { StorageBusCreator } from "@/src/offline/sqlite/bus/StorageBusCreator";

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
          
              <SQLiteBootstrap/>
              <AppShell>
                  
                  {children}
              </AppShell>
              <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
