import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/sonner";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Inventory Management",
  description: "Internal inventory operations dashboard for managing products, stock, suppliers and categories.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={plex.variable}>
        <ThemeProvider>
          <div className="flex min-h-screen">
            <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 border-r bg-sidebar md:block">
              <Sidebar />
            </aside>
            <div className="min-w-0 flex-1">
              <main className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6">{children}</main>
            </div>
          </div>
          <Toaster richColors={false} closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
