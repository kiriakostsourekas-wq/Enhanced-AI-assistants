import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const ROOT_MARKDOWN_PATHS = {
  "knowledge-pack.md": fileURLToPath(new URL("../../knowledge-pack.md", import.meta.url)),
  "system_prompt.md": fileURLToPath(new URL("../../system_prompt.md", import.meta.url)),
} as const;

type RootMarkdownFileName = keyof typeof ROOT_MARKDOWN_PATHS;

const rootFileCache = new Map<string, Promise<string>>();

async function readRootMarkdownFile(fileName: RootMarkdownFileName) {
  const filePath = ROOT_MARKDOWN_PATHS[fileName];
  const contents = await readFile(filePath, "utf8");

  if (!contents.trim()) {
    throw new Error(`${fileName} is empty.`);
  }

  return contents;
}

function loadRootMarkdownFile(fileName: RootMarkdownFileName) {
  if (!rootFileCache.has(fileName)) {
    rootFileCache.set(fileName, readRootMarkdownFile(fileName));
  }

  return rootFileCache.get(fileName)!;
}

export function loadKnowledgePack() {
  return loadRootMarkdownFile("knowledge-pack.md");
}

export function loadSystemPromptFile() {
  return loadRootMarkdownFile("system_prompt.md");
}
