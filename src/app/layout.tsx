import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MVPMAKER.AI - Build MVPs at Lightning Speed",
  description: "AI-powered MVP builder. Turn your ideas into launch-ready apps in minutes.",
  keywords: ["MVP", "AI", "app builder", "code generator", "startup", "prototype"],
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
        suppressHydrationWarning
      >
        <ThemeProvider>
          <div className="grid-bg" />
          <div className="ambient-glow" />
          <div className="relative z-10 h-screen">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
