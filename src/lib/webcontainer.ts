"use client";

import { WebContainer, FileSystemTree } from "@webcontainer/api";
import { GeneratedFile } from "@/components/preview/preview-panel";

let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

// Boot or get existing WebContainer instance
export async function getWebContainer(): Promise<WebContainer> {
  if (webcontainerInstance) {
    return webcontainerInstance;
  }

  if (bootPromise) {
    return bootPromise;
  }

  bootPromise = WebContainer.boot();
  webcontainerInstance = await bootPromise;
  return webcontainerInstance;
}

// Convert GeneratedFile[] to WebContainer file system format
export function filesToFileSystem(files: GeneratedFile[]): FileSystemTree {
  const fs: FileSystemTree = {};

  files.forEach((file) => {
    const parts = file.path.split("/");
    let current: FileSystemTree = fs;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        // It's a file
        current[part] = {
          file: { contents: file.content },
        };
      } else {
        // It's a directory
        if (!current[part]) {
          current[part] = { directory: {} };
        }
        const dir = current[part];
        if ("directory" in dir && dir.directory) {
          current = dir.directory;
        }
      }
    });
  });

  return fs;
}

// Mount files to WebContainer
export async function mountFiles(files: GeneratedFile[]): Promise<void> {
  const container = await getWebContainer();
  const fileSystem = filesToFileSystem(files);
  await container.mount(fileSystem);
}

// Install dependencies
export async function installDependencies(
  onOutput?: (data: string) => void
): Promise<boolean> {
  const container = await getWebContainer();

  const installProcess = await container.spawn("npm", ["install"]);

  installProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        onOutput?.(data);
      },
    })
  );

  const exitCode = await installProcess.exit;
  return exitCode === 0;
}

// Start dev server
export async function startDevServer(
  onOutput?: (data: string) => void
): Promise<string> {
  const container = await getWebContainer();

  // Start the dev server
  const serverProcess = await container.spawn("npm", ["run", "dev"]);

  serverProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        onOutput?.(data);
      },
    })
  );

  // Wait for server-ready event
  return new Promise((resolve) => {
    container.on("server-ready", (_port, url) => {
      resolve(url);
    });
  });
}

// Run a command in the WebContainer
export async function runCommand(
  command: string,
  args: string[] = [],
  onOutput?: (data: string) => void
): Promise<number> {
  const container = await getWebContainer();

  const process = await container.spawn(command, args);

  process.output.pipeTo(
    new WritableStream({
      write(data) {
        onOutput?.(data);
      },
    })
  );

  return process.exit;
}

// Write a single file
export async function writeFile(path: string, content: string): Promise<void> {
  const container = await getWebContainer();
  await container.fs.writeFile(path, content);
}

// Read a file
export async function readFile(path: string): Promise<string> {
  const container = await getWebContainer();
  return container.fs.readFile(path, "utf-8");
}

// Check if WebContainer is supported
export function isWebContainerSupported(): boolean {
  if (typeof window === "undefined") return false;

  // Check for required headers (SharedArrayBuffer support)
  // This requires cross-origin isolation headers
  return typeof SharedArrayBuffer !== "undefined";
}

// Teardown WebContainer
export async function teardown(): Promise<void> {
  if (webcontainerInstance) {
    await webcontainerInstance.teardown();
    webcontainerInstance = null;
    bootPromise = null;
  }
}
