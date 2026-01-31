"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  ImageIcon,
  X,
  Terminal,
  Loader2,
  ArrowRight,
  Command,
} from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
  isStreaming?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "file";
  url: string;
  preview?: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  isGenerating: boolean;
  onSendMessage: (content: string, attachments?: Attachment[]) => void;
  streamingContent?: string;
}

export function ChatInterface({
  messages,
  isGenerating,
  onSendMessage,
  streamingContent,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = useCallback(() => {
    if ((!input.trim() && attachments.length === 0) || isGenerating) return;
    onSendMessage(input.trim(), attachments);
    setInput("");
    setAttachments([]);
  }, [input, attachments, isGenerating, onSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const isImage = file.type.startsWith("image/");
        const newAttachment: Attachment = {
          id: crypto.randomUUID(),
          name: file.name,
          type: isImage ? "image" : "file",
          url: e.target?.result as string,
          preview: isImage ? (e.target?.result as string) : undefined,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  return (
    <div
      className="chat-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]/90 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-dashed border-[var(--border-hover)]">
              <ImageIcon className="w-8 h-8 text-[var(--text-tertiary)]" strokeWidth={1.5} />
              <p className="text-sm font-medium">Drop files here</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <WelcomeScreen onExampleClick={(text) => setInput(text)} />
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLatest={index === messages.length - 1}
              />
            ))}
            {isGenerating && streamingContent && (
              <MessageBubble
                message={{
                  id: "streaming",
                  role: "assistant",
                  content: streamingContent,
                  timestamp: new Date(),
                  isStreaming: true,
                }}
                isLatest
              />
            )}
            {isGenerating && !streamingContent && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-container">
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 mb-3 flex-wrap max-w-[800px] mx-auto"
            >
              {attachments.map((attachment) => (
                <motion.div
                  key={attachment.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group"
                >
                  {attachment.type === "image" ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-[var(--border)]">
                      <img
                        src={attachment.preview}
                        alt={attachment.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                      <Paperclip className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span className="text-xs truncate max-w-[80px]">
                        {attachment.name}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--text-tertiary)] text-[var(--bg-primary)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-2.5 h-2.5" strokeWidth={2} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="chat-input-wrapper">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.txt,.md,.json"
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            className="upload-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your MVP..."
            className="chat-input"
            rows={1}
          />
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-[var(--text-tertiary)] mr-1">
              <Command className="w-3 h-3" strokeWidth={1.5} />
              <span>Enter</span>
            </span>
            <button
              className="send-btn"
              onClick={handleSubmit}
              disabled={(!input.trim() && attachments.length === 0) || isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onExampleClick }: { onExampleClick: (text: string) => void }) {
  const examples = [
    { label: "SaaS dashboard", desc: "with analytics and user management" },
    { label: "E-commerce store", desc: "with cart and checkout flow" },
    { label: "Chat application", desc: "with real-time messaging" },
    { label: "Task manager", desc: "with drag-and-drop boards" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full px-6"
    >
      {/* Logo mark */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="w-12 h-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
          <Terminal className="w-5 h-5 text-[var(--text-secondary)]" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-center mb-10"
      >
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
          What do you want to build?
        </h1>
        <p className="text-[var(--text-tertiary)] text-sm sm:text-base max-w-md">
          Describe your idea and get a complete, working MVP in minutes.
        </p>
      </motion.div>

      {/* Example prompts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg"
      >
        {examples.map((example, i) => (
          <button
            key={i}
            onClick={() => onExampleClick(`Build a ${example.label} ${example.desc}`)}
            className="group flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--border)] bg-transparent hover:bg-[var(--surface)] hover:border-[var(--border-hover)] transition-all text-left"
          >
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium block">{example.label}</span>
              <span className="text-xs text-[var(--text-tertiary)] block truncate">
                {example.desc}
              </span>
            </div>
            <ArrowRight
              className="w-4 h-4 text-[var(--text-tertiary)] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
              strokeWidth={1.5}
            />
          </button>
        ))}
      </motion.div>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-[var(--text-tertiary)] text-xs mt-8"
      >
        Or drop an image for reference
      </motion.p>
    </motion.div>
  );
}

function MessageBubble({
  message,
  isLatest,
}: {
  message: Message;
  isLatest: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={isLatest ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`message ${isUser ? "message-user" : "message-ai"}`}
    >
      <div className="flex items-start gap-3">
        {!isUser && (
          <div className="w-7 h-7 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
            <Terminal className="w-3.5 h-3.5 text-[var(--text-secondary)]" strokeWidth={1.5} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex gap-2 mb-2 flex-wrap">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="rounded-lg overflow-hidden border border-[var(--border)]"
                >
                  {attachment.type === "image" ? (
                    <img
                      src={attachment.preview}
                      alt={attachment.name}
                      className="max-w-[180px] max-h-[180px] object-cover"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 bg-[var(--surface)]">
                      <Paperclip className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span className="text-xs">{attachment.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="message-bubble">
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.isStreaming && (
              <span className="inline-block w-0.5 h-4 ml-0.5 bg-current animate-pulse" />
            )}
          </div>
        </div>
        {isUser && (
          <div className="w-7 h-7 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium">You</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="message message-ai"
    >
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
          <Terminal className="w-3.5 h-3.5 text-[var(--text-secondary)]" strokeWidth={1.5} />
        </div>
        <div className="message-bubble">
          <div className="typing-indicator">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
