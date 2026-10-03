# Goynar Baksho Annual Celebration 2026 🎭

> **“নতুন শিল্পী, নতুন কণ্ঠ, নতুন সুর”**
> *(New Artists, New Voices, New Melodies)*

Official web platform and gate check-in administration portal for the **Goynar Baksho Annual Celebration 2026**, held on **1 November 2026** at **Boys' Own Library Auditorium, Hatibagan, Kolkata**.

---

## ✨ Features

- **🏛️ Cultural Aesthetics**: Obsidian black and antique gold design language inspired by classical Bengali heritage, Alpona motifs, and cinematic theatre lighting.
- **📱 Responsive Across All Devices**: Polished for modern mobile, tablet, and desktop viewports with fluid clamp typography and accessible touch targets.
- **📅 Dynamic Timetable**: Live schedule retrieved from SQLite database with category filters (Music, Dance, Recitation, Theatre, Honors).
- **🎫 Attendee Registration & Pass Generation**: Generates digital invitation passes with cryptographic QR codes for entry verification.
- **🛡️ Admin Management & Gate Check-in Portal**:
  - Event CRUD (add, edit timings/venues, reorder display order, publish/unpublish).
  - Gate check-in terminal with camera QR scanner and instant attendee verification.
  - Role-based access control (`ADMIN` and `CHECKIN_STAFF`).
  - Real-time attendance and registration analytics.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Soumyadeepsingha06/Event-GB.git
cd Event-GB

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Admin Credentials

Pre-seeded credentials for local evaluation:

- **Login URL**: `/admin/login`
- **Administrator**: `admin` / `Admin@Goynar2026!`
- **Check-in Staff**: `staff` / `Staff@Goynar2026!`

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI & Styling**: Vanilla CSS Design System with CSS Tokens & Fluid Typography
- **Database**: SQLite (`better-sqlite3`)
- **Authentication**: JWT & Cookie-based sessions with `jose` & `bcryptjs`
- **QR & Scanner**: `qrcode`, `jsqr`
