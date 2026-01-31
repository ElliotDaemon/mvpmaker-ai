import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";

// AI Provider Types
export type AIProvider = "claude" | "groq" | "deepseek" | "mistral" | "kimi";
export type AITier = "free" | "fast" | "quality" | "enterprise";

export interface AIProviderConfig {
  name: string;
  model: string;
  tier: AITier[];
  speed: "fastest" | "fast" | "medium";
  quality: "good" | "great" | "best";
  costPer1kTokens: number;
}

export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  groq: {
    name: "Groq",
    model: "llama-3.3-70b-versatile",
    tier: ["free", "fast"],
    speed: "fastest",
    quality: "good",
    costPer1kTokens: 0,
  },
  deepseek: {
    name: "DeepSeek",
    model: "deepseek-coder",
    tier: ["free", "fast"],
    speed: "fast",
    quality: "great",
    costPer1kTokens: 0.001,
  },
  mistral: {
    name: "Mistral",
    model: "mistral-large-latest",
    tier: ["fast", "quality"],
    speed: "fast",
    quality: "great",
    costPer1kTokens: 0.002,
  },
  kimi: {
    name: "Kimi K2",
    model: "moonshot-v1-128k",
    tier: ["quality"],
    speed: "medium",
    quality: "great",
    costPer1kTokens: 0.003,
  },
  claude: {
    name: "Claude Sonnet",
    model: "claude-sonnet-4-20250514",
    tier: ["quality", "enterprise"],
    speed: "medium",
    quality: "best",
    costPer1kTokens: 0.015,
  },
};

// Initialize clients
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// Streaming generation functions
export async function* streamGeneration(
  provider: AIProvider,
  systemPrompt: string,
  userPrompt: string
): AsyncGenerator<string> {
  switch (provider) {
    case "claude":
      if (!anthropic) throw new Error("Anthropic API key not configured");
      yield* streamClaude(systemPrompt, userPrompt);
      break;
    case "groq":
      if (!groq) throw new Error("Groq API key not configured");
      yield* streamGroq(systemPrompt, userPrompt);
      break;
    default:
      throw new Error(`Provider ${provider} not yet implemented`);
  }
}

async function* streamClaude(
  systemPrompt: string,
  userPrompt: string
): AsyncGenerator<string> {
  const stream = await anthropic!.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

async function* streamGroq(
  systemPrompt: string,
  userPrompt: string
): AsyncGenerator<string> {
  const stream = await groq!.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    stream: true,
    max_tokens: 8192,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

// Get best provider for tier
export function getProviderForTier(tier: AITier): AIProvider {
  switch (tier) {
    case "free":
      return "groq";
    case "fast":
      return "groq";
    case "quality":
      return "claude";
    case "enterprise":
      return "claude";
    default:
      return "groq";
  }
}
