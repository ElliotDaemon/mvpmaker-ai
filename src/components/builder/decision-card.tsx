"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  recommended?: boolean;
}

interface DecisionCardProps {
  question: string;
  options: DecisionOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function DecisionCard({
  question,
  options,
  selectedId,
  onSelect,
  disabled = false,
}: DecisionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="decision-container"
    >
      <h3 className="decision-question">{question}</h3>
      <div className="decision-options">
        {options.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            onClick={() => !disabled && onSelect(option.id)}
            className={`decision-option ${
              selectedId === option.id ? "selected" : ""
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="decision-option-icon">
              <span>{option.icon}</span>
            </div>
            <div className="decision-option-content">
              <div className="flex items-center gap-2">
                <span className="decision-option-title">{option.title}</span>
                {option.recommended && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
                    Recommended
                  </span>
                )}
              </div>
              <p className="decision-option-desc">{option.description}</p>
            </div>
            {selectedId === option.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Predefined decision sets for common choices
export const TECH_STACK_OPTIONS: DecisionOption[] = [
  {
    id: "nextjs",
    title: "Next.js + React",
    description: "Full-stack React framework with server components",
    icon: "⚛️",
    recommended: true,
  },
  {
    id: "remix",
    title: "Remix",
    description: "Full-stack web framework focused on web standards",
    icon: "💿",
  },
  {
    id: "vue",
    title: "Nuxt + Vue",
    description: "Vue.js meta-framework for modern web apps",
    icon: "💚",
  },
  {
    id: "svelte",
    title: "SvelteKit",
    description: "Cybernetically enhanced web apps with Svelte",
    icon: "🔥",
  },
];

export const STYLING_OPTIONS: DecisionOption[] = [
  {
    id: "tailwind",
    title: "Tailwind CSS",
    description: "Utility-first CSS framework for rapid UI development",
    icon: "🎨",
    recommended: true,
  },
  {
    id: "styled",
    title: "Styled Components",
    description: "CSS-in-JS with component-level styles",
    icon: "💅",
  },
  {
    id: "sass",
    title: "Sass/SCSS",
    description: "CSS preprocessor with variables and mixins",
    icon: "🎭",
  },
  {
    id: "css-modules",
    title: "CSS Modules",
    description: "Scoped CSS with modular approach",
    icon: "📦",
  },
];

export const DATABASE_OPTIONS: DecisionOption[] = [
  {
    id: "postgres",
    title: "PostgreSQL",
    description: "Powerful open-source relational database",
    icon: "🐘",
    recommended: true,
  },
  {
    id: "mysql",
    title: "MySQL",
    description: "Popular relational database management system",
    icon: "🐬",
  },
  {
    id: "mongodb",
    title: "MongoDB",
    description: "Flexible NoSQL document database",
    icon: "🍃",
  },
  {
    id: "sqlite",
    title: "SQLite",
    description: "Lightweight embedded database",
    icon: "📄",
  },
];

export const AUTH_OPTIONS: DecisionOption[] = [
  {
    id: "nextauth",
    title: "NextAuth.js",
    description: "Authentication for Next.js with multiple providers",
    icon: "🔐",
    recommended: true,
  },
  {
    id: "clerk",
    title: "Clerk",
    description: "Complete user management with pre-built components",
    icon: "👤",
  },
  {
    id: "supabase",
    title: "Supabase Auth",
    description: "Open-source Firebase alternative with auth",
    icon: "⚡",
  },
  {
    id: "custom",
    title: "Custom Auth",
    description: "Build authentication from scratch",
    icon: "🔧",
  },
];

export const DEPLOYMENT_OPTIONS: DecisionOption[] = [
  {
    id: "vercel",
    title: "Vercel",
    description: "Zero-config deployments for Next.js and more",
    icon: "▲",
    recommended: true,
  },
  {
    id: "netlify",
    title: "Netlify",
    description: "All-in-one platform for modern web projects",
    icon: "🌐",
  },
  {
    id: "railway",
    title: "Railway",
    description: "Infrastructure platform with built-in databases",
    icon: "🚂",
  },
  {
    id: "aws",
    title: "AWS",
    description: "Full control with Amazon Web Services",
    icon: "☁️",
  },
];
