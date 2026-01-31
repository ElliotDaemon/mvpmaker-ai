import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "MVPMAKER.AI - Build MVPs at Lightning Speed",
  description:
    "AI-powered MVP builder. Describe your app idea and get a complete, working MVP in minutes. Upload references, make decisions, and watch your app come to life.",
  keywords: [
    "MVP",
    "AI",
    "app builder",
    "code generator",
    "startup",
    "prototype",
    "Next.js",
    "React",
    "web app",
  ],
  authors: [{ name: "MVPMAKER.AI" }],
  openGraph: {
    title: "MVPMAKER.AI - Build MVPs at Lightning Speed",
    description: "AI-powered MVP builder. Turn your ideas into launch-ready apps.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <ThemeProvider>
          {/* Background effects */}
          <div className="cyber-grid" />
          <div className="ambient-orb ambient-orb-1" />
          <div className="ambient-orb ambient-orb-2" />
          <div className="ambient-orb ambient-orb-3" />
          <div className="scan-line" />

          {/* Main content */}
          <main className="main-container">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
