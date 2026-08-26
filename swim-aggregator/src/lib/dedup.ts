import { admin } from "./supabase";

export type DedupHit = { id: string; name: string; similarity: number };

// Finds an existing exercise with a very similar name (trigram sim >= 0.55).
export async function findDuplicate(name: string): Promise<DedupHit | null> {
  const { data, error } = await admin.rpc("dedup_by_name", { q: name }).select();
  if (error) {
    // Fallback: raw SQL via rest
    const { data: rows } = await admin
      .from("exercises")
      .select("id, name")
      .ilike("name", name);
    if (rows && rows.length > 0) {
      return { id: rows[0].id, name: rows[0].name, similarity: 1 };
    }
    return null;
  }
  const first = (data as DedupHit[] | null)?.[0];
  return first && first.similarity >= 0.55 ? first : null;
}
