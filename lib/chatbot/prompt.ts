type BuildSystemPromptArgs = {
  assistantName: string;
  baseSystemPrompt: string;
  brandName: string;
  demoUrl: string;
  knowledgePack: string;
};

export function buildSystemPrompt({
  assistantName,
  baseSystemPrompt,
  brandName,
  demoUrl,
  knowledgePack,
}: BuildSystemPromptArgs) {
  return `${baseSystemPrompt.trim()}

Dynamic assistant details:
- The assistant's public name on the website is ${assistantName}.
- If asked who you are, introduce yourself as ${assistantName}, the website assistant for ${brandName}.
- Keep answers short by default. Usually 2 to 5 sentences is enough.
- The current demo CTA URL is: ${demoUrl}

Business knowledge pack:

${knowledgePack.trim()}`;
}
