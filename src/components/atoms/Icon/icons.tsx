import type { ReactElement } from 'react';
import { SYSTEM_ICONS } from './iconsSystem';

/**
 * Lokale Linien-Icons (24×24, Kontur in currentColor). Bewusst klein gehalten:
 * neue Icons hier ergänzen statt einer Icon-Bibliothek.
 */
export const ICONS = {
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M10.6 5.6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.6 3.4M6.6 6.7C3.9 8.4 2.5 12 2.5 12S6 18.5 12 18.5a9 9 0 0 0 4.8-1.3" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
    </>
  ),
  ticket: (
    <>
      <path d="M4 6h16a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a2 2 0 0 0 0-4V7a1 1 0 0 1 1-1Z" />
      <path d="M15 7.5v1.5M15 11.25v1.5M15 15v1.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.75v.01" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.25v.01" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.75 2.75L16 10" />
    </>
  ),
  arrowLeft: <path d="M19 12H5m6-6-6 6 6 6" />,
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.4-4.4" />
    </>
  ),
  sliders: <path d="M4 7h10m4 0h2M4 17h4m4 0h8M14 4.5v5M8 14.5v5" />,
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
    </>
  ),
  list: (
    <>
      <rect x="4" y="4.5" width="5" height="5" rx="1" />
      <rect x="4" y="14.5" width="5" height="5" rx="1" />
      <path d="M12.5 7h7.5M12.5 17h7.5" />
    </>
  ),
  heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />,
  star: <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />,
  leaf: (
    <>
      <path d="M12 21v-6" />
      <path d="M12 15c-1.5-3.5-1.5-7.5 0-11.5 1.5 4 1.5 8 0 11.5Z" />
      <path d="M12 15c-3-.8-5.6-3.2-7-6.8 3.6.6 6 3 7 6.8ZM12 15c3-.8 5.6-3.2 7-6.8-3.6.6-6 3-7 6.8Z" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.8" />
    </>
  ),
  moon: <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z" />,
  sparkle: <path d="M12 3.5c.6 4.2 2.3 5.9 6.5 6.5-4.2.6-5.9 2.3-6.5 6.5-.6-4.2-2.3-5.9-6.5-6.5 4.2-.6 5.9-2.3 6.5-6.5ZM18.5 15.5c.3 1.6.9 2.2 2.5 2.5-1.6.3-2.2.9-2.5 2.5-.3-1.6-.9-2.2-2.5-2.5 1.6-.3 2.2-.9 2.5-2.5Z" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  book: (
    <>
      <path d="M5 4.5h11a2 2 0 0 1 2 2v13H7a2 2 0 0 1-2-2v-13Z" />
      <path d="M5 17.5a2 2 0 0 1 2-2h11M9 8.5h5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.6a3.2 3.2 0 0 1 0 5.8M17.5 14.2A5.5 5.5 0 0 1 20.5 19" />
    </>
  ),
  news: (
    <>
      <path d="M4 5h12.5v12.5a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2V5Z" />
      <path d="M16.5 9H20v8.5a1.75 1.75 0 0 1-3.5 0M7.5 8.5H13M7.5 12H13M7.5 15.5h3" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M10.3 3.5h3.4l.5 2.4 1.7 1 2.3-.8 1.7 2.9-1.8 1.6v2.8l1.8 1.6-1.7 2.9-2.3-.8-1.7 1-.5 2.4h-3.4l-.5-2.4-1.7-1-2.3.8L4.1 15l1.8-1.6v-2.8L4.1 9l1.7-2.9 2.3.8 1.7-1 .5-2.4Z" />
    </>
  ),
  tick: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  reset: <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4.5H15" />,
  externalLink: <path d="M7 17 17 7M9 7h8v8" />,
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  vaporizer: (
    <>
      <rect x="8" y="8" width="8" height="12.5" rx="2" />
      <path d="M10.5 8V4.5h3V8M12 13v.01M12 16.5v.01" />
    </>
  ),
  joint: <path d="m4 20 1.5-3.5L15 7l2 2-9.5 9.5L4 20ZM17.5 6.5c0-1.5 1.5-1.5 1.5-3" />,
  bong: <path d="M10 3.5h4M10.5 3.5v7L6.4 17a2.3 2.3 0 0 0 2 3.5h7.2a2.3 2.3 0 0 0 2-3.5l-4.1-6.5v-7M7.8 15h8.4M14 12l3.5-3.5" />,
  pipe: <path d="M3.5 8.5h3c2.5 0 3.5 5 7 5V10H20v3.5c0 3-2 5-5 5-5 0-5.5-6.5-8.5-6.5h-3v-3.5Z" />,
  edible: (
    <>
      <path d="M20 12a8 8 0 1 1-8-8c0 2 1.2 3.2 3 3.2 0 2 1.2 3 3 3 .3 1 .9 1.6 2 1.8Z" />
      <path d="M9 10v.01M9.5 15v.01M14 14.5v.01" />
    </>
  ),
  dots: (
    <>
      <circle cx="6" cy="12" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="18" cy="12" r="1.2" />
    </>
  ),
  logOut: <path d="M14 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H14M10 12h10m-3.5-3.5L20 12l-3.5 3.5" />,
  ...SYSTEM_ICONS,
} satisfies Record<string, ReactElement>;

export type IconName = keyof typeof ICONS;
