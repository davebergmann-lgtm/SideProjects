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
  total_distance_meters: number | null;
  total_duration_minutes: number | null;
  confidence: number;
};

const SYSTEM = `You extract structured swimming content from arbitrary source material (transcripts, articles, pasted notes, image OCR).

Grouping rule (IMPORTANT):
- By default, emit ONE exercise per pasted source. A full workout (warmup + main set + cooldown) stays as ONE exercise with exercise_type "workout" and every section listed as an instruction line in order.
- Only emit MULTIPLE exercises when the source is clearly a list of unrelated standalone items (e.g., "Here are 5 different drills you can try:" followed by 5 independent drills). When in doubt, keep it as one.
- A single drill or a single set is one exercise. A whole workout is one exercise. A curated list of standalone drills is multiple exercises.

Field rules:
- Only extract SWIMMING content. Skip anything else silently.
- Preserve the source's exact numbers (distances, intervals, reps). Never fabricate prescriptions.
- Use only enum values from the tool schema. If a value doesn't fit, use "any" for stroke, "workout" for exercise_type on mixed sessions, or omit optional fields.
- For a whole-workout entry, stroke = "any" if the workout uses multiple strokes; otherwise the dominant stroke.
- total_distance_meters: SUM every yardage/meterage across all sections in the workout (warmup + drills + main set + cooldown). Convert yards to meters if the source uses yards (1 yd = 0.9144 m). If the total cannot be reasonably summed from the source, set null.
- total_duration_minutes: ESTIMATE the total workout time in minutes. Use ~1:30 per 100m for adult recreational pace (freestyle), slightly slower for other strokes, plus rest intervals. For a single drill or short set (not a full workout), set null.
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
              "total_distance_meters",
              "total_duration_minutes",
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
              total_distance_meters: {
                type: ["number", "null"],
                description: "Sum of all distances in the workout, in meters. Null for single drills or unbounded content.",
              },
              total_duration_minutes: {
                type: ["number", "null"],
                description: "Estimated total workout time in minutes. Null for single drills.",
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
    max_tokens: 4096,
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
