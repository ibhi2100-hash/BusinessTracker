import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import SyncBootstrap from "@/offline/bootstrap/syncBootstrap";


export const metadata = {
  title: "BizTru",
  description: "Financial control for growing businesses",
  manifest: "/manifest.json",
  themeColor: "#0F766E",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SyncBootstrap />
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
