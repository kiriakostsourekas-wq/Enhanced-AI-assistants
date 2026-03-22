import { readFile } from "node:fs/promises";
import path from "node:path";

let knowledgePackPromise: Promise<string> | null = null;

async function readKnowledgePackFile() {
  const filePath = path.join(process.cwd(), "knowledge-pack.md");
  const contents = await readFile(filePath, "utf8");

  if (!contents.trim()) {
    throw new Error("knowledge-pack.md is empty.");
  }

  return contents;
}

export function loadKnowledgePack() {
  if (!knowledgePackPromise) {
    knowledgePackPromise = readKnowledgePackFile();
  }

  return knowledgePackPromise;
}
