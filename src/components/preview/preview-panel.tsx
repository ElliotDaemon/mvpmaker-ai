"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor,
  Code,
  FolderTree,
  Play,
  RefreshCw,
  Maximize2,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  FileCode,
  FileJson,
  FileText,
  Folder,
  Loader2,
} from "lucide-react";

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
  isGenerating?: boolean;
}

interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
  language?: string;
  isGenerating?: boolean;
}

interface PreviewPanelProps {
  files: GeneratedFile[];
  isGenerating: boolean;
  currentStep?: string;
  progress?: number;
  previewUrl?: string;
}

type ViewMode = "preview" | "code" | "files";

export function PreviewPanel({
  files,
  isGenerating,
  currentStep,
  progress = 0,
  previewUrl,
}: PreviewPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fileTree = buildFileTree(files);
  const selectedFileContent = files.find((f) => f.path === selectedFile);

  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      // Auto-select first file
      const firstFile = files.find((f) => f.path.includes("page.tsx") || f.path.includes("index"));
      setSelectedFile(firstFile?.path || files[0].path);
    }
  }, [files, selectedFile]);

  const copyCode = async () => {
    if (selectedFileContent) {
      await navigator.clipboard.writeText(selectedFileContent.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div className="preview-container">
      {/* Progress bar when generating */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="progress-container"
          >
            <div className="progress-header">
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
                <span className="progress-title">
                  {currentStep || "Building your MVP..."}
                </span>
              </div>
              <span className="progress-percentage">{Math.round(progress)}%</span>
            </div>
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with tabs */}
      <div className="preview-header">
        <div className="preview-tabs">
          <button
            className={`preview-tab ${viewMode === "preview" ? "active" : ""}`}
            onClick={() => setViewMode("preview")}
          >
            <Monitor className="w-4 h-4 inline mr-2" />
            Preview
          </button>
          <button
            className={`preview-tab ${viewMode === "code" ? "active" : ""}`}
            onClick={() => setViewMode("code")}
          >
            <Code className="w-4 h-4 inline mr-2" />
            Code
          </button>
          <button
            className={`preview-tab ${viewMode === "files" ? "active" : ""}`}
            onClick={() => setViewMode("files")}
          >
            <FolderTree className="w-4 h-4 inline mr-2" />
            Files
            {files.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
                {files.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === "preview" && previewUrl && (
            <>
              <button
                onClick={refreshPreview}
                className="btn btn-ghost btn-icon"
                title="Refresh preview"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-icon"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </>
          )}
          {viewMode === "code" && selectedFileContent && (
            <button
              onClick={copyCode}
              className="btn btn-ghost btn-icon"
              title="Copy code"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[var(--success)]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="preview-content">
        <AnimatePresence mode="wait">
          {viewMode === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <BrowserPreview url={previewUrl} iframeRef={iframeRef} />
            </motion.div>
          )}

          {viewMode === "code" && (
            <motion.div
              key="code"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex"
            >
              {/* File sidebar */}
              <div className="w-64 border-r border-[var(--border)] overflow-y-auto">
                <FileTreeView
                  tree={fileTree}
                  selectedFile={selectedFile}
                  onSelectFile={setSelectedFile}
                />
              </div>
              {/* Code view */}
              <div className="flex-1 overflow-hidden">
                {selectedFileContent ? (
                  <CodeViewer file={selectedFileContent} />
                ) : (
                  <div className="flex items-center justify-center h-full text-secondary">
                    Select a file to view its code
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {viewMode === "files" && (
            <motion.div
              key="files"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-y-auto"
            >
              <FileTreeView
                tree={fileTree}
                selectedFile={selectedFile}
                onSelectFile={(path) => {
                  setSelectedFile(path);
                  setViewMode("code");
                }}
                expanded
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {files.length === 0 && !isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--surface)] flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-tertiary" />
              </div>
              <p className="text-secondary mb-2">No files yet</p>
              <p className="text-tertiary text-sm">
                Start a conversation to generate your MVP
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BrowserPreview({
  url,
  iframeRef,
}: {
  url?: string;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}) {
  return (
    <div className="browser-frame">
      <div className="browser-bar">
        <div className="browser-dots">
          <div className="browser-dot browser-dot-red" />
          <div className="browser-dot browser-dot-yellow" />
          <div className="browser-dot browser-dot-green" />
        </div>
        <div className="browser-url">
          {url || "localhost:3000"}
        </div>
      </div>
      <div className="browser-content">
        {url ? (
          <iframe ref={iframeRef} src={url} title="Preview" />
        ) : (
          <div className="flex items-center justify-center h-full bg-[var(--bg-secondary)]">
            <div className="text-center">
              <Play className="w-12 h-12 text-tertiary mx-auto mb-4" />
              <p className="text-secondary">Preview will appear here</p>
              <p className="text-tertiary text-sm mt-1">
                Once your MVP is generated
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FileTreeView({
  tree,
  selectedFile,
  onSelectFile,
  expanded = false,
}: {
  tree: FileTreeNode[];
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  expanded?: boolean;
}) {
  return (
    <div className="file-tree stagger-children">
      {tree.map((node) => (
        <FileTreeItem
          key={node.path}
          node={node}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
          defaultExpanded={expanded}
        />
      ))}
    </div>
  );
}

function FileTreeItem({
  node,
  selectedFile,
  onSelectFile,
  defaultExpanded = false,
  depth = 0,
}: {
  node: FileTreeNode;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  defaultExpanded?: boolean;
  depth?: number;
}) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  const getFileIcon = (language?: string) => {
    switch (language) {
      case "typescript":
      case "javascript":
        return <FileCode className="w-4 h-4 text-blue-400" />;
      case "json":
        return <FileJson className="w-4 h-4 text-yellow-400" />;
      case "css":
        return <FileCode className="w-4 h-4 text-pink-400" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (node.type === "folder") {
    return (
      <div style={{ paddingLeft: depth * 12 }}>
        <div
          className="file-tree-item file-tree-folder"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <Folder className="w-4 h-4 text-[var(--accent)]" />
          <span>{node.name}</span>
        </div>
        <AnimatePresence>
          {isOpen && node.children && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {node.children.map((child) => (
                <FileTreeItem
                  key={child.path}
                  node={child}
                  selectedFile={selectedFile}
                  onSelectFile={onSelectFile}
                  defaultExpanded={defaultExpanded}
                  depth={depth + 1}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      style={{ paddingLeft: depth * 12 + 20 }}
      className={`file-tree-item ${selectedFile === node.path ? "active" : ""} ${
        node.isGenerating ? "generating" : ""
      }`}
      onClick={() => onSelectFile(node.path)}
    >
      {getFileIcon(node.language)}
      <span>{node.name}</span>
      {node.isGenerating && (
        <Loader2 className="w-3 h-3 animate-spin ml-auto" />
      )}
    </div>
  );
}

function CodeViewer({ file }: { file: GeneratedFile }) {
  return (
    <div className="code-editor h-full flex flex-col">
      <div className="code-editor-header">
        <span className="code-editor-filename">{file.path}</span>
        <span className="text-xs text-tertiary">{file.language}</span>
      </div>
      <div className="code-editor-content flex-1">
        <pre className="text-sm">
          <code>{file.content}</code>
        </pre>
      </div>
    </div>
  );
}

function buildFileTree(files: GeneratedFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];

  files.forEach((file) => {
    const parts = file.path.split("/");
    let current = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const path = parts.slice(0, index + 1).join("/");

      let node = current.find((n) => n.name === part);

      if (!node) {
        node = {
          name: part,
          path,
          type: isFile ? "file" : "folder",
          language: isFile ? file.language : undefined,
          isGenerating: isFile ? file.isGenerating : undefined,
          children: isFile ? undefined : [],
        };
        current.push(node);
      }

      if (!isFile && node.children) {
        current = node.children;
      }
    });
  });

  // Sort: folders first, then files alphabetically
  const sortNodes = (nodes: FileTreeNode[]): FileTreeNode[] => {
    return nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    }).map((node) => ({
      ...node,
      children: node.children ? sortNodes(node.children) : undefined,
    }));
  };

  return sortNodes(root);
}
