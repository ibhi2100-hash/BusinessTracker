
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { AppShell } from "@/components/layout/AppShell";
import { ApplicationProvider } from "@/src/services/ApplicationService/ApplicationProvider";

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
          <ApplicationProvider>
              <AppShell>
                  {children}
              </AppShell>
              <Toaster richColors position="top-right" />
          </ApplicationProvider>
        </Providers>
      </body>
    </html>
  );
}
