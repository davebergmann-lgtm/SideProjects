import Anthropic from '@anthropic-ai/sdk';
import { READING_LEVELS } from './constants';
import { searchBooks } from './googleBooks';
import type {
  Book,
  BookEntry,
  Child,
  RawRecommendation,
  RecommendedBook,
} from './types';

const MODEL = 'claude-sonnet-4-20250514';

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

// The stable, cacheable instructions. Kept in the system prompt so prompt
// caching applies — the per-child data goes in the user message.
const SYSTEM_PROMPT = `You are a children's book recommendation expert. Based on the child profile and reading history the user provides, recommend 10 books the child is very likely to love.

Guidelines:
- Recommendations must match the child's reading level — not too easy, not too hard.
- Use the loved books as signal for taste; avoid patterns present in the disliked / DNF books.
- If preferred sources are set to free/library-first, prioritize widely-available titles (popular series, award winners, well-stocked library titles).
- Do not recommend books the child already rated.
- Prefer book 1 of a series when the child enjoys series.

For each recommendation, return a JSON object with these exact fields:
- title (string)
- author (string)
- isbn (string, ISBN-13 if known, otherwise null)
- match_reason (string, 2 sentences max, conversational, written to the parent)
- why_they_will_love_it (string, 1 sentence specific to this child's taste)
- likely_availability (one of: "library", "purchase", "both")
- series_starter (boolean — true if this is book 1 of a series)

Return ONLY a valid JSON array of exactly 10 objects. No preamble. No markdown code fences. No explanation outside the array.`;

type GenerateArgs = {
  child: Child;
  lovedBooks: (BookEntry & { book: Book })[];
  dislikedBooks: (BookEntry & { book: Book })[];
  sourcePreference: 'free_first' | 'any';
};

export async function generateRecommendations({
  child,
  lovedBooks,
  dislikedBooks,
  sourcePreference,
}: GenerateArgs): Promise<RecommendedBook[]> {
  const userPrompt = buildUserPrompt({ child, lovedBooks, dislikedBooks, sourcePreference });

  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        // Cache the stable instructions — saves tokens across refreshes.
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userPrompt }],
  });

  const text = response.content
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('\n');

  const raw = parseRecommendationJson(text);
  return enrichRecommendations(raw);
}

function buildUserPrompt({
  child,
  lovedBooks,
  dislikedBooks,
  sourcePreference,
}: GenerateArgs): string {
  const readingLevelLabel =
    READING_LEVELS.find((r) => r.value === child.reading_level)?.label ?? 'unspecified';

  const loved =
    lovedBooks.length > 0
      ? lovedBooks
          .map((e) => `- ${e.book.title}${e.book.author ? ` by ${e.book.author}` : ''}`)
          .join('\n')
      : '- (none yet)';

  const disliked =
    dislikedBooks.length > 0
      ? dislikedBooks
          .map((e) => `- ${e.book.title}${e.book.author ? ` by ${e.book.author}` : ''}`)
          .join('\n')
      : '- (none)';

  const sourceLine =
    sourcePreference === 'free_first'
      ? 'Prioritize free/library options.'
      : 'No source preference — any format is fine.';

  return `CHILD PROFILE:
- Name: ${child.name}
- Age: ${child.age ?? 'unspecified'}
- Grade: ${child.grade_level ?? 'unspecified'}
- Reading Level: ${readingLevelLabel}
- Interests: ${child.interests?.length ? child.interests.join(', ') : 'unspecified'}

BOOKS THEY LOVED OR LIKED:
${loved}

BOOKS THEY DISLIKED OR DID NOT FINISH:
${disliked}

PREFERRED SOURCES: ${sourceLine}

Return the JSON array now.`;
}

function parseRecommendationJson(text: string): RawRecommendation[] {
  const trimmed = text.trim();

  const candidates = [
    trimmed,
    // Strip possible ```json fences
    trimmed.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim(),
  ];

  // Fallback: find the first [...] block.
  const bracketMatch = trimmed.match(/\[[\s\S]*\]/);
  if (bracketMatch) candidates.push(bracketMatch[0]);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) {
        return parsed.filter(isRawRecommendation);
      }
    } catch {
      // try next candidate
    }
  }

  throw new Error('Claude response could not be parsed as a JSON array');
}

function isRawRecommendation(value: unknown): value is RawRecommendation {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.title === 'string' && typeof v.author === 'string';
}

// For each recommendation, look it up on Google Books to attach a cover and
// google_books_id. This lets us reuse the existing rateBook action unchanged
// and gives us a real cover even when Claude didn't know the ISBN.
async function enrichRecommendations(
  raw: RawRecommendation[]
): Promise<RecommendedBook[]> {
  const enriched = await Promise.all(
    raw.map(async (rec): Promise<RecommendedBook> => {
      try {
        const query = rec.isbn
          ? `isbn:${rec.isbn}`
          : `intitle:${rec.title} inauthor:${rec.author}`;
        const hits = await searchBooks(query, 1);
        const hit = hits[0];
        return {
          ...rec,
          isbn: rec.isbn ?? hit?.isbn ?? null,
          google_books_id: hit?.googleBooksId ?? null,
          cover_image_url: hit?.coverImageUrl ?? null,
        };
      } catch {
        return {
          ...rec,
          isbn: rec.isbn ?? null,
          google_books_id: null,
          cover_image_url: null,
        };
      }
    })
  );

  return enriched;
}
