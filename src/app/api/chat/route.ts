import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// System prompt for MVP building
const SYSTEM_PROMPT = `You are MVPMAKER.AI, an expert full-stack developer and product architect. Your role is to help users build complete, working MVPs (Minimum Viable Products) from their ideas.

## Your Capabilities:
1. Analyze user requirements and ask clarifying questions when needed
2. Design and architect complete web applications
3. Generate production-ready code for all necessary files
4. Create beautiful, modern UIs with excellent UX
5. Set up databases, APIs, and authentication

## Guidelines:
- Always aim for a COMPLETE, WORKING MVP - never leave things half-done
- Use modern best practices (TypeScript, React/Next.js, Tailwind CSS, etc.)
- Generate clean, well-structured, production-ready code
- Include proper error handling and loading states
- Make the UI beautiful and responsive by default

## When generating code:
- Use \`\`\`file:path/to/file.tsx\`\`\` syntax to specify file paths
- Generate complete files, not snippets
- Include all necessary imports
- Use TypeScript for type safety
- Follow consistent naming conventions

## Conversation Flow:
1. Understand the user's idea
2. Ask 2-3 clarifying questions if needed (keep it brief)
3. Propose the architecture and get approval
4. Start building step by step, showing progress
5. Generate all files needed for a working MVP

Remember: The user wants something that WORKS. Quality and completeness over speed.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, attachments } = await req.json();

    // Format messages for Anthropic
    const formattedMessages = messages.map((msg: { role: string; content: string; attachments?: { type: string; url: string; name: string }[] }) => {
      if (msg.attachments && msg.attachments.length > 0) {
        // Handle messages with attachments (images)
        const content: Anthropic.ContentBlockParam[] = [];

        msg.attachments.forEach((att: { type: string; url: string; name: string }) => {
          if (att.type === "image") {
            // Extract base64 data from data URL
            const base64Match = att.url.match(/^data:image\/(\w+);base64,(.+)$/);
            if (base64Match) {
              const mediaType = base64Match[1] === "jpg" ? "image/jpeg" : `image/${base64Match[1]}`;
              content.push({
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                  data: base64Match[2],
                },
              });
            }
          }
        });

        if (msg.content) {
          content.push({ type: "text", text: msg.content });
        }

        return { role: msg.role, content };
      }

      return { role: msg.role, content: msg.content };
    });

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await anthropic.messages.stream({
            model: "claude-sonnet-4-20250514",
            max_tokens: 16384,
            system: SYSTEM_PROMPT,
            messages: formattedMessages,
          });

          for await (const event of response) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const data = JSON.stringify({
                type: "text",
                content: event.delta.text,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorData = JSON.stringify({
            type: "error",
            content: "An error occurred during generation",
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
