import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          {/* Background effects */}
          <div className="cyber-grid" />
          <div className="ambient-orb ambient-orb-1" />
          <div className="ambient-orb ambient-orb-2" />
          <div className="ambient-orb ambient-orb-3" />
          <div className="scan-line" />

          {/* Main content */}
          <div className="relative z-10 h-screen">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
