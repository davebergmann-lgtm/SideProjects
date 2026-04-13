import type { RecommendedBook } from './types';

/**
 * Build outbound search links for a recommendation.
 * We prefer ISBN when available (most precise), otherwise fall back to title + author.
 *
 * Libby search URL uses OverDrive (Libby's parent) since Libby's deep-links
 * require a specific library card. OverDrive hands off cleanly to Libby.
 */
export function buildSourceLinks(book: RecommendedBook) {
  const query = book.isbn ? book.isbn : `${book.title} ${book.author}`;
  const encoded = encodeURIComponent(query);

  return {
    libby: `https://www.overdrive.com/search?query=${encoded}`,
    amazon: `https://www.amazon.com/s?k=${encoded}&i=stripbooks`,
  };
}
