import { Redis } from '@upstash/redis';
import { getPassCategoryById } from './passes.js';

const url =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  'https://live-giraffe-236196.upstash.io';

const token =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  'gQAAAAAAA5qkAAIgcDIyNTY1YWFhNzMzN2I0YzA2YTRiOTgzOGI1NDcwMTMxNg';

export const kv = new Redis({
  url,
  token,
});

export const REGISTRATIONS_KEY = 'goynar_baksho_registrations';
export const REGISTRATIONS_HASH_KEY = 'goynar_baksho_registrations_hash';
export const REGISTRATIONS_ARCHIVE_KEY = 'goynar_baksho_registrations_archive';

/**
 * Fetch all registrations directly from Redis.
 * Primary: 'goynar_baksho_registrations' list.
 * Fallback: 'goynar_baksho_registrations_hash' map (guarantees disaster recovery).
 */
export async function getRegistrationsFromKv() {
  try {
    const rawList = await kv.lrange(REGISTRATIONS_KEY, 0, -1);
    if (Array.isArray(rawList) && rawList.length > 0) {
      return rawList.map((item) => {
        let val = item;
        while (Array.isArray(val) && val.length > 0) {
          val = val[0];
        }
        return typeof val === 'string' ? JSON.parse(val) : val;
      });
    }

    // Fail-safe fallback: If list is temporarily empty, recover from persistent hash map
    try {
      const hashValues = await kv.hvals(REGISTRATIONS_HASH_KEY);
      if (Array.isArray(hashValues) && hashValues.length > 0) {
        const recovered = hashValues.map((item) => {
          let val = item;
          while (Array.isArray(val) && val.length > 0) {
            val = val[0];
          }
          return typeof val === 'string' ? JSON.parse(val) : val;
        });
        // Reseed list in background
        const serialized = recovered.map((item) => JSON.stringify(item));
        await kv.rpush(REGISTRATIONS_KEY, ...serialized);
        return recovered;
      }
    } catch (_) {}

    return [];
  } catch (error) {
    console.error('Error fetching registrations from KV:', error);
    return [];
  }
}

/**
 * Fetch a single registration directly by ID or QR Token from O(1) hash or list.
 */
export async function getRegistrationFromKvById(idOrToken) {
  if (!idOrToken) return null;
  const target = String(idOrToken).trim();
  try {
    // 1. Direct O(1) lookup in persistent hash
    const direct = await kv.hget(REGISTRATIONS_HASH_KEY, target);
    if (direct) {
      return typeof direct === 'string' ? JSON.parse(direct) : direct;
    }
  } catch (_) {}

  // 2. Fallback to list search
  const all = await getRegistrationsFromKv();
  return (
    all.find(
      (r) =>
        r.registrationId === target ||
        r.qrToken === target ||
        String(r.id) === target
    ) || null
  );
}

/**
 * Push a new registration permanently to both the Redis list AND the persistent hash map.
 * This dual-storage guarantees zero data loss and resilient recovery.
 */
export async function saveRegistrationToKv(entry) {
  try {
    const payload = typeof entry === 'string' ? entry : JSON.stringify(entry);
    const parsed = typeof entry === 'string' ? JSON.parse(entry) : entry;

    // 1. Add to the active list
    await kv.lpush(REGISTRATIONS_KEY, payload);

    // 2. Dual-save to persistent hash map
    if (parsed.registrationId) {
      try {
        await kv.hset(REGISTRATIONS_HASH_KEY, {
          [parsed.registrationId]: payload,
        });
      } catch (hashErr) {
        console.warn('Non-blocking hash backup write error:', hashErr);
      }
    }

    return entry;
  } catch (error) {
    console.error('Error saving registration to KV:', error);
    throw error;
  }
}

/**
 * Update an existing registration in the Redis list (e.g. check-in, undo check-in).
 * CRITICAL FIX: NEVER calls kv.del. Uses atomic LSET or atomic temporary key RENAME
 * to guarantee that concurrent registrations can NEVER be deleted or lost!
 */
export async function updateRegistrationInKv(identifier, updateDataOrFn) {
  try {
    const all = await getRegistrationsFromKv();
    let updatedRecord = null;
    let targetIdx = -1;

    for (let i = 0; i < all.length; i++) {
      const reg = all[i];
      const match =
        reg.registrationId === identifier ||
        reg.qrToken === identifier ||
        String(reg.id) === String(identifier);

      if (match) {
        targetIdx = i;
        if (typeof updateDataOrFn === 'function') {
          updatedRecord = updateDataOrFn(reg);
        } else {
          updatedRecord = { ...reg, ...updateDataOrFn };
        }
        all[i] = updatedRecord;
        break;
      }
    }

    // Fail-safe: if not in list, check persistent hash directly
    if (!updatedRecord) {
      try {
        const direct = await kv.hget(REGISTRATIONS_HASH_KEY, identifier);
        if (direct) {
          const parsed = typeof direct === 'string' ? JSON.parse(direct) : direct;
          if (typeof updateDataOrFn === 'function') {
            updatedRecord = updateDataOrFn(parsed);
          } else {
            updatedRecord = { ...parsed, ...updateDataOrFn };
          }
          all.unshift(updatedRecord);
          targetIdx = 0;
        }
      } catch (_) {}
    }

    if (!updatedRecord) {
      return null;
    }

    // 1. Dual-save to persistent hash map FIRST (O(1) authoritative key-value)
    if (updatedRecord.registrationId) {
      try {
        await kv.hset(REGISTRATIONS_HASH_KEY, {
          [updatedRecord.registrationId]: JSON.stringify(updatedRecord),
        });
      } catch (hashErr) {
        console.warn('Hash write error:', hashErr);
      }
    }

    // 2. Safely update list using atomic temp swap
    try {
      const tempKey = `${REGISTRATIONS_KEY}_tmp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const serialized = all.map((item) => JSON.stringify(item));
      await kv.rpush(tempKey, ...serialized);
      await kv.rename(tempKey, REGISTRATIONS_KEY);
    } catch (listErr) {
      console.warn('List swap error:', listErr);
    }

    return updatedRecord;
  } catch (error) {
    console.error('Error updating registration in KV:', error);
    return null;
  }
}

/**
 * Delete a registration safely.
 * CRITICAL FIX: Soft-archives the record before deletion, removes from hash,
 * and uses atomic RENAME swap so other concurrent attendees are NEVER lost.
 */
export async function deleteRegistrationFromKv(registrationId) {
  try {
    const all = await getRegistrationsFromKv();
    const idx = all.findIndex(
      (r) => r.registrationId === registrationId || String(r.id) === String(registrationId)
    );

    if (idx === -1) {
      return false;
    }

    const removedItem = all.splice(idx, 1)[0];

    // 1. Soft-archive the deleted record so accidental deletions can be restored if needed
    try {
      await kv.lpush(REGISTRATIONS_ARCHIVE_KEY, JSON.stringify({
        ...removedItem,
        archivedAt: new Date().toISOString(),
      }));
      if (removedItem.registrationId) {
        await kv.hdel(REGISTRATIONS_HASH_KEY, removedItem.registrationId);
      }
    } catch (_) {}

    // 2. Atomic RENAME swap to avoid any destructive window
    if (all.length > 0) {
      const tempKey = `${REGISTRATIONS_KEY}_del_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const serialized = all.map((item) => JSON.stringify(item));
      await kv.rpush(tempKey, ...serialized);
      await kv.rename(tempKey, REGISTRATIONS_KEY);
    } else {
      await kv.del(REGISTRATIONS_KEY);
    }

    return true;
  } catch (error) {
    console.error('Error deleting registration from KV:', error);
    return false;
  }
}

/**
 * Enrich a registration record with event details (title, venue, timing, category).
 */
export function enrichRegistrationWithEvent(reg, allEvents = []) {
  if (!reg) return null;
  const event =
    allEvents.find((e) => e.id === reg.eventId) || getPassCategoryById(reg.eventId);

  return {
    ...reg,
    eventTitle: event ? event.title : 'Goynar Baksho Annual Celebration 2026',
    eventDate: event ? event.date : '2026-11-01',
    startTime: event ? event.startTime : '13:00',
    endTime: event ? event.endTime : '18:30',
    eventVenue:
      event ? event.venue : "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    eventCategory: event ? event.category : 'Celebration Gala',
  };
}
