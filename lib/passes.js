/**
 * Goynar Baksho Annual Celebration 2026 - Registration Pass Categories
 * Standard 4 attendee pass categories for public registration:
 * 1. Cultural Events Pass
 * 2. Guest / VIP Pass
 * 3. All-Access Festival Pass
 * 4. Other / General Visitor Pass
 */

export const PASS_CATEGORIES = [
  {
    id: 'gb-pass-cultural',
    title: 'Cultural Events Pass',
    category: 'Cultural',
    description: 'Access to classical dance recitals, vocal music, live band concert, and theatre performances.',
    startTime: '13:00',
    endTime: '18:30',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    badgeLabel: 'Cultural Pass',
  },
  {
    id: 'gb-pass-guest',
    title: 'Guest / VIP Pass',
    category: 'Guest',
    description: 'Special seating pass for invited dignitaries, celebrity interactions, and media partners.',
    startTime: '13:00',
    endTime: '18:30',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    badgeLabel: 'Guest / VIP',
  },
  {
    id: 'gb-pass-all',
    title: 'All-Access Festival Pass',
    category: 'All-Access',
    description: 'Universal festival pass covering all 28 sessions from Vedic chanting to the grand finale (1:00 PM – 6:30 PM).',
    startTime: '13:00',
    endTime: '18:30',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    badgeLabel: 'All-Access',
  },
  {
    id: 'gb-pass-other',
    title: 'Other / General Visitor Pass',
    category: 'Other',
    description: 'General attendee entry pass for community delegates, supporters, companions, and others.',
    startTime: '13:00',
    endTime: '18:30',
    venue: "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
    badgeLabel: 'Other / General',
  },
];

export function getPassCategoryById(id) {
  if (!id) return null;
  return PASS_CATEGORIES.find((p) => p.id === id) || null;
}
