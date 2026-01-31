"use client";

import { motion } from "framer-motion";
import { Check, Loader2, Circle } from "lucide-react";

export interface BuildStep {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "active" | "completed" | "error";
}

interface ProgressTrackerProps {
  steps: BuildStep[];
  currentStepId?: string;
  progress: number;
}

export function ProgressTracker({
  steps,
  currentStepId,
  progress,
}: ProgressTrackerProps) {
  const completedSteps = steps.filter((s) => s.status === "completed").length;

  return (
    <div className="progress-container">
      <div className="progress-header">
        <span className="progress-title">
          Building MVP ({completedSteps}/{steps.length})
        </span>
        <span className="progress-percentage">{Math.round(progress)}%</span>
      </div>
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="progress-steps mt-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`progress-step ${step.status}`}
          >
            <div className="progress-step-icon">
              {step.status === "completed" ? (
                <Check className="w-3 h-3" />
              ) : step.status === "active" ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Circle className="w-2 h-2" />
              )}
            </div>
            <div className="flex-1">
              <span className="text-sm">{step.title}</span>
              {step.description && step.status === "active" && (
                <p className="text-xs text-tertiary mt-0.5">{step.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Default build steps for MVP generation
export const DEFAULT_BUILD_STEPS: BuildStep[] = [
  {
    id: "analyze",
    title: "Analyzing requirements",
    description: "Understanding your app idea",
    status: "pending",
  },
  {
    id: "plan",
    title: "Planning architecture",
    description: "Designing the structure",
    status: "pending",
  },
  {
    id: "scaffold",
    title: "Scaffolding project",
    description: "Creating project structure",
    status: "pending",
  },
  {
    id: "components",
    title: "Building components",
    description: "Creating UI components",
    status: "pending",
  },
  {
    id: "pages",
    title: "Creating pages",
    description: "Building page layouts",
    status: "pending",
  },
  {
    id: "api",
    title: "Setting up API",
    description: "Creating API routes",
    status: "pending",
  },
  {
    id: "database",
    title: "Database schema",
    description: "Defining data models",
    status: "pending",
  },
  {
    id: "styling",
    title: "Applying styles",
    description: "Adding CSS and animations",
    status: "pending",
  },
  {
    id: "testing",
    title: "Final checks",
    description: "Verifying everything works",
    status: "pending",
  },
];

export function calculateProgress(steps: BuildStep[]): number {
  const completed = steps.filter((s) => s.status === "completed").length;
  const active = steps.filter((s) => s.status === "active").length;
  return ((completed + active * 0.5) / steps.length) * 100;
}
