"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  PanelRightOpen,
  PanelRightClose,
  Download,
  Code,
  X,
  ChevronUp,
} from "lucide-react";
import { ChatInterface, Message, Attachment } from "@/components/chat/chat-interface";
import { PreviewPanel, GeneratedFile } from "@/components/preview/preview-panel";
import { ProgressTracker, BuildStep, calculateProgress } from "@/components/builder/progress-tracker";
import { ThemeSwitcher } from "@/components/theme-provider";
import {
  parseCodeBlocks,
  extractTextContent,
  initializeBuildSteps,
  setStepActive,
  inferCurrentStep,
} from "@/lib/mvp-builder";

// Custom hook for reactive cursor glow effect
function useCursorGlow() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      // Update CSS custom properties for global cursor position
      document.documentElement.style.setProperty('--cursor-x', `${x}px`);
      document.documentElement.style.setProperty('--cursor-y', `${y}px`);

      // Find all reactive-glow elements and update their local mouse position
      const glowElements = document.querySelectorAll('.reactive-glow');
      glowElements.forEach((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        const relX = ((x - rect.left) / rect.width) * 100;
        const relY = ((y - rect.top) / rect.height) * 100;
        (el as HTMLElement).style.setProperty('--mouse-x', `${relX}%`);
        (el as HTMLElement).style.setProperty('--mouse-y', `${relY}%`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
}

export default function Home() {
  // Initialize cursor glow effect
  useCursorGlow();
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  // Preview state
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [previewUrl] = useState<string | undefined>();
  const [showPreview, setShowPreview] = useState(true);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Build progress state
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>(initializeBuildSteps());
  const [currentStep, setCurrentStep] = useState<string | undefined>();
  const [isBuilding, setIsBuilding] = useState(false);

  // Refs
  const accumulatedContent = useRef("");

  const progress = calculateProgress(buildSteps);

  const handleSendMessage = useCallback(
    async (content: string, attachments?: Attachment[]) => {
      // Create user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
        attachments,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsGenerating(true);
      setStreamingContent("");
      accumulatedContent.current = "";

      // If this is the first message, start the build process
      if (messages.length === 0) {
        setIsBuilding(true);
        setBuildSteps(setStepActive(initializeBuildSteps(), "analyze"));
        setCurrentStep("Analyzing your requirements...");
      }

      try {
        // Prepare messages for API
        const apiMessages = [...messages, userMessage].map((msg) => ({
          role: msg.role,
          content: msg.content,
          attachments: msg.attachments?.map((a) => ({
            type: a.type,
            url: a.url,
            name: a.name,
          })),
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No response body");
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.type === "text") {
                  accumulatedContent.current += parsed.content;
                  setStreamingContent(accumulatedContent.current);

                  // Parse code blocks in real-time
                  const newFiles = parseCodeBlocks(accumulatedContent.current);
                  if (newFiles.length > 0) {
                    setGeneratedFiles((prev) => {
                      const updated = [...prev];
                      newFiles.forEach((newFile) => {
                        const existingIndex = updated.findIndex(
                          (f) => f.path === newFile.path
                        );
                        if (existingIndex >= 0) {
                          updated[existingIndex] = newFile;
                        } else {
                          updated.push({ ...newFile, isGenerating: true });
                        }
                      });
                      return updated;
                    });
                  }

                  // Update build step based on content
                  const inferredStep = inferCurrentStep(accumulatedContent.current);
                  if (inferredStep) {
                    setBuildSteps((prev) => {
                      const currentIdx = prev.findIndex((s) => s.status === "active");
                      const newIdx = prev.findIndex((s) => s.id === inferredStep);

                      if (newIdx > currentIdx) {
                        // Mark previous steps as completed and new step as active
                        return prev.map((step, idx) => ({
                          ...step,
                          status:
                            idx < newIdx
                              ? "completed"
                              : idx === newIdx
                              ? "active"
                              : step.status,
                        }));
                      }
                      return prev;
                    });

                    const stepTitle = buildSteps.find((s) => s.id === inferredStep)?.title;
                    if (stepTitle) {
                      setCurrentStep(stepTitle);
                    }
                  }
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }

        // Create assistant message
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: extractTextContent(accumulatedContent.current) || accumulatedContent.current,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Mark files as no longer generating
        setGeneratedFiles((prev) =>
          prev.map((f) => ({ ...f, isGenerating: false }))
        );
      } catch (error) {
        console.error("Error:", error);

        // Add error message
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsGenerating(false);
        setStreamingContent("");
      }
    },
    [messages, buildSteps]
  );

  // Download generated files as zip
  const handleDownload = useCallback(async () => {
    if (generatedFiles.length === 0) return;

    // Dynamic import for JSZip
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    generatedFiles.forEach((file) => {
      zip.file(file.path, file.content);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mvp-project.zip";
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedFiles]);

  return (
    <div className="flex h-full">
      {/* Cursor glow effect - hidden on mobile/touch devices */}
      <div className="cursor-glow hidden lg:block" aria-hidden="true" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-xl reactive-glow">
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center shadow-lg shadow-[var(--accent-glow)]"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold">MVPMAKER.AI</h1>
              <p className="text-xs text-secondary hidden sm:block">Build MVPs at lightning speed</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile progress indicator */}
            {isBuilding && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex sm:hidden items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                <span className="text-xs font-medium text-[var(--accent)]">
                  {Math.round(progress)}%
                </span>
              </motion.div>
            )}

            {/* Desktop build status */}
            {isBuilding && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                <span className="text-sm text-[var(--accent)]">
                  {currentStep || "Building..."}
                </span>
                <span className="text-xs font-medium text-[var(--accent)]">
                  {Math.round(progress)}%
                </span>
              </motion.div>
            )}

            {/* Download button */}
            {generatedFiles.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleDownload}
                className="btn btn-secondary text-xs sm:text-sm py-2 px-3 sm:px-4"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </motion.button>
            )}

            {/* Toggle preview panel - Desktop */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn btn-ghost btn-icon hidden lg:flex"
              title={showPreview ? "Hide preview" : "Show preview"}
            >
              {showPreview ? (
                <PanelRightClose className="w-5 h-5" />
              ) : (
                <PanelRightOpen className="w-5 h-5" />
              )}
            </button>

            {/* Theme switcher */}
            <div className="theme-switcher">
              <ThemeSwitcher />
            </div>
          </div>
        </header>

        {/* Main Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Panel */}
          <div
            className={`flex-1 flex flex-col transition-all duration-500 ${
              showPreview ? "lg:w-1/2" : "w-full"
            }`}
          >
            {/* Progress tracker when building */}
            <AnimatePresence>
              {isBuilding && progress < 100 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b border-[var(--border)]"
                >
                  <ProgressTracker
                    steps={buildSteps}
                    currentStepId={buildSteps.find((s) => s.status === "active")?.id}
                    progress={progress}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat */}
            <div className="flex-1 overflow-hidden">
              <ChatInterface
                messages={messages}
                isGenerating={isGenerating}
                onSendMessage={handleSendMessage}
                streamingContent={streamingContent}
              />
            </div>
          </div>

          {/* Preview Panel - Desktop */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "50%" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="hidden lg:flex border-l border-[var(--border)] overflow-hidden"
              >
                <div className="w-full h-full">
                  <PreviewPanel
                    files={generatedFiles}
                    isGenerating={isGenerating}
                    currentStep={currentStep}
                    progress={progress}
                    previewUrl={previewUrl}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile FAB for viewing code */}
      {generatedFiles.length > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={() => setShowMobilePreview(true)}
          className="mobile-fab lg:hidden"
        >
          <Code className="w-6 h-6" />
          {generatedFiles.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--success)] text-white text-xs flex items-center justify-center font-medium">
              {generatedFiles.length}
            </span>
          )}
        </motion.button>
      )}

      {/* Mobile Preview Sheet */}
      <AnimatePresence>
        {showMobilePreview && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobilePreview(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99] lg:hidden"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="mobile-preview-sheet lg:hidden"
            >
              {/* Handle */}
              <div className="mobile-preview-sheet-handle" />

              {/* Header */}
              <div className="mobile-preview-sheet-header">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-[var(--accent)]" />
                  <span className="font-medium">Generated Files</span>
                  <span className="text-xs text-secondary">({generatedFiles.length})</span>
                </div>
                <button
                  onClick={() => setShowMobilePreview(false)}
                  className="btn btn-ghost btn-icon"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="mobile-preview-sheet-content">
                <PreviewPanel
                  files={generatedFiles}
                  isGenerating={isGenerating}
                  currentStep={currentStep}
                  progress={progress}
                  previewUrl={previewUrl}
                />
              </div>

              {/* Swipe indicator */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <div className="flex items-center gap-1 text-xs text-tertiary">
                  <ChevronUp className="w-4 h-4" />
                  <span>Swipe down to close</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
