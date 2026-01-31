"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  Image,
  X,
  Sparkles,
  Bot,
  User,
  Loader2,
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Auto-resize textarea
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
            className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-dashed border-[var(--accent)]">
              <Image className="w-12 h-12 text-[var(--accent)]" />
              <p className="text-lg font-medium">Drop your files here</p>
              <p className="text-sm text-secondary">Images or reference files</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLatest={index === messages.length - 1}
              />
            ))}
            {/* Streaming message */}
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
            {/* Typing indicator */}
            {isGenerating && !streamingContent && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-container">
        {/* Attachments preview */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 mb-3 flex-wrap"
            >
              {attachments.map((attachment) => (
                <motion.div
                  key={attachment.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  {attachment.type === "image" ? (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-[var(--border)]">
                      <img
                        src={attachment.preview}
                        alt={attachment.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                      <Paperclip className="w-4 h-4" />
                      <span className="text-sm truncate max-w-[100px]">
                        {attachment.name}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[var(--error)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
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
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your MVP idea... or upload a reference"
            className="chat-input"
            rows={1}
          />
          <button
            className="send-btn"
            onClick={handleSubmit}
            disabled={(!input.trim() && attachments.length === 0) || isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center h-full text-center px-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center mb-6 shadow-lg shadow-[var(--accent-glow)]"
      >
        <Sparkles className="w-10 h-10 text-white" />
      </motion.div>
      <h1 className="text-3xl font-bold mb-3 text-gradient">
        Build Your MVP
      </h1>
      <p className="text-secondary max-w-md mb-8">
        Describe your app idea and I&apos;ll build a complete, working MVP for you.
        Upload reference images or just explain what you need.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full stagger-children">
        {[
          { icon: "🛒", text: "E-commerce store with payments" },
          { icon: "📊", text: "Analytics dashboard" },
          { icon: "💬", text: "Real-time chat application" },
          { icon: "📝", text: "Task management tool" },
        ].map((example, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02, x: 4 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] cursor-pointer transition-colors hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)]"
          >
            <span className="text-2xl">{example.icon}</span>
            <span className="text-sm text-secondary">{example.text}</span>
          </motion.div>
        ))}
      </div>
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
      initial={isLatest ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`message ${isUser ? "message-user" : "message-ai"}`}
    >
      <div className="flex items-start gap-3">
        {!isUser && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
        )}
        <div className="flex-1">
          {/* Attachments */}
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
                      className="max-w-[200px] max-h-[200px] object-cover"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 bg-[var(--surface)]">
                      <Paperclip className="w-4 h-4" />
                      <span className="text-sm">{attachment.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="message-bubble">
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
            )}
          </div>
        </div>
        {isUser && (
          <div className="w-8 h-8 rounded-lg bg-[var(--surface-active)] flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="message message-ai"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
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
