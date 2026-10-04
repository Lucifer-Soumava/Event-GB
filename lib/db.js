import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Default initial datasets (bundled directly so no external file or native module is ever required)
const DEFAULT_INITIAL_DATA = {
  events: [
    {
      id: 'gb-01-inaugural',
      title: 'Inaugural Ceremony & Mangik Alpona Unveiling',
      description: 'Opening prayers, ceremonial lighting of the brass pradip, and presentation of the ceremonial handmade Alpona motif honoring classical Bengali cultural heritage.',
      date: '2026-11-01',
      startTime: '17:00',
      endTime: '17:30',
      venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
      category: 'Inauguration',
      image: '/images/hero-stage.jpg',
      status: 'scheduled',
      displayOrder: 1,
      createdAt: '2026-09-28T16:36:02.860Z',
      updatedAt: '2026-09-28T16:36:02.860Z'
    },
    {
      id: 'gb-02-music-classical',
      title: 'Raga Recital: Melodies of Awakening',
      description: 'Emerging vocalists and instrumentalists perform traditional Bengali ragas and semi-classical khayal compositions on sitar, harmonium, and pakhawaj.',
      date: '2026-11-01',
      startTime: '17:35',
      endTime: '18:15',
      venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
      category: 'Music',
      image: '/images/hero-stage.jpg',
      status: 'scheduled',
      displayOrder: 2,
      createdAt: '2026-09-28T16:36:02.860Z',
      updatedAt: '2026-09-28T16:36:02.860Z'
    },
    {
      id: 'gb-03-recitation-poetry',
      title: 'Kabita O Kanthoswar: Poetic Eloquence',
      description: 'Youth elocutionists recite selected verses from Rabindranath Tagore, Kazi Nazrul Islam, Jibanananda Das, and contemporary emerging Bengali poets.',
      date: '2026-11-01',
      startTime: '18:20',
      endTime: '18:50',
      venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
      category: 'Recitation',
      image: '/images/hero-stage.jpg',
      status: 'scheduled',
      displayOrder: 3,
      createdAt: '2026-09-28T16:36:02.860Z',
      updatedAt: '2026-09-28T16:36:02.860Z'
    },
    {
      id: 'gb-04-dance-choreography',
      title: 'Nritya Taranga: Classical & Creative Dance',
      description: 'Expressive semiclassical and creative Bengali choreography depicting nature, folk heritage, and seasonal rhythms through mudras and rhythmic footwork.',
      date: '2026-11-01',
      startTime: '18:55',
      endTime: '19:35',
      venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
      category: 'Dance',
      image: '/images/hero-stage.jpg',
      status: 'scheduled',
      displayOrder: 4,
      createdAt: '2026-09-28T16:36:02.860Z',
      updatedAt: '2026-09-28T16:36:02.860Z'
    },
    {
      id: 'gb-05-theatre-drama',
      title: 'Natak: Intimate Proscenium Theatre',
      description: 'An original 35-minute dramatic stage production mounted by an emerging Kolkata youth theatre collective exploring contemporary social narratives and Bengali identity.',
      date: '2026-11-01',
      startTime: '19:40',
      endTime: '20:20',
      venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
      category: 'Theatre',
      image: '/images/hero-stage.jpg',
      status: 'scheduled',
      displayOrder: 5,
      createdAt: '2026-09-28T16:36:02.860Z',
      updatedAt: '2026-09-28T16:36:02.860Z'
    },
    {
      id: 'gb-06-honors-finale',
      title: 'Emerging Talent Recognition & Grand Collaborative Finale',
      description: 'Felicitation of all participating debut artists, presentation of commemorative Goynar Baksho 2026 citations, and an acoustic cross-genre jugalbandi finale.',
      date: '2026-11-01',
      startTime: '20:25',
      endTime: '21:00',
      venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
      category: 'Honors',
      image: '/images/hero-stage.jpg',
      status: 'scheduled',
      displayOrder: 6,
      createdAt: '2026-09-28T16:36:02.860Z',
      updatedAt: '2026-09-28T16:36:02.860Z'
    }
  ],
  registrations: [
    {
      registrationId: 'GB26-799183-7209',
      eventId: 'gb-01-inaugural',
      name: 'Soumava Pramanick',
      email: 'pramanicksoumava@gmail.com',
      phone: '8389837278',
      organization: 'ABC',
      qrToken: '3F2H_9NyeSxCB4q17FDbHlOHMG6yPTks',
      checkedIn: 0,
      checkedInAt: null,
      checkedInBy: null,
      createdAt: '2026-09-30T15:06:20.434Z'
    },
    {
      registrationId: 'GB26-94F085-8808',
      eventId: 'gb-02-music-classical',
      name: 'Debolina Roy',
      email: 'debolina@example.com',
      phone: '+919830012345',
      organization: null,
      qrToken: 'xGEo3amQFXyicObk_tSxkaOTOAs7BMp1',
      checkedIn: 1,
      checkedInAt: '2026-09-30T11:43:21.653Z',
      checkedInBy: 'Auditorium Gate Staff',
      createdAt: '2026-09-30T11:14:15.756Z'
    },
    {
      registrationId: 'GB26-7CA09D-2477',
      eventId: 'gb-01-inaugural',
      name: 'Ananya Sen',
      email: 'ananya.sen@example.com',
      phone: '+91 98765 43210',
      organization: null,
      qrToken: 'QF4ErqHEwPsB1EK3hsMsTdHE_IbQZ6z-',
      checkedIn: 1,
      checkedInAt: '2026-09-29T17:11:31.976Z',
      checkedInBy: 'Festival Administrator',
      createdAt: '2026-09-29T17:01:18.199Z'
    },
    {
      registrationId: 'GB26-C58E23-1775',
      eventId: 'gb-01-inaugural',
      name: 'Debolina Roy',
      email: 'debolina.vip@example.com',
      phone: '+91 98300 12345',
      organization: null,
      qrToken: 'yBgQTXAWGuQaxvNrFCH3YuLiIpu_nZwR',
      checkedIn: 0,
      checkedInAt: null,
      checkedInBy: null,
      createdAt: '2026-09-29T16:44:04.805Z'
    },
    {
      registrationId: 'GB26-7B4505-8878',
      eventId: 'gb-01-inaugural',
      name: 'Debolina Roy',
      email: 'debolina.test@example.com',
      phone: '+91 98300 12345',
      organization: 'Presidency University, Kolkata',
      qrToken: 'QaKRXwvyBB3YFvkB9Bq3UHzQlrHX-SM1',
      checkedIn: 1,
      checkedInAt: '2026-09-28T17:33:26.892Z',
      checkedInBy: null,
      createdAt: '2026-09-28T16:50:35.299Z'
    }
  ],
  users: [
    {
      id: 'usr-admin-01',
      username: 'admin',
      email: 'admin@goynarbaksho.org',
      passwordHash: '$2b$10$JX19qze3xJM9WEzFWFZdbuzrqvc7aubXd23U44K8yERGeKjxno1n6',
      name: 'Festival Administrator',
      role: 'ADMIN',
      isActive: 1,
      lastLoginAt: '2026-10-03T04:43:07.814Z',
      createdAt: '2026-09-28T17:33:23.045Z',
      updatedAt: '2026-10-03T04:43:07.814Z'
    },
    {
      id: 'usr-staff-01',
      username: 'staff',
      email: 'staff@goynarbaksho.org',
      passwordHash: '$2b$10$QCmd1vNVXX.wTYOP.qsJrOMwCmS3R8LQ4cauQKinOOYBHp45J9ZD6',
      name: 'Auditorium Gate Staff',
      role: 'CHECKIN_STAFF',
      isActive: 1,
      lastLoginAt: '2026-09-30T11:43:19.708Z',
      createdAt: '2026-09-28T17:33:23.045Z',
      updatedAt: '2026-09-30T11:43:19.708Z'
    }
  ]
};

// Determine file storage paths
const primaryDataDir = path.join(process.cwd(), 'data');
const primaryFilePath = path.join(primaryDataDir, 'events.json');

// Serverless fallback in /tmp (e.g. AWS Lambda, Vercel)
const tmpFilePath = path.join(
  process.env.TMPDIR || process.env.TEMP || '/tmp',
  'goynar_events.json'
);

// Global in-memory store so it survives warm invocations
let store = null;

function loadStore() {
  if (store) return store;

  // 1. Try reading from writable /tmp file if previously persisted
  try {
    if (fs.existsSync(tmpFilePath)) {
      const raw = fs.readFileSync(tmpFilePath, 'utf8');
      store = JSON.parse(raw);
      if (store && Array.isArray(store.events) && Array.isArray(store.users)) {
        return store;
      }
    }
  } catch (err) {
    // Continue to next option
  }

  // 2. Try reading from project data/events.json
  try {
    if (fs.existsSync(primaryFilePath)) {
      const raw = fs.readFileSync(primaryFilePath, 'utf8');
      store = JSON.parse(raw);
      if (store && Array.isArray(store.events) && Array.isArray(store.users)) {
        return store;
      }
    }
  } catch (err) {
    // Continue to default fallback
  }

  // 3. Fallback to default in-memory bundle
  store = JSON.parse(JSON.stringify(DEFAULT_INITIAL_DATA));
  saveStore();
  return store;
}

function saveStore() {
  if (!store) return;
  const payload = JSON.stringify(store, null, 2);

  // Try writing to primary data directory
  let saved = false;
  try {
    if (!fs.existsSync(primaryDataDir)) {
      fs.mkdirSync(primaryDataDir, { recursive: true });
    }
    fs.writeFileSync(primaryFilePath, payload, 'utf8');
    saved = true;
  } catch (err) {
    // Primary directory might be read-only in serverless deployments
  }

  // Also sync to /tmp directory for serverless persistence
  try {
    fs.writeFileSync(tmpFilePath, payload, 'utf8');
    saved = true;
  } catch (err) {
    // /tmp might not be accessible in rare local setups
  }

  if (!saved) {
    // In-memory data is still retained in process memory
  }
}

// Ensure store is ready
function getStore() {
  return loadStore();
}

/* ====================================================================
 * BACKWARDS COMPATIBILITY EXPORT
 * ==================================================================== */
export function getDatabase() {
  return {
    exec: () => {},
    prepare: () => ({
      get: () => ({ count: 0 }),
      all: () => [],
      run: () => ({ changes: 0 }),
    }),
  };
}

/* ====================================================================
 * EVENT CATALOG METHODS
 * ==================================================================== */
export function getAllEvents(filters = {}) {
  const currentStore = getStore();
  let list = [...currentStore.events];

  if (filters.category && filters.category !== 'all') {
    const targetCat = filters.category.toLowerCase();
    list = list.filter((e) => (e.category || '').toLowerCase() === targetCat);
  }

  if (filters.status && filters.status !== 'all') {
    const targetStatus = filters.status.toLowerCase();
    list = list.filter((e) => (e.status || '').toLowerCase() === targetStatus);
  }

  if (filters.date) {
    list = list.filter((e) => e.date === filters.date);
  }

  if (filters.search) {
    const term = filters.search.toLowerCase().trim();
    list = list.filter(
      (e) =>
        (e.title || '').toLowerCase().includes(term) ||
        (e.description || '').toLowerCase().includes(term) ||
        (e.venue || '').toLowerCase().includes(term)
    );
  }

  // Sorting
  if (filters.orderBy === 'displayOrder') {
    list.sort((a, b) => {
      const orderA = a.displayOrder ?? 999;
      const orderB = b.displayOrder ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return (a.startTime || '').localeCompare(b.startTime || '');
    });
  } else {
    list.sort((a, b) => {
      const orderA = a.displayOrder ?? 999;
      const orderB = b.displayOrder ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      const dateCmp = (a.date || '').localeCompare(b.date || '');
      if (dateCmp !== 0) return dateCmp;
      return (a.startTime || '').localeCompare(b.startTime || '');
    });
  }

  return JSON.parse(JSON.stringify(list));
}

export function getEventById(id) {
  const currentStore = getStore();
  const event = currentStore.events.find((e) => e.id === id);
  return event ? JSON.parse(JSON.stringify(event)) : null;
}

export function getCategories() {
  const currentStore = getStore();
  const categories = Array.from(
    new Set(currentStore.events.map((e) => e.category).filter(Boolean))
  );
  return categories.sort((a, b) => a.localeCompare(b));
}

export function createEvent(eventData) {
  const currentStore = getStore();
  const id = eventData.id || `gb-${Date.now()}`;
  const now = new Date().toISOString();

  let displayOrder = Number(eventData.displayOrder);
  if (isNaN(displayOrder) || displayOrder === undefined || displayOrder === null) {
    const maxOrder = currentStore.events.reduce(
      (max, e) => Math.max(max, e.displayOrder || 0),
      0
    );
    displayOrder = maxOrder + 1;
  }

  const newEvent = {
    id,
    title: eventData.title || '',
    description: eventData.description || '',
    date: eventData.date || '2026-11-01',
    startTime: eventData.startTime || '17:00',
    endTime: eventData.endTime || '18:00',
    venue: eventData.venue || "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    category: eventData.category || 'Celebration',
    image: eventData.image || '/images/hero-stage.jpg',
    status: eventData.status || 'scheduled',
    displayOrder,
    createdAt: now,
    updatedAt: now,
  };

  currentStore.events.push(newEvent);
  saveStore();
  return JSON.parse(JSON.stringify(newEvent));
}

export function updateEvent(id, eventData) {
  const currentStore = getStore();
  const idx = currentStore.events.findIndex((e) => e.id === id);
  if (idx === -1) return null;

  const existing = currentStore.events[idx];
  const now = new Date().toISOString();

  const updated = {
    ...existing,
    title: eventData.title !== undefined ? eventData.title : existing.title,
    description: eventData.description !== undefined ? eventData.description : existing.description,
    date: eventData.date !== undefined ? eventData.date : existing.date,
    startTime: eventData.startTime !== undefined ? eventData.startTime : existing.startTime,
    endTime: eventData.endTime !== undefined ? eventData.endTime : existing.endTime,
    venue: eventData.venue !== undefined ? eventData.venue : existing.venue,
    category: eventData.category !== undefined ? eventData.category : existing.category,
    image: eventData.image !== undefined ? eventData.image : existing.image,
    status: eventData.status !== undefined ? eventData.status : existing.status,
    displayOrder: eventData.displayOrder !== undefined ? Number(eventData.displayOrder) : existing.displayOrder,
    updatedAt: now,
  };

  currentStore.events[idx] = updated;
  saveStore();
  return JSON.parse(JSON.stringify(updated));
}

export function reorderEvents(orderedIds) {
  const currentStore = getStore();
  const now = new Date().toISOString();

  orderedIds.forEach((id, index) => {
    const event = currentStore.events.find((e) => e.id === id);
    if (event) {
      event.displayOrder = index + 1;
      event.updatedAt = now;
    }
  });

  saveStore();
  return getAllEvents();
}

export function deleteEvent(id) {
  const currentStore = getStore();
  const idx = currentStore.events.findIndex((e) => e.id === id);
  if (idx === -1) return false;

  currentStore.events.splice(idx, 1);
  saveStore();
  return true;
}

/* ====================================================================
 * REGISTRATION SYSTEM & QR TOKEN METHODS
 * ==================================================================== */
export function generateRegistrationId() {
  const hexPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  const numPart = Math.floor(1000 + Math.random() * 9000);
  return `GB26-${hexPart}-${numPart}`;
}

export function generateQrToken() {
  return crypto.randomBytes(24).toString('base64url');
}

export function isEmailRegisteredForEvent(email, eventId) {
  const currentStore = getStore();
  const targetEmail = (email || '').toLowerCase().trim();
  return currentStore.registrations.some(
    (r) => (r.email || '').toLowerCase().trim() === targetEmail && r.eventId === eventId
  );
}

export function createRegistration({ eventId, name, email, phone, organization }) {
  const currentStore = getStore();

  if (isEmailRegisteredForEvent(email, eventId)) {
    const error = new Error('This email address is already registered for this celebration session.');
    error.code = 'DUPLICATE_REGISTRATION';
    throw error;
  }

  const registrationId = generateRegistrationId();
  const qrToken = generateQrToken();
  const now = new Date().toISOString();

  const newReg = {
    registrationId,
    eventId,
    name: (name || '').trim(),
    email: (email || '').trim().toLowerCase(),
    phone: (phone || '').trim(),
    organization: organization ? organization.trim() : null,
    qrToken,
    checkedIn: 0,
    checkedInAt: null,
    checkedInBy: null,
    createdAt: now,
  };

  currentStore.registrations.push(newReg);
  saveStore();
  return getRegistrationById(registrationId);
}

export function getRegistrationById(registrationId) {
  const currentStore = getStore();
  const reg = currentStore.registrations.find((r) => r.registrationId === registrationId);
  if (!reg) return null;

  const event = currentStore.events.find((e) => e.id === reg.eventId);

  return {
    ...JSON.parse(JSON.stringify(reg)),
    eventTitle: event ? event.title : 'Goynar Baksho Annual Celebration 2026',
    eventDate: event ? event.date : '2026-11-01',
    startTime: event ? event.startTime : '17:00',
    endTime: event ? event.endTime : '21:00',
    eventVenue: event ? event.venue : "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    eventCategory: event ? event.category : 'Celebration',
  };
}

export function getRegistrationByQrToken(qrToken) {
  const currentStore = getStore();
  const reg = currentStore.registrations.find((r) => r.qrToken === qrToken);
  if (!reg) return null;

  const event = currentStore.events.find((e) => e.id === reg.eventId);

  return {
    ...JSON.parse(JSON.stringify(reg)),
    eventTitle: event ? event.title : 'Goynar Baksho Annual Celebration 2026',
    eventDate: event ? event.date : '2026-11-01',
    eventVenue: event ? event.venue : "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    startTime: event ? event.startTime : '17:00',
    endTime: event ? event.endTime : '21:00',
  };
}

/* ====================================================================
 * USER & AUTHENTICATION METHODS
 * ==================================================================== */
export function getUserByUsernameOrEmail(identifier) {
  if (!identifier) return null;
  const currentStore = getStore();
  const target = identifier.trim().toLowerCase();

  const user = currentStore.users.find(
    (u) =>
      ((u.username && u.username.toLowerCase() === target) ||
        (u.email && u.email.toLowerCase() === target)) &&
      (u.isActive === 1 || u.isActive === true)
  );

  return user ? JSON.parse(JSON.stringify(user)) : null;
}

export function getUserById(id) {
  const currentStore = getStore();
  const user = currentStore.users.find((u) => u.id === id);
  if (!user) return null;

  const { passwordHash, ...safeUser } = user;
  return JSON.parse(JSON.stringify(safeUser));
}

export function updateUserLastLogin(id) {
  const currentStore = getStore();
  const user = currentStore.users.find((u) => u.id === id);
  if (user) {
    const now = new Date().toISOString();
    user.lastLoginAt = now;
    user.updatedAt = now;
    saveStore();
  }
}

export function getAllUsers() {
  const currentStore = getStore();
  return currentStore.users.map((u) => {
    const { passwordHash, ...safeUser } = u;
    return JSON.parse(JSON.stringify(safeUser));
  });
}

/* ====================================================================
 * ADMIN REGISTRATION MANAGEMENT & CHECK-IN METHODS
 * ==================================================================== */
export function getAllRegistrationsAdmin(filters = {}) {
  const currentStore = getStore();
  let list = currentStore.registrations.map((r) => {
    const event = currentStore.events.find((e) => e.id === r.eventId);
    return {
      ...r,
      eventTitle: event ? event.title : 'General Admission',
      eventCategory: event ? event.category : 'General',
      startTime: event ? event.startTime : '',
      endTime: event ? event.endTime : '',
    };
  });

  if (filters.search) {
    const term = filters.search.toLowerCase().trim();
    list = list.filter(
      (r) =>
        (r.name || '').toLowerCase().includes(term) ||
        (r.email || '').toLowerCase().includes(term) ||
        (r.phone || '').toLowerCase().includes(term) ||
        (r.registrationId || '').toLowerCase().includes(term) ||
        (r.organization || '').toLowerCase().includes(term)
    );
  }

  if (filters.eventId && filters.eventId !== 'all') {
    list = list.filter((r) => r.eventId === filters.eventId);
  }

  if (filters.checkedIn !== undefined && filters.checkedIn !== 'all') {
    const isChecked =
      filters.checkedIn === '1' || filters.checkedIn === 1 || filters.checkedIn === 'true';
    list = list.filter((r) => Boolean(r.checkedIn) === isChecked);
  }

  // Sorting
  const sortBy = filters.sortBy || 'createdAt';
  const sortOrder = (filters.sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  list.sort((a, b) => {
    let valA = a[sortBy] ?? '';
    let valB = b[sortBy] ?? '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === 'ASC' ? -1 : 1;
    if (valA > valB) return sortOrder === 'ASC' ? 1 : -1;
    return 0;
  });

  return JSON.parse(JSON.stringify(list));
}

export function deleteRegistrationAdmin(registrationId) {
  const currentStore = getStore();
  const idx = currentStore.registrations.findIndex((r) => r.registrationId === registrationId);
  if (idx === -1) return false;

  currentStore.registrations.splice(idx, 1);
  saveStore();
  return true;
}

export function checkInAttendee(tokenOrId, options = {}) {
  const currentStore = getStore();
  const now = new Date().toISOString();
  const staffName = options.staffName || options.checkedInBy || 'Gate Staff';
  const targetEventId = options.targetEventId || options.eventId;

  const record = currentStore.registrations.find(
    (r) => r.qrToken === tokenOrId || r.registrationId === tokenOrId
  );

  if (!record) {
    return {
      success: false,
      status: 'NOT_FOUND',
      message: 'Invalid QR Code. No registration record exists for this token.',
      registration: null,
    };
  }

  const event = currentStore.events.find((e) => e.id === record.eventId);
  const enrichedRecord = {
    ...record,
    eventTitle: event ? event.title : 'Celebration Session',
    eventVenue: event ? event.venue : "Boys' Own Library Auditorium, Hatibagan, Kolkata",
    startTime: event ? event.startTime : '17:00',
    endTime: event ? event.endTime : '21:00',
    eventDate: event ? event.date : '2026-11-01',
  };

  if (targetEventId && targetEventId !== 'all' && record.eventId !== targetEventId) {
    return {
      success: false,
      status: 'WRONG_EVENT',
      message: `Pass is for "${enrichedRecord.eventTitle || record.eventId}", not the selected auditorium session.`,
      registration: enrichedRecord,
    };
  }

  if (record.checkedIn) {
    const formattedDate = record.checkedInAt
      ? new Date(record.checkedInAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      : 'earlier today';
    return {
      success: false,
      status: 'ALREADY_CHECKED_IN',
      message: `Pass already used! Previously checked in on ${formattedDate} by ${record.checkedInBy || 'Gate Staff'}.`,
      registration: enrichedRecord,
    };
  }

  // Update check-in status
  record.checkedIn = 1;
  record.checkedInAt = now;
  record.checkedInBy = staffName;

  enrichedRecord.checkedIn = 1;
  enrichedRecord.checkedInAt = now;
  enrichedRecord.checkedInBy = staffName;

  saveStore();

  return {
    success: true,
    status: 'ENTRY_CONFIRMED',
    message: 'ENTRY CONFIRMED',
    registration: enrichedRecord,
  };
}

export function undoCheckInAttendee(tokenOrId) {
  if (!tokenOrId) return { success: false, message: 'Ticket ID or token is required.' };
  const currentStore = getStore();
  const target = tokenOrId.trim();

  const record = currentStore.registrations.find(
    (r) => r.qrToken === target || r.registrationId === target
  );

  if (!record) {
    return { success: false, message: 'Attendee record not found.' };
  }

  record.checkedIn = 0;
  record.checkedInAt = null;
  record.checkedInBy = null;
  saveStore();

  const event = currentStore.events.find((e) => e.id === record.eventId);
  return {
    success: true,
    status: 'CHECKIN_RESET',
    message: `Check-in for ${record.name} has been reset to Not Arrived.`,
    registration: {
      ...record,
      eventTitle: event ? event.title : 'Celebration Session',
    },
  };
}

export function getAdminAnalytics() {
  const currentStore = getStore();
  const todayPrefix = new Date().toISOString().split('T')[0];

  const totalRegistrations = currentStore.registrations.length;
  const totalCheckedIn = currentStore.registrations.filter((r) => r.checkedIn === 1).length;
  const notArrived = Math.max(0, totalRegistrations - totalCheckedIn);

  const todayRegistrations = currentStore.registrations.filter(
    (r) => r.createdAt && r.createdAt.startsWith(todayPrefix)
  ).length;

  const todayCheckIns = currentStore.registrations.filter(
    (r) => r.checkedIn === 1 && r.checkedInAt && r.checkedInAt.startsWith(todayPrefix)
  ).length;

  const totalEvents = currentStore.events.length;
  const checkInRate =
    totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0;

  // Event stats
  const eventStats = currentStore.events.map((e) => {
    const regs = currentStore.registrations.filter((r) => r.eventId === e.id);
    const checkedInCount = regs.filter((r) => r.checkedIn === 1).length;
    return {
      id: e.id,
      title: e.title,
      category: e.category,
      startTime: e.startTime,
      endTime: e.endTime,
      totalRegistrations: regs.length,
      checkedInCount,
      pendingCount: regs.length - checkedInCount,
    };
  });
  eventStats.sort((a, b) => b.totalRegistrations - a.totalRegistrations);

  // Registrations over time
  const regDateCounts = {};
  currentStore.registrations.forEach((r) => {
    if (r.createdAt) {
      const date = r.createdAt.slice(0, 10);
      regDateCounts[date] = (regDateCounts[date] || 0) + 1;
    }
  });
  const registrationsOverTime = Object.keys(regDateCounts)
    .sort()
    .slice(-14)
    .map((dateGroup) => ({ dateGroup, count: regDateCounts[dateGroup] }));

  // Check-ins over time
  const checkInDateCounts = {};
  currentStore.registrations.forEach((r) => {
    if (r.checkedIn === 1 && r.checkedInAt) {
      const date = r.checkedInAt.slice(0, 10);
      checkInDateCounts[date] = (checkInDateCounts[date] || 0) + 1;
    }
  });
  const checkInsOverTime = Object.keys(checkInDateCounts)
    .sort()
    .slice(-14)
    .map((dateGroup) => ({ dateGroup, count: checkInDateCounts[dateGroup] }));

  // Hourly check-ins
  const hourCounts = {};
  currentStore.registrations.forEach((r) => {
    if (r.checkedIn === 1 && r.checkedInAt) {
      const hour = r.checkedInAt.slice(11, 13);
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });
  const hourlyCheckIns = Object.keys(hourCounts)
    .sort()
    .map((hourGroup) => ({ hourGroup, count: hourCounts[hourGroup] }));

  // Recent registrations
  const recentRegistrations = [...currentStore.registrations]
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 10)
    .map((r) => {
      const event = currentStore.events.find((e) => e.id === r.eventId);
      return {
        registrationId: r.registrationId,
        name: r.name,
        email: r.email,
        phone: r.phone,
        checkedIn: r.checkedIn,
        createdAt: r.createdAt,
        eventTitle: event ? event.title : 'Celebration',
      };
    });

  // Recent check-ins
  const recentCheckIns = currentStore.registrations
    .filter((r) => r.checkedIn === 1 && r.checkedInAt)
    .sort((a, b) => (b.checkedInAt || '').localeCompare(a.checkedInAt || ''))
    .slice(0, 10)
    .map((r) => {
      const event = currentStore.events.find((e) => e.id === r.eventId);
      return {
        registrationId: r.registrationId,
        name: r.name,
        email: r.email,
        checkedInAt: r.checkedInAt,
        checkedInBy: r.checkedInBy,
        eventTitle: event ? event.title : 'Celebration',
      };
    });

  return {
    totalRegistrations,
    totalCheckedIn,
    notArrived,
    todayRegistrations,
    todayCheckIns,
    totalEvents,
    checkInRate,
    eventStats,
    registrationsOverTime,
    checkInsOverTime,
    hourlyCheckIns,
    recentRegistrations,
    recentCheckIns,
  };
}
