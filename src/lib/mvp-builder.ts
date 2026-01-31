import { GeneratedFile } from "@/components/preview/preview-panel";
import { BuildStep, DEFAULT_BUILD_STEPS } from "@/components/builder/progress-tracker";

// Parse code blocks with file paths from AI response
export function parseCodeBlocks(content: string): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  // Match code blocks with file paths: ```file:path/to/file.ext or ```language file:path
  const codeBlockRegex = /```(?:(\w+)\s+)?file:([^\n]+)\n([\s\S]*?)```/g;

  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const language = match[1] || detectLanguage(match[2]);
    const path = match[2].trim();
    const code = match[3].trim();

    files.push({
      path,
      content: code,
      language,
    });
  }

  // Also try alternative format: ```tsx // path/to/file.tsx
  const altRegex = /```(\w+)\s*\/\/\s*([^\n]+)\n([\s\S]*?)```/g;
  while ((match = altRegex.exec(content)) !== null) {
    const language = match[1];
    const path = match[2].trim();
    const code = match[3].trim();

    // Avoid duplicates
    if (!files.some(f => f.path === path)) {
      files.push({
        path,
        content: code,
        language,
      });
    }
  }

  return files;
}

// Detect language from file extension
function detectLanguage(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  const langMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    css: "css",
    scss: "scss",
    html: "html",
    md: "markdown",
    py: "python",
    sql: "sql",
    prisma: "prisma",
    env: "env",
    yaml: "yaml",
    yml: "yaml",
  };
  return langMap[ext] || "text";
}

// Extract text content (non-code) from AI response
export function extractTextContent(content: string): string {
  // Remove code blocks
  return content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Build step management
export function updateBuildSteps(
  steps: BuildStep[],
  completedStepId: string,
  nextStepId?: string
): BuildStep[] {
  return steps.map((step) => {
    if (step.id === completedStepId) {
      return { ...step, status: "completed" as const };
    }
    if (step.id === nextStepId) {
      return { ...step, status: "active" as const };
    }
    return step;
  });
}

export function initializeBuildSteps(): BuildStep[] {
  return DEFAULT_BUILD_STEPS.map((step) => ({
    ...step,
    status: "pending" as const,
  }));
}

export function setStepActive(steps: BuildStep[], stepId: string): BuildStep[] {
  return steps.map((step) => ({
    ...step,
    status: step.id === stepId ? ("active" as const) : step.status,
  }));
}

// Determine which step we're on based on content
export function inferCurrentStep(content: string): string {
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes("understand") || lowerContent.includes("analyzing")) {
    return "analyze";
  }
  if (lowerContent.includes("architecture") || lowerContent.includes("planning") || lowerContent.includes("structure")) {
    return "plan";
  }
  if (lowerContent.includes("project structure") || lowerContent.includes("scaffolding") || lowerContent.includes("package.json")) {
    return "scaffold";
  }
  if (lowerContent.includes("component") || lowerContent.includes("button") || lowerContent.includes("card")) {
    return "components";
  }
  if (lowerContent.includes("page") || lowerContent.includes("layout") || lowerContent.includes("route")) {
    return "pages";
  }
  if (lowerContent.includes("api") || lowerContent.includes("endpoint") || lowerContent.includes("handler")) {
    return "api";
  }
  if (lowerContent.includes("database") || lowerContent.includes("schema") || lowerContent.includes("prisma") || lowerContent.includes("model")) {
    return "database";
  }
  if (lowerContent.includes("style") || lowerContent.includes("css") || lowerContent.includes("tailwind") || lowerContent.includes("animation")) {
    return "styling";
  }
  if (lowerContent.includes("complete") || lowerContent.includes("ready") || lowerContent.includes("finished") || lowerContent.includes("done")) {
    return "testing";
  }

  return "analyze";
}

// Generate a project summary
export function generateProjectSummary(files: GeneratedFile[]): {
  totalFiles: number;
  totalLines: number;
  languages: { name: string; count: number }[];
  structure: string[];
} {
  const totalLines = files.reduce(
    (acc, file) => acc + file.content.split("\n").length,
    0
  );

  const langCounts: Record<string, number> = {};
  files.forEach((file) => {
    langCounts[file.language] = (langCounts[file.language] || 0) + 1;
  });

  const languages = Object.entries(langCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Get unique directories
  const dirs = new Set<string>();
  files.forEach((file) => {
    const parts = file.path.split("/");
    for (let i = 1; i <= parts.length - 1; i++) {
      dirs.add(parts.slice(0, i).join("/"));
    }
  });

  return {
    totalFiles: files.length,
    totalLines,
    languages,
    structure: Array.from(dirs).sort(),
  };
}

// Template for starting a new MVP project
export const MVP_STARTER_TEMPLATE: GeneratedFile[] = [
  {
    path: "package.json",
    language: "json",
    content: `{
  "name": "my-mvp",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint ."
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}`,
  },
  {
    path: "tsconfig.json",
    language: "json",
    content: `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`,
  },
  {
    path: "tailwind.config.ts",
    language: "typescript",
    content: `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;`,
  },
];
