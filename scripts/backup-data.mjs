import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const KV_REST_API_URL =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  'https://live-giraffe-236196.upstash.io';

const KV_REST_API_TOKEN =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  'gQAAAAAAA5qkAAIgcDIyNTY1YWFhNzMzN2I0YzA2YTRiOTgzOGI1NDcwMTMxNg';

async function backup() {
  console.log('🔄 Fetching live production data from Upstash Redis...');

  const listRes = await fetch(`${KV_REST_API_URL}/lrange/goynar_baksho_registrations/0/-1`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
  });
  const listJson = await listRes.json();
  const rawList = listJson.result || [];
  const registrations = rawList.map((item) => (typeof item === 'string' ? JSON.parse(item) : item));

  console.log(`✅ Retrieved ${registrations.length} live registrations.`);

  // Also fetch store for events
  const storeRes = await fetch(`${KV_REST_API_URL}/get/gb_store_2026`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
  });
  const storeJson = await storeRes.json();
  let remoteStore = storeJson.result;
  while (typeof remoteStore === 'string') {
    try {
      remoteStore = JSON.parse(remoteStore);
    } catch {
      break;
    }
  }

  // Load local events.json to merge
  const eventsJsonPath = path.join(projectRoot, 'data', 'events.json');
  let localData = { events: [], registrations: [], users: [] };
  if (fs.existsSync(eventsJsonPath)) {
    try {
      localData = JSON.parse(fs.readFileSync(eventsJsonPath, 'utf8'));
    } catch (_) {}
  }

  // Deduplicate & merge registrations
  const regMap = new Map();
  registrations.forEach((r) => {
    if (r.registrationId) regMap.set(r.registrationId, r);
  });
  (localData.registrations || []).forEach((r) => {
    if (r.registrationId && !regMap.has(r.registrationId)) regMap.set(r.registrationId, r);
  });

  const mergedRegistrations = Array.from(regMap.values());

  // Merge events if remote store has updated events
  let mergedEvents = localData.events || [];
  if (remoteStore && Array.isArray(remoteStore.events) && remoteStore.events.length > 0) {
    mergedEvents = remoteStore.events;
  }

  const finalPayload = {
    events: mergedEvents,
    registrations: mergedRegistrations,
    users: localData.users || [],
    lastBackupAt: new Date().toISOString(),
  };

  // Ensure backups directory exists
  const backupDir = path.join(projectRoot, 'data', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupJsonPath = path.join(backupDir, `backup_${timestamp}.json`);
  fs.writeFileSync(backupJsonPath, JSON.stringify(finalPayload, null, 2), 'utf8');

  // Also write CSV for ease of offline review
  const csvHeaders = ['Registration ID', 'Name', 'Email', 'Phone', 'Event ID', 'Checked In', 'Checked In At', 'Created At'];
  const csvRows = mergedRegistrations.map((r) => [
    `"${r.registrationId || ''}"`,
    `"${(r.name || '').replace(/"/g, '""')}"`,
    `"${r.email || ''}"`,
    `"${r.phone || ''}"`,
    `"${r.eventId || ''}"`,
    r.checkedIn === 1 ? 'YES' : 'NO',
    `"${r.checkedInAt || ''}"`,
    `"${r.createdAt || ''}"`,
  ]);
  const csvContent = [csvHeaders.join(','), ...csvRows.map((row) => row.join(','))].join('\r\n');
  const backupCsvPath = path.join(backupDir, `attendees_${timestamp}.csv`);
  fs.writeFileSync(backupCsvPath, csvContent, 'utf8');

  // Overwrite primary data/events.json
  fs.writeFileSync(eventsJsonPath, JSON.stringify(finalPayload, null, 2), 'utf8');

  console.log(`\n🎉 Data backup & synchronization completed successfully!`);
  console.log(`📁 JSON snapshot: data/backups/backup_${timestamp}.json`);
  console.log(`📄 CSV roster:   data/backups/attendees_${timestamp}.csv`);
  console.log(`💾 Synced file:  data/events.json (${mergedRegistrations.length} attendees)`);
}

backup().catch((err) => {
  console.error('❌ Backup failed:', err);
  process.exit(1);
});

