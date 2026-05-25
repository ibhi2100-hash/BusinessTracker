import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import SyncBootstrap from "@/offline/bootstrap/syncBootstrap";



export const metadata = {
  manifest: "/manifest.json",
  title: "Shrek POS",
  description: "Financial control for growing businesses",
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

export function Head() {
  return (
    <>
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#0F766E" />
    </>
  );
}