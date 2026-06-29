type QueryInput = URLSearchParams | string;

function withQuery(path: string, query: QueryInput): string {
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

export const ApiEndpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
  },
  dashboard: '/dashboard',
  reports: {
    download: (type: string, query: QueryInput) => withQuery(`/reports/${type}`, query),
  },
  auditLogs: {
    list: (query: QueryInput) => withQuery('/audit-logs', query),
  },
  classes: {
    root: '/classes',
    list: (query: QueryInput) => withQuery('/classes', query),
    detail: (id: string) => `/classes/${id}`,
    sessions: (id: string) => `/classes/${id}/sessions`,
    students: (id: string) => `/classes/${id}/students`,
    student: (classId: string, studentId: string) => `/classes/${classId}/students/${studentId}`,
  },
  sessions: {
    list: (query: QueryInput) => withQuery('/sessions', query),
    create: '/sessions',
    bulk: '/sessions/bulk',
    detail: (id: string) => `/sessions/${id}`,
  },
  students: {
    root: '/students',
    list: (query: QueryInput) => withQuery('/students', query),
    detail: (id: string) => `/students/${id}`,
    profile: (id: string) => `/students/${id}/profile`,
    scores: (id: string) => `/students/${id}/scores`,
    score: (scoreId: string) => `/students/scores/${scoreId}`,
    payments: (id: string) => `/students/${id}/payments`,
    activity: (id: string) => `/students/${id}/activity`,
    comments: (id: string) => `/students/${id}/comments`,
  },
  assistants: {
    root: '/assistants',
    list: (query: QueryInput) => withQuery('/assistants', query),
    detail: (id: string) => `/assistants/${id}`,
    salary: (id: string) => `/assistants/${id}/salary`,
    salarySummary: (id: string) => `/assistants/${id}/salary-summary`,
    sessions: (id: string) => `/assistants/${id}/sessions`,
  },
  documents: {
    list: (query: QueryInput) => withQuery('/documents', query),
    create: '/documents',
    categories: '/documents/categories',
    upload: '/documents/upload',
    detail: (id: string) => `/documents/${id}`,
    download: (id: string) => `/documents/${id}/download`,
    assignments: (id: string) => `/documents/${id}/assignments`,
    assignment: (id: string, assignmentId: string) => `/documents/${id}/assignments/${assignmentId}`,
  },
  payments: {
    tuitions: (query?: QueryInput) => query ? withQuery('/payments/tuitions', query) : '/payments/tuitions',
    tuition: (id: string) => `/payments/tuitions/${id}`,
    tuitionPayments: (id: string) => `/payments/tuitions/${id}/payments`,
    tuitionPayment: (tuitionId: string, paymentId: string) =>
      `/payments/tuitions/${tuitionId}/payments/${paymentId}`,
    remind: (id: string) => `/payments/tuitions/${id}/remind`,
  },
  users: {
    create: '/users',
    detail: (id: string) => `/users/${id}`,
    lock: (id: string) => `/users/${id}/lock`,
    unlock: (id: string) => `/users/${id}/unlock`,
    resetPassword: (id: string) => `/users/${id}/reset-password`,
    admin: '/users/admin',
    adminList: (query: QueryInput) => withQuery('/users/admin/all', query),
    adminDetail: (id: string) => `/users/admin/${id}`,
    meProfile: '/users/me/profile',
    meSessions: '/users/me/sessions',
    meSession: (id: string) => `/users/me/sessions/${id}`,
    changePassword: '/users/me/change-password',
    meAvatar: '/users/me/avatar',
    avatar: (id: string) => `/users/${id}/avatar`,
    meBranding: '/users/me/branding',
    meBrandLogo: '/users/me/brand-logo',
    brandLogo: (id: string) => `/users/${id}/brand-logo`,
  },
  settings: {
    public: '/settings',
    admin: '/settings/admin',
    favicon: '/settings/favicon',
    testEmail: '/settings/test-email',
  },
  health: {
    system: '/health/system',
    queue: '/health/queue',
  },
} as const;
