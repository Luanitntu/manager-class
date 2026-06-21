import type { UserRole } from '~/stores/auth';

export interface NavItem {
  title: string;
  icon: string;
  to: string;
  mobile?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface QuickAction {
  label: string;
  icon: string;
  to: string;
}

const teacherNav: NavGroup[] = [
  {
    title: 'Daily',
    items: [
      { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/dashboard', mobile: true },
      { title: 'Calendar', icon: 'mdi-calendar-month-outline', to: '/calendar', mobile: true },
    ],
  },
  {
    title: 'Teaching',
    items: [
      { title: 'Classes', icon: 'mdi-google-classroom', to: '/classes', mobile: true },
      { title: 'Students', icon: 'mdi-account-school-outline', to: '/students', mobile: true },
      { title: 'Assistants', icon: 'mdi-account-tie-outline', to: '/assistants' },
      { title: 'Documents', icon: 'mdi-file-document-outline', to: '/documents', mobile: true },
    ],
  },
  {
    title: 'Operations',
    items: [
      { title: 'Payments', icon: 'mdi-cash-multiple', to: '/payments' },
      { title: 'Reports', icon: 'mdi-chart-box-outline', to: '/reports' },
      { title: 'Audit Logs', icon: 'mdi-history', to: '/audit-logs' },
      { title: 'Profile', icon: 'mdi-account-circle-outline', to: '/profile' },
    ],
  },
];

const studentNav: NavGroup[] = [
  {
    title: 'Today',
    items: [
      { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/dashboard', mobile: true },
      { title: 'Schedule', icon: 'mdi-calendar-month-outline', to: '/calendar', mobile: true },
    ],
  },
  {
    title: 'Learning',
    items: [
      { title: 'Classes', icon: 'mdi-google-classroom', to: '/classes', mobile: true },
      { title: 'Documents', icon: 'mdi-file-document-outline', to: '/documents', mobile: true },
    ],
  },
  {
    title: 'Account',
    items: [
      { title: 'Payments', icon: 'mdi-cash-multiple', to: '/payments', mobile: true },
      { title: 'Profile', icon: 'mdi-account-circle-outline', to: '/profile' },
    ],
  },
];

const assistantNav: NavGroup[] = [
  {
    title: 'Daily',
    items: [
      { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/dashboard', mobile: true },
      { title: 'Calendar', icon: 'mdi-calendar-month-outline', to: '/calendar', mobile: true },
      { title: 'Classes', icon: 'mdi-google-classroom', to: '/classes', mobile: true },
      { title: 'Profile', icon: 'mdi-account-circle-outline', to: '/profile', mobile: true },
    ],
  },
];

const superAdminNav: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/dashboard', mobile: true },
      { title: 'Audit Logs', icon: 'mdi-history', to: '/audit-logs', mobile: true },
      { title: 'Profile', icon: 'mdi-account-circle-outline', to: '/profile', mobile: true },
    ],
  },
];

export function getNavigation(role: UserRole | null): NavGroup[] {
  switch (role) {
    case 'STUDENT':
      return studentNav;
    case 'ASSISTANT':
      return assistantNav;
    case 'SUPER_ADMIN':
      return superAdminNav;
    case 'TEACHER':
    default:
      return teacherNav;
  }
}

export function getMobileNavigation(role: UserRole | null): NavItem[] {
  return getNavigation(role)
    .flatMap((group) => group.items)
    .filter((item) => item.mobile)
    .slice(0, 5);
}

export function getDefaultRoute(role: UserRole | null): string {
  if (role === 'SUPER_ADMIN') return '/dashboard';
  if (role === 'STUDENT') return '/dashboard';
  return '/calendar';
}

export function getRoleLabel(role: UserRole | null): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super admin';
    case 'TEACHER':
      return 'Teacher';
    case 'ASSISTANT':
      return 'Assistant';
    case 'STUDENT':
      return 'Student';
    default:
      return 'Guest';
  }
}

export function getQuickAction(role: UserRole | null): QuickAction | null {
  if (role === 'TEACHER') {
    return { label: 'New session', icon: 'mdi-plus', to: '/calendar' };
  }
  if (role === 'STUDENT') {
    return { label: 'View schedule', icon: 'mdi-calendar-month-outline', to: '/calendar' };
  }
  return null;
}
