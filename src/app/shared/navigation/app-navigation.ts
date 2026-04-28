export const APP_ROUTE_SEGMENTS = {
  home: '',
  waitlist: 'waitlist',
  pricing: 'pricing',
  login: 'login',
  register: 'register',
  dashboard: 'dashboard',
  calendar: 'calendar',
  courts: 'courts',
  configurator: 'configurator',
  privacy: 'privacy',
  terms: 'terms',
  contact: 'contact',
  help: 'help',
} as const;

export const APP_ROUTES = {
  home: '/',
  waitlist: '/waitlist',
  pricing: '/pricing',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  calendar: '/calendar',
  courts: '/courts',
  configurator: '/configurator',
  privacy: '/privacy',
  terms: '/terms',
  contact: '/contact',
  help: '/help',
} as const;

export interface FooterNavigationLink {
  route: string;
  labelKey: string;
  accent?: boolean;
}

export const FOOTER_NAVIGATION_LINKS: FooterNavigationLink[] = [
  { route: APP_ROUTES.privacy, labelKey: 'common.privacy' },
  { route: APP_ROUTES.terms, labelKey: 'common.terms' },
  { route: APP_ROUTES.contact, labelKey: 'common.contact' },
  { route: APP_ROUTES.help, labelKey: 'common.help', accent: true },
];
