import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { DecryptionBar } from "@/components/shared/decryption-bar";
import { Sidebar } from "@/components/shared/sidebar";
import { RewardReveal } from "@/components/features/rewards/reward-reveal";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nth Order Engine - E-commerce with Rewards",
  description: "E-commerce platform with Nth-order reward system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            <DecryptionBar />
            <div className="flex pt-12">
              <Sidebar />
              <main className="flex-1 ml-64">
                {children}
              </main>
            </div>
            <RewardReveal />
            <Toaster
              position="top-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: "#121212",
                  border: "1px solid #333333",
                  color: "#ededed",
                },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
