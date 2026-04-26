'use server';

import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-4-6';

export type ParsedBook = {
  title: string;
  author: string | null;
  rating: 'loved' | 'liked' | 'disliked' | 'dnf' | null;
};

let _client: Anthropic | null = null;
function client() {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

const PARSE_PROMPT = `You are a book list parser. The user will give you raw text from a pasted list, CSV, or spreadsheet of books a child has read.

Extract every book into a JSON array. For each book, return:
- title (string, required)
- author (string or null)
- rating (one of: "loved", "liked", "disliked", "dnf", or null if no rating is present)

Mapping rules for ratings:
- 5 stars, 10/10, "favorite", "amazing", "loved it", "A+", "A" → "loved"
- 4 stars, 3 stars, 8/10, 7/10, 6/10, "good", "liked it", "ok", "B+", "B", "C" → "liked"
- 2 stars, 1 star, "bad", "boring", "didn't like", "D", "F" → "disliked"
- "DNF", "didn't finish", "quit", "stopped reading" → "dnf"
- If no rating info exists for a book, set rating to null

Return ONLY a valid JSON array. No preamble. No markdown fences. No explanation.
If the input has no recognizable books, return an empty array [].`;

export async function parseBookList(rawText: string): Promise<ParsedBook[]> {
  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: [
      {
        type: 'text',
        text: PARSE_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: rawText }],
  });

  const text = response.content
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('\n');

  return parseJson(text);
}

function parseJson(text: string): ParsedBook[] {
  const trimmed = text.trim();
  const candidates = [
    trimmed,
    trimmed.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim(),
  ];
  const bracketMatch = trimmed.match(/\[[\s\S]*\]/);
  if (bracketMatch) candidates.push(bracketMatch[0]);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) {
        return parsed.filter(isValidBook);
      }
    } catch {
      // try next
    }
  }
  throw new Error('Could not parse the book list. Try a different format.');
}

function isValidBook(v: unknown): v is ParsedBook {
  if (!v || typeof v !== 'object') return false;
  const b = v as Record<string, unknown>;
  return typeof b.title === 'string' && b.title.trim().length > 0;
}
