// Navigation menu items
export const MENU_ITEMS = {
  HOME: { href: '/', label: 'Home', icon: '🏠' },
  TEAMS: { href: '/teams', label: 'Team Standings', icon: '📊' },
  AWARDS: { href: '/awards', label: 'Awards', icon: '🏆' },
  JOIN_LEAGUE: { href: '/join-league', label: 'Join League', icon: '➕' },
} as const;

// Navigation items for users with teams
export const FULL_MENU_ITEMS = [
  MENU_ITEMS.HOME,
  MENU_ITEMS.TEAMS,
  MENU_ITEMS.AWARDS,
  MENU_ITEMS.JOIN_LEAGUE,
];

// Navigation items for users without teams
export const LIMITED_MENU_ITEMS = [
  MENU_ITEMS.JOIN_LEAGUE,
];

// App constants
export const APP_NAME = 'BineTime';
export const APP_SUBTITLE = 'Your hop-themed fantasy football hub';
export const APP_DESCRIPTION = 'From the bine to the shrine - track awards, standings, and more';