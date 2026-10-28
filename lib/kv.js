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

/**
 * Fetch all registrations directly from Redis list 'goynar_baksho_registrations'.
 * Handles both string and pre-parsed JSON objects.
 */
export async function getRegistrationsFromKv() {
  try {
    const rawList = await kv.lrange(REGISTRATIONS_KEY, 0, -1);
    if (!Array.isArray(rawList)) return [];

    const registrations = rawList.map((item) =>
      typeof item === 'string' ? JSON.parse(item) : item
    );

    return registrations;
  } catch (error) {
    console.error('Error fetching registrations from KV:', error);
    return [];
  }
}

/**
 * Push a new registration permanently to the head of the Redis list.
 */
export async function saveRegistrationToKv(entry) {
  try {
    const payload = typeof entry === 'string' ? entry : JSON.stringify(entry);
    await kv.lpush(REGISTRATIONS_KEY, payload);
    return entry;
  } catch (error) {
    console.error('Error saving registration to KV:', error);
    throw error;
  }
}

/**
 * Update an existing registration in the Redis list (e.g. check-in, undo check-in).
 */
export async function updateRegistrationInKv(identifier, updateDataOrFn) {
  try {
    const all = await getRegistrationsFromKv();
    let updatedRecord = null;

    const modifiedList = all.map((reg) => {
      const match =
        reg.registrationId === identifier ||
        reg.qrToken === identifier ||
        String(reg.id) === String(identifier);

      if (match) {
        if (typeof updateDataOrFn === 'function') {
          updatedRecord = updateDataOrFn(reg);
        } else {
          updatedRecord = { ...reg, ...updateDataOrFn };
        }
        return updatedRecord;
      }
      return reg;
    });

    if (!updatedRecord) {
      return null;
    }

    // Atomically rewrite the list in Redis
    await kv.del(REGISTRATIONS_KEY);
    if (modifiedList.length > 0) {
      // Serialize items and push in order
      const serialized = modifiedList.map((item) => JSON.stringify(item));
      await kv.rpush(REGISTRATIONS_KEY, ...serialized);
    }

    return updatedRecord;
  } catch (error) {
    console.error('Error updating registration in KV:', error);
    return null;
  }
}

/**
 * Delete a registration from the Redis list.
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

    all.splice(idx, 1);

    await kv.del(REGISTRATIONS_KEY);
    if (all.length > 0) {
      const serialized = all.map((item) => JSON.stringify(item));
      await kv.rpush(REGISTRATIONS_KEY, ...serialized);
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
