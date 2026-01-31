"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "black" | "white" | "blue" | "brutalist";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("black");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as Theme;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme, mounted]);

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes: { id: Theme; color: string }[] = [
    { id: "black", color: "#000" },
    { id: "white", color: "#fff" },
    { id: "blue", color: "#0070f3" },
    { id: "brutalist", color: "#333" },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`w-4 h-4 rounded-full transition-all ${
            theme === t.id ? "ring-1 ring-offset-1 ring-[var(--text-primary)] ring-offset-[var(--bg-primary)]" : ""
          }`}
          style={{
            background: t.color,
            border: t.id === "white" ? "1px solid #ddd" : "none"
          }}
          title={t.id}
        />
      ))}
    </div>
  );
}
