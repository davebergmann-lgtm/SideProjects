// Cloud persistence layer using Firebase Firestore.
// Usernames are globally unique — the document ID in the 'players' collection.
// If Firebase is not configured, all functions degrade gracefully to no-ops.

import { doc, getDoc, setDoc, runTransaction } from 'firebase/firestore';
import { db, firebaseConfigured } from '../config/firebase';

const playerRef = (username) => doc(db, 'players', username);

/**
 * Attempt to find an existing player or create a new one — atomically.
 * Returns { player, isNew } on success, or { error } on failure.
 *
 * - If the username already exists in the cloud, the existing player data
 *   is returned (isNew = false). This is the "login from another device" path.
 * - If the username does not exist, it is created (isNew = true).
 */
export async function findOrCreatePlayer(username, newPlayerData) {
  if (!firebaseConfigured) {
    // Offline/unconfigured: treat as new player, no cloud check
    return { player: newPlayerData, isNew: true, offline: true };
  }

  try {
    let result = null;

    await runTransaction(db, async (tx) => {
      const ref = playerRef(username);
      const snap = await tx.get(ref);

      if (snap.exists()) {
        // Username already registered — load their saved progress
        result = { player: snap.data(), isNew: false };
      } else {
        // Brand new username — claim it
        const data = { ...newPlayerData, createdAt: new Date().toISOString() };
        tx.set(ref, data);
        result = { player: data, isNew: true };
      }
    });

    return result;
  } catch (err) {
    console.warn('[cloudStore] findOrCreatePlayer failed:', err.message);
    return { error: 'NETWORK_ERROR' };
  }
}

/**
 * Load a player's data from the cloud.
 * Returns the player object, or null if not found / unavailable.
 */
export async function loadPlayerFromCloud(username) {
  if (!firebaseConfigured) return null;

  try {
    const snap = await getDoc(playerRef(username));
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.warn('[cloudStore] loadPlayerFromCloud failed:', err.message);
    return null;
  }
}

/**
 * Save player data to the cloud (merge so partial updates are safe).
 * Fire-and-forget friendly — errors are logged but not thrown.
 */
export async function savePlayerToCloud(player) {
  if (!firebaseConfigured || !player?.name) return;

  try {
    await setDoc(playerRef(player.name), player, { merge: true });
  } catch (err) {
    console.warn('[cloudStore] savePlayerToCloud failed:', err.message);
  }
}
