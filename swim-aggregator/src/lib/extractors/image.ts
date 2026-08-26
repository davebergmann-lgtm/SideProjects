import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, MODEL } from "../claude";

export async function extractImage(
  base64: string,
  mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif",
): Promise<{ title: string; content: string }> {
  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
          {
            type: "text",
            text: "Transcribe every swimming-related exercise, drill, set, or workout in this image verbatim. Preserve distances, intervals, rep counts, stroke names, and equipment. Do not summarize.",
          },
        ],
      },
    ],
  });

  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  if (!text.trim()) throw new Error("vision extractor returned no text");
  return { title: "Image content", content: text };
}
