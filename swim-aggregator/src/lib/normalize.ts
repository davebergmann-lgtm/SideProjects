import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, MODEL } from "./claude";
import {
  DIFFICULTY,
  POOL_TYPES,
  SWIM_EQUIPMENT,
  SWIM_EXERCISE_TYPES,
  SWIM_FOCUS,
  SWIM_STROKES,
} from "./taxonomy";

export type NormalizedExercise = {
  name: string;
  aliases: string[];
  sport: "swimming";
  sport_attrs: {
    stroke: string;
    exercise_type: string;
    distance_meters?: number;
    pool_type?: string;
    focus: string[];
  };
  equipment: string[];
  difficulty: "beginner" | "intermediate" | "advanced" | null;
  instructions: string[];
  focus_notes: string[];
  safety_notes: string[];
  default_prescription: {
    sets?: number;
    reps_or_distance?: string;
    rest_seconds?: number;
    interval?: string;
  } | null;
  confidence: number;
};

const SYSTEM = `You extract structured swimming exercises, drills, and sets from arbitrary source content (transcripts, articles, pasted notes, image OCR).

Rules:
- Only extract SWIMMING content. Skip anything else silently.
- Emit ONE exercise per distinct drill, set, or block. A workout with 6 sections becomes 6 exercises.
- Preserve the source's exact numbers (distances, intervals, reps). Never fabricate prescriptions.
- Use only enum values from the tool schema. If a value doesn't fit, use "any" for stroke or omit the field.
- Set confidence 0.9+ when the source is explicit; 0.6-0.8 when you inferred fields; below 0.6 when guessing.
- If the source contains no swimming content, return an empty exercises array.`;

const TOOL_NAME = "record_exercises";

function buildTool(): Anthropic.Tool {
  return {
    name: TOOL_NAME,
    description: "Record the swimming exercises extracted from the source content.",
    input_schema: {
      type: "object",
      additionalProperties: false,
      required: ["exercises"],
      properties: {
        exercises: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: [
              "name",
              "aliases",
              "sport_attrs",
              "equipment",
              "instructions",
              "focus_notes",
              "safety_notes",
              "confidence",
            ],
            properties: {
              name: { type: "string", description: "Canonical, human-readable name." },
              aliases: { type: "array", items: { type: "string" } },
              sport_attrs: {
                type: "object",
                additionalProperties: false,
                required: ["stroke", "exercise_type", "focus"],
                properties: {
                  stroke: { type: "string", enum: [...SWIM_STROKES] },
                  exercise_type: { type: "string", enum: [...SWIM_EXERCISE_TYPES] },
                  distance_meters: { type: "number" },
                  pool_type: { type: "string", enum: [...POOL_TYPES] },
                  focus: { type: "array", items: { type: "string", enum: [...SWIM_FOCUS] } },
                },
              },
              equipment: { type: "array", items: { type: "string", enum: [...SWIM_EQUIPMENT] } },
              difficulty: { type: ["string", "null"], enum: [...DIFFICULTY, null] },
              instructions: { type: "array", items: { type: "string" } },
              focus_notes: { type: "array", items: { type: "string" } },
              safety_notes: { type: "array", items: { type: "string" } },
              default_prescription: {
                type: ["object", "null"],
                additionalProperties: false,
                properties: {
                  sets: { type: "number" },
                  reps_or_distance: { type: "string" },
                  rest_seconds: { type: "number" },
                  interval: { type: "string" },
                },
              },
              confidence: { type: "number", minimum: 0, maximum: 1 },
            },
          },
        },
      },
    } as Anthropic.Tool["input_schema"],
  };
}

export async function normalize(
  sourceLabel: string,
  content: string,
): Promise<NormalizedExercise[]> {
  const tool = buildTool();

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM,
    tools: [tool],
    tool_choice: { type: "tool", name: TOOL_NAME },
    messages: [
      {
        role: "user",
        content: `Source: ${sourceLabel}\n\n---\n${content}`,
      },
    ],
  });

  const call = resp.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === TOOL_NAME,
  );
  if (!call) throw new Error("normalizer did not return a tool call");

  const input = call.input as { exercises: NormalizedExercise[] };
  return (input.exercises ?? []).map((e) => ({ ...e, sport: "swimming" }));
}
