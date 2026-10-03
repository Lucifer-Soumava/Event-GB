import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'events.db');
let db;

export function getDatabase() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initDatabase(db);
  }
  return db;
}

function initDatabase(database) {
  // Create events table according to requirements
  database.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      venue TEXT NOT NULL,
      category TEXT NOT NULL,
      image TEXT,
      status TEXT NOT NULL DEFAULT 'scheduled',
      displayOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
    CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
    CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
    CREATE INDEX IF NOT EXISTS idx_events_display_order ON events(displayOrder);

    CREATE TABLE IF NOT EXISTS registrations (
      registrationId TEXT PRIMARY KEY,
      eventId TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      organization TEXT,
      qrToken TEXT NOT NULL UNIQUE,
      checkedIn INTEGER NOT NULL DEFAULT 0,
      checkedInAt TEXT,
      checkedInBy TEXT,
      createdAt TEXT NOT NULL,
      CONSTRAINT unique_email_event UNIQUE (email, eventId),
      FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_reg_email ON registrations(email);
    CREATE INDEX IF NOT EXISTS idx_reg_event ON registrations(eventId);
    CREATE INDEX IF NOT EXISTS idx_reg_checked_in ON registrations(checkedIn);
    CREATE INDEX IF NOT EXISTS idx_reg_qr_token ON registrations(qrToken);

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('ADMIN', 'CHECKIN_STAFF')),
      isActive INTEGER NOT NULL DEFAULT 1,
      lastLoginAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  // Ensure backward-compatibility migration for checkedInBy column on existing databases
  try {
    database.exec('ALTER TABLE registrations ADD COLUMN checkedInBy TEXT');
  } catch {
    // Column already exists
  }

  // Check if events exist; if empty, seed initial schedule
  const countStmt = database.prepare('SELECT COUNT(*) as count FROM events');
  const { count } = countStmt.get();

  if (count === 0) {
    seedInitialSchedule(database);
  }

  // Check if users exist; if empty, seed default admin & staff accounts
  const userCountStmt = database.prepare('SELECT COUNT(*) as count FROM users');
  const { count: userCount } = userCountStmt.get();

  if (userCount === 0) {
    seedInitialUsers(database);
  }
}

function seedInitialUsers(database) {
  const insertStmt = database.prepare(`
    INSERT INTO users (
      id, username, email, passwordHash, name, role, isActive, lastLoginAt, createdAt, updatedAt
    ) VALUES (
      @id, @username, @email, @passwordHash, @name, @role, @isActive, @lastLoginAt, @createdAt, @updatedAt
    )
  `);

  const now = new Date().toISOString();
  // Pre-seed bcrypt-hashed passwords
  // admin: Admin@Goynar2026!
  // staff: Staff@Goynar2026!
  const adminHash = bcrypt.hashSync('Admin@Goynar2026!', 10);
  const staffHash = bcrypt.hashSync('Staff@Goynar2026!', 10);

  const initialUsers = [
    {
      id: 'usr-admin-01',
      username: 'admin',
      email: 'admin@goynarbaksho.org',
      passwordHash: adminHash,
      name: 'Festival Administrator',
      role: 'ADMIN',
      isActive: 1,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'usr-staff-01',
      username: 'staff',
      email: 'staff@goynarbaksho.org',
      passwordHash: staffHash,
      name: 'Auditorium Gate Staff',
      role: 'CHECKIN_STAFF',
      isActive: 1,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const transaction = database.transaction((users) => {
    for (const user of users) {
      insertStmt.run(user);
    }
  });

  transaction(initialUsers);
}

function seedInitialSchedule(database) {
  const insertStmt = database.prepare(`
    INSERT INTO events (
      id, title, description, date, startTime, endTime, venue, category, image, status, displayOrder, createdAt, updatedAt
    ) VALUES (
      @id, @title, @description, @date, @startTime, @endTime, @venue, @category, @image, @status, @displayOrder, @createdAt, @updatedAt
    )
  `);

  const now = new Date().toISOString();
  const initialEvents = [
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
      createdAt: now,
      updatedAt: now,
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
      createdAt: now,
      updatedAt: now,
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
      createdAt: now,
      updatedAt: now,
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
      createdAt: now,
      updatedAt: now,
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
      createdAt: now,
      updatedAt: now,
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
      createdAt: now,
      updatedAt: now,
    },
  ];

  const transaction = database.transaction((events) => {
    for (const event of events) {
      insertStmt.run(event);
    }
  });

  transaction(initialEvents);
}

// Database query helpers
export function getAllEvents(filters = {}) {
  const database = getDatabase();
  let query = 'SELECT * FROM events WHERE 1=1';
  const params = [];

  if (filters.category && filters.category !== 'all') {
    query += ' AND LOWER(category) = LOWER(?)';
    params.push(filters.category);
  }

  if (filters.status && filters.status !== 'all') {
    query += ' AND LOWER(status) = LOWER(?)';
    params.push(filters.status);
  }

  if (filters.date) {
    query += ' AND date = ?';
    params.push(filters.date);
  }

  if (filters.search) {
    query += ' AND (title LIKE ? OR description LIKE ? OR venue LIKE ?)';
    const term = `%${filters.search}%`;
    params.push(term, term, term);
  }

  if (filters.orderBy === 'displayOrder') {
    query += ' ORDER BY displayOrder ASC, startTime ASC';
  } else {
    query += ' ORDER BY displayOrder ASC, date ASC, startTime ASC';
  }

  const stmt = database.prepare(query);
  return stmt.all(...params);
}

export function getEventById(id) {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM events WHERE id = ?');
  return stmt.get(id);
}

export function getCategories() {
  const database = getDatabase();
  const stmt = database.prepare('SELECT DISTINCT category FROM events ORDER BY category ASC');
  return stmt.all().map((r) => r.category);
}

export function createEvent(eventData) {
  const database = getDatabase();
  const id = eventData.id || `gb-${Date.now()}`;
  const now = new Date().toISOString();

  // If displayOrder not specified, place it after the max displayOrder
  let displayOrder = Number(eventData.displayOrder);
  if (isNaN(displayOrder) || displayOrder === undefined || displayOrder === null) {
    const maxOrderStmt = database.prepare('SELECT MAX(displayOrder) as maxOrder FROM events');
    const { maxOrder } = maxOrderStmt.get();
    displayOrder = (maxOrder || 0) + 1;
  }

  const stmt = database.prepare(`
    INSERT INTO events (
      id, title, description, date, startTime, endTime, venue, category, image, status, displayOrder, createdAt, updatedAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  stmt.run(
    id,
    eventData.title,
    eventData.description,
    eventData.date,
    eventData.startTime,
    eventData.endTime,
    eventData.venue,
    eventData.category,
    eventData.image || '/images/hero-stage.jpg',
    eventData.status || 'scheduled',
    displayOrder,
    now,
    now
  );

  return getEventById(id);
}

export function updateEvent(id, eventData) {
  const database = getDatabase();
  const existing = getEventById(id);
  if (!existing) return null;

  const now = new Date().toISOString();

  const title = eventData.title !== undefined ? eventData.title : existing.title;
  const description = eventData.description !== undefined ? eventData.description : existing.description;
  const date = eventData.date !== undefined ? eventData.date : existing.date;
  const startTime = eventData.startTime !== undefined ? eventData.startTime : existing.startTime;
  const endTime = eventData.endTime !== undefined ? eventData.endTime : existing.endTime;
  const venue = eventData.venue !== undefined ? eventData.venue : existing.venue;
  const category = eventData.category !== undefined ? eventData.category : existing.category;
  const image = eventData.image !== undefined ? eventData.image : existing.image;
  const status = eventData.status !== undefined ? eventData.status : existing.status;
  const displayOrder = eventData.displayOrder !== undefined ? Number(eventData.displayOrder) : existing.displayOrder;

  const stmt = database.prepare(`
    UPDATE events SET
      title = ?,
      description = ?,
      date = ?,
      startTime = ?,
      endTime = ?,
      venue = ?,
      category = ?,
      image = ?,
      status = ?,
      displayOrder = ?,
      updatedAt = ?
    WHERE id = ?
  `);

  stmt.run(
    title,
    description,
    date,
    startTime,
    endTime,
    venue,
    category,
    image,
    status,
    displayOrder,
    now,
    id
  );

  return getEventById(id);
}

export function reorderEvents(orderedIds) {
  const database = getDatabase();
  const now = new Date().toISOString();
  const updateStmt = database.prepare('UPDATE events SET displayOrder = ?, updatedAt = ? WHERE id = ?');

  const transaction = database.transaction((ids) => {
    ids.forEach((id, index) => {
      updateStmt.run(index + 1, now, id);
    });
  });

  transaction(orderedIds);
  return getAllEvents();
}

export function deleteEvent(id) {
  const database = getDatabase();
  const stmt = database.prepare('DELETE FROM events WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

/* ====================================================================
 * REGISTRATION SYSTEM & QR TOKEN METHODS
 * ==================================================================== */
export function generateRegistrationId() {
  // Generates unique, memorable ID format: GB26-XXXXXX-XXXX
  const hexPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  const numPart = Math.floor(1000 + Math.random() * 9000);
  return `GB26-${hexPart}-${numPart}`;
}

export function generateQrToken() {
  // 32-character cryptographically random, URL-safe token
  return crypto.randomBytes(24).toString('base64url');
}

export function isEmailRegisteredForEvent(email, eventId) {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT COUNT(*) as count 
    FROM registrations 
    WHERE LOWER(email) = LOWER(?) AND eventId = ?
  `);
  const { count } = stmt.get(email, eventId);
  return count > 0;
}

export function createRegistration({ eventId, name, email, phone, organization }) {
  const database = getDatabase();

  // Verify duplicate before insert
  if (isEmailRegisteredForEvent(email, eventId)) {
    const error = new Error('This email address is already registered for this celebration session.');
    error.code = 'DUPLICATE_REGISTRATION';
    throw error;
  }

  const registrationId = generateRegistrationId();
  const qrToken = generateQrToken();
  const now = new Date().toISOString();

  const stmt = database.prepare(`
    INSERT INTO registrations (
      registrationId, eventId, name, email, phone, organization, qrToken, checkedIn, checkedInAt, createdAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, 0, NULL, ?
    )
  `);

  stmt.run(
    registrationId,
    eventId,
    name.trim(),
    email.trim().toLowerCase(),
    phone.trim(),
    organization ? organization.trim() : null,
    qrToken,
    now
  );

  return getRegistrationById(registrationId);
}

export function getRegistrationById(registrationId) {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT 
      r.registrationId, 
      r.eventId, 
      r.name, 
      r.email, 
      r.phone, 
      r.organization, 
      r.qrToken, 
      r.checkedIn, 
      r.checkedInAt, 
      r.checkedInBy,
      r.createdAt,
      e.title as eventTitle, 
      e.date as eventDate, 
      e.startTime, 
      e.endTime, 
      e.venue as eventVenue, 
      e.category as eventCategory
    FROM registrations r
    LEFT JOIN events e ON r.eventId = e.id
    WHERE r.registrationId = ?
  `);
  return stmt.get(registrationId);
}

export function getRegistrationByQrToken(qrToken) {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT 
      r.registrationId, 
      r.eventId, 
      r.name, 
      r.email, 
      r.phone, 
      r.organization, 
      r.checkedIn, 
      r.checkedInAt,
      r.checkedInBy,
      e.title as eventTitle, 
      e.date as eventDate, 
      e.venue as eventVenue
    FROM registrations r
    LEFT JOIN events e ON r.eventId = e.id
    WHERE r.qrToken = ?
  `);
  return stmt.get(qrToken);
}

/* ====================================================================
 * USER & AUTHENTICATION METHODS
 * ==================================================================== */
export function getUserByUsernameOrEmail(identifier) {
  if (!identifier) return null;
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT * FROM users 
    WHERE (LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)) AND isActive = 1
  `);
  return stmt.get(identifier.trim(), identifier.trim());
}

export function getUserById(id) {
  const database = getDatabase();
  const stmt = database.prepare('SELECT id, username, email, name, role, isActive, lastLoginAt, createdAt FROM users WHERE id = ?');
  return stmt.get(id);
}

export function updateUserLastLogin(id) {
  const database = getDatabase();
  const now = new Date().toISOString();
  const stmt = database.prepare('UPDATE users SET lastLoginAt = ?, updatedAt = ? WHERE id = ?');
  stmt.run(now, now, id);
}

export function getAllUsers() {
  const database = getDatabase();
  const stmt = database.prepare('SELECT id, username, email, name, role, isActive, lastLoginAt, createdAt FROM users ORDER BY createdAt ASC');
  return stmt.all();
}

/* ====================================================================
 * ADMIN REGISTRATION MANAGEMENT & CHECK-IN METHODS
 * ==================================================================== */
export function getAllRegistrationsAdmin(filters = {}) {
  const database = getDatabase();
  let query = `
    SELECT 
      r.registrationId, 
      r.eventId, 
      r.name, 
      r.email, 
      r.phone, 
      r.organization, 
      r.qrToken, 
      r.checkedIn, 
      r.checkedInAt, 
      r.checkedInBy,
      r.createdAt,
      e.title as eventTitle, 
      e.category as eventCategory,
      e.startTime,
      e.endTime
    FROM registrations r
    LEFT JOIN events e ON r.eventId = e.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.search) {
    query += ' AND (r.name LIKE ? OR r.email LIKE ? OR r.phone LIKE ? OR r.registrationId LIKE ? OR r.organization LIKE ?)';
    const term = `%${filters.search}%`;
    params.push(term, term, term, term, term);
  }

  if (filters.eventId && filters.eventId !== 'all') {
    query += ' AND r.eventId = ?';
    params.push(filters.eventId);
  }

  if (filters.checkedIn !== undefined && filters.checkedIn !== 'all') {
    query += ' AND r.checkedIn = ?';
    params.push(filters.checkedIn === '1' || filters.checkedIn === 1 || filters.checkedIn === 'true' ? 1 : 0);
  }

  // Dynamic sorting
  const sortBy = filters.sortBy || 'createdAt';
  const sortOrder = (filters.sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const allowedSortColumns = {
    name: 'r.name',
    registrationId: 'r.registrationId',
    email: 'r.email',
    phone: 'r.phone',
    createdAt: 'r.createdAt',
    checkedIn: 'r.checkedIn',
    checkedInAt: 'r.checkedInAt',
    eventTitle: 'e.title',
  };

  const sortColumn = allowedSortColumns[sortBy] || 'r.createdAt';
  query += ` ORDER BY ${sortColumn} ${sortOrder}`;

  const stmt = database.prepare(query);
  return stmt.all(...params);
}

export function deleteRegistrationAdmin(registrationId) {
  const database = getDatabase();
  const stmt = database.prepare('DELETE FROM registrations WHERE registrationId = ?');
  const result = stmt.run(registrationId);
  return result.changes > 0;
}

export function checkInAttendee(tokenOrId, options = {}) {
  const database = getDatabase();
  const now = new Date().toISOString();
  const staffName = options.staffName || options.checkedInBy || 'Gate Staff';
  const targetEventId = options.targetEventId || options.eventId;

  // Ensure checkedInBy column exists in registrations
  try {
    database.exec('ALTER TABLE registrations ADD COLUMN checkedInBy TEXT');
  } catch {
    // Column already exists
  }

  // Find registration either by qrToken or registrationId
  const findStmt = database.prepare(`
    SELECT r.*, e.title as eventTitle, e.venue as eventVenue, e.startTime, e.endTime, e.date as eventDate
    FROM registrations r
    LEFT JOIN events e ON r.eventId = e.id
    WHERE r.qrToken = ? OR r.registrationId = ?
  `);
  const record = findStmt.get(tokenOrId, tokenOrId);

  if (!record) {
    return {
      success: false,
      status: 'NOT_FOUND',
      message: 'Invalid QR Code. No registration record exists for this token.',
      registration: null,
    };
  }

  // Check whether registration belongs to the correct event if targetEventId is specified
  if (targetEventId && targetEventId !== 'all' && record.eventId !== targetEventId) {
    return {
      success: false,
      status: 'WRONG_EVENT',
      message: `Pass is for "${record.eventTitle || record.eventId}", not the selected auditorium session.`,
      registration: record,
    };
  }

  if (record.checkedIn) {
    return {
      success: false,
      status: 'ALREADY_CHECKED_IN',
      message: `Pass already used! Previously checked in on ${new Date(record.checkedInAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} by ${record.checkedInBy || 'Gate Staff'}.`,
      registration: record,
    };
  }

  // Perform authoritative backend check-in
  const updateStmt = database.prepare(`
    UPDATE registrations 
    SET checkedIn = 1, checkedInAt = ?, checkedInBy = ?
    WHERE registrationId = ?
  `);
  updateStmt.run(now, staffName, record.registrationId);

  record.checkedIn = 1;
  record.checkedInAt = now;
  record.checkedInBy = staffName;

  return {
    success: true,
    status: 'ENTRY_CONFIRMED',
    message: 'ENTRY CONFIRMED',
    registration: record,
  };
}

export function getAdminAnalytics() {
  const database = getDatabase();
  const todayPrefix = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Total registrations
  const totalRegStmt = database.prepare('SELECT COUNT(*) as count FROM registrations');
  const totalRegistrations = totalRegStmt.get().count;

  // Checked-in attendees
  const checkedInStmt = database.prepare('SELECT COUNT(*) as count FROM registrations WHERE checkedIn = 1');
  const totalCheckedIn = checkedInStmt.get().count;

  // Not-yet-arrived attendees
  const notArrived = Math.max(0, totalRegistrations - totalCheckedIn);

  // Today's registrations
  const todayRegStmt = database.prepare('SELECT COUNT(*) as count FROM registrations WHERE createdAt LIKE ?');
  const todayRegistrations = todayRegStmt.get(`${todayPrefix}%`).count;

  // Today's check-ins
  const todayCheckInStmt = database.prepare('SELECT COUNT(*) as count FROM registrations WHERE checkedIn = 1 AND checkedInAt LIKE ?');
  const todayCheckIns = todayCheckInStmt.get(`${todayPrefix}%`).count;

  // Scheduled events
  const totalEventsStmt = database.prepare('SELECT COUNT(*) as count FROM events');
  const totalEvents = totalEventsStmt.get().count;

  // Attendance by event/session
  const eventStatsStmt = database.prepare(`
    SELECT 
      e.id, 
      e.title, 
      e.category, 
      e.startTime, 
      e.endTime,
      COUNT(r.registrationId) as totalRegistrations,
      SUM(CASE WHEN r.checkedIn = 1 THEN 1 ELSE 0 END) as checkedInCount,
      SUM(CASE WHEN r.checkedIn = 0 OR r.checkedIn IS NULL THEN 1 ELSE 0 END) as pendingCount
    FROM events e
    LEFT JOIN registrations r ON e.id = r.eventId
    GROUP BY e.id
    ORDER BY totalRegistrations DESC, e.displayOrder ASC
  `);
  const eventStats = eventStatsStmt.all();

  // Registrations over time (aggregated by Date / Day)
  const regOverTimeStmt = database.prepare(`
    SELECT 
      substr(createdAt, 1, 10) as dateGroup,
      COUNT(*) as count
    FROM registrations
    GROUP BY dateGroup
    ORDER BY dateGroup ASC
    LIMIT 14
  `);
  const registrationsOverTime = regOverTimeStmt.all();

  // Check-ins over time (aggregated by Date or Hour)
  const checkInsOverTimeStmt = database.prepare(`
    SELECT 
      substr(checkedInAt, 1, 10) as dateGroup,
      COUNT(*) as count
    FROM registrations
    WHERE checkedIn = 1 AND checkedInAt IS NOT NULL
    GROUP BY dateGroup
    ORDER BY dateGroup ASC
    LIMIT 14
  `);
  const checkInsOverTime = checkInsOverTimeStmt.all();

  // Hourly check-ins for the event day
  const hourlyCheckInsStmt = database.prepare(`
    SELECT 
      substr(checkedInAt, 12, 2) as hourGroup,
      COUNT(*) as count
    FROM registrations
    WHERE checkedIn = 1 AND checkedInAt IS NOT NULL
    GROUP BY hourGroup
    ORDER BY hourGroup ASC
  `);
  const hourlyCheckIns = hourlyCheckInsStmt.all();

  const recentRegistrationsStmt = database.prepare(`
    SELECT r.registrationId, r.name, r.email, r.phone, r.checkedIn, r.createdAt, e.title as eventTitle
    FROM registrations r
    LEFT JOIN events e ON r.eventId = e.id
    ORDER BY r.createdAt DESC
    LIMIT 10
  `);
  const recentRegistrations = recentRegistrationsStmt.all();

  const recentCheckInsStmt = database.prepare(`
    SELECT r.registrationId, r.name, r.email, r.checkedInAt, r.checkedInBy, e.title as eventTitle
    FROM registrations r
    LEFT JOIN events e ON r.eventId = e.id
    WHERE r.checkedIn = 1
    ORDER BY r.checkedInAt DESC
    LIMIT 10
  `);
  const recentCheckIns = recentCheckInsStmt.all();

  return {
    totalRegistrations,
    totalCheckedIn,
    notArrived,
    todayRegistrations,
    todayCheckIns,
    totalEvents,
    checkInRate: totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0,
    eventStats,
    registrationsOverTime,
    checkInsOverTime,
    hourlyCheckIns,
    recentRegistrations,
    recentCheckIns,
  };
}

