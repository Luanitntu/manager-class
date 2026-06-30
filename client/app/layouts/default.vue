<script setup lang="ts">
const { lgAndUp } = useViewport();
const drawer = ref(false);
const profileMenuOpen = ref(false);
const profileMenuRef = ref<HTMLElement | null>(null);
const auth = useAuthStore();
const { logout } = useAuth();
const { t } = useI18n();
const route = useRoute();
const config = useRuntimeConfig();
const { data: publicSettings } = usePublicSettings();
const isStudentShell = computed(() => auth.role === 'STUDENT');
const isDesktop = computed(() => lgAndUp.value);

const avatarSrc = computed(() => {
  if (auth.user?.avatarKey) return `${config.public.apiBase}/users/${auth.user.id}/avatar`;
  return auth.user?.avatarUrl ?? null;
});

const initials = computed(() => auth.user?.fullName?.trim()?.[0]?.toUpperCase() ?? 'U');

const announcement = computed(() =>
  publicSettings.value?.announcementActive && publicSettings.value?.announcement
    ? publicSettings.value.announcement
    : null,
);

watch(isDesktop, (desktop) => {
  drawer.value = desktop;
}, { immediate: true });

watch(() => route.fullPath, () => {
  profileMenuOpen.value = false;
  if (!isDesktop.value) drawer.value = false;
});

function closeOnOutsideClick(event: MouseEvent) {
  if (!profileMenuRef.value?.contains(event.target as Node)) {
    profileMenuOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', closeOnOutsideClick);
});

const NAV = {
  dashboard: { key: 'nav.dashboard', icon: 'mdi-view-dashboard-outline', to: '/dashboard' },
  calendar: { key: 'nav.calendar', icon: 'mdi-calendar-month-outline', to: '/calendar' },
  classes: { key: 'nav.classes', icon: 'mdi-book-open-page-variant-outline', to: '/classes' },
  students: { key: 'nav.students', icon: 'mdi-account-group-outline', to: '/students' },
  assistants: { key: 'nav.assistants', icon: 'mdi-account-tie-outline', to: '/assistants' },
  documents: { key: 'nav.documents', icon: 'mdi-file-document-outline', to: '/documents' },
  payments: { key: 'nav.payments', icon: 'mdi-credit-card-outline', to: '/payments' },
  reports: { key: 'nav.reports', icon: 'mdi-chart-bar', to: '/reports' },
  auditLogs: { key: 'nav.auditLogs', icon: 'mdi-history', to: '/audit-logs' },
  users: { key: 'nav.users', icon: 'mdi-account-group-outline', to: '/admin/users' },
  health: { key: 'nav.health', icon: 'mdi-heart-pulse', to: '/admin/health' },
  adminSettings: { key: 'nav.settings', icon: 'mdi-cog-outline', to: '/admin/settings' },
  studentClasses: { key: 'nav.classes', icon: 'mdi-book-open-variant-outline', to: '/student/classes' },
  studentDocuments: { key: 'nav.documents', icon: 'mdi-file-document-outline', to: '/student/documents' },
  assignments: { key: 'nav.assignments', icon: 'mdi-clipboard-text-outline', to: '/student/assignments' },
  grades: { key: 'nav.grades', icon: 'mdi-chart-line', to: '/student/grades' },
  tests: { key: 'nav.tests', icon: 'mdi-clipboard-check-outline', to: '/student/tests' },
} as const;

type NavItem = { key: string; icon: string; to: string; exact?: boolean };
type NavGroup = { title: string; items: NavItem[] };

const navGroups = computed<NavGroup[]>(() => {
  switch (auth.role) {
    case 'SUPER_ADMIN':
      return [
        { title: 'nav.sectionDaily', items: [NAV.dashboard] },
        { title: 'nav.sectionManage', items: [NAV.users, NAV.auditLogs, NAV.health] },
        { title: 'nav.sectionSystem', items: [NAV.adminSettings] },
      ];
    case 'ASSISTANT':
      return [
        { title: 'nav.sectionDaily', items: [NAV.dashboard, NAV.calendar] },
        { title: 'nav.sectionTeaching', items: [NAV.documents] },
      ];
    default:
      return [
        { title: 'nav.sectionDaily', items: [NAV.dashboard, NAV.calendar] },
        { title: 'nav.sectionTeaching', items: [NAV.classes, NAV.students, NAV.assistants, NAV.documents] },
        { title: 'nav.sectionManage', items: [NAV.payments, NAV.reports, NAV.auditLogs] },
      ];
  }
});

const studentNavItems = computed<NavItem[]>(() => [
  { ...NAV.dashboard, exact: true },
  { ...NAV.calendar, key: 'nav.studentCalendar' },
  NAV.studentClasses,
  NAV.studentDocuments,
  NAV.assignments,
  NAV.grades,
  NAV.tests,
]);

const bottomItem = computed(() =>
  auth.role === 'SUPER_ADMIN'
    ? { key: 'nav.profile', icon: 'mdi-account-circle-outline', to: '/profile' }
    : { key: 'nav.settings', icon: 'mdi-cog-outline', to: '/profile' },
);

const shellClasses = computed(() =>
  isStudentShell.value
    ? 'min-h-screen bg-slate-50 text-slate-950'
    : 'min-h-screen bg-[#f5f8fc] text-[#17233c]',
);

const drawerClasses = computed(() => [
  'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-white transition-transform duration-200 ease-out lg:translate-x-0',
  isStudentShell.value ? 'border-slate-200' : 'border-[#e6ebf2]',
  drawer.value ? 'translate-x-0' : '-translate-x-full',
]);

const topbarClasses = computed(() => [
  'fixed left-0 right-0 top-0 z-30 flex h-16 items-center border-b bg-white transition-[padding] duration-200 lg:pl-64',
  isStudentShell.value ? 'border-slate-200' : 'border-[#e6ebf2]',
]);

const mainClasses = computed(() => [
  'min-h-screen pt-16 transition-[padding] duration-200 lg:pl-64',
  isStudentShell.value ? 'bg-slate-50' : 'bg-[#f5f8fc]',
]);

function navLinkClass(item: NavItem, isActive: boolean, isExactActive: boolean) {
  const active = item.exact ? isExactActive : isActive;
  const base = 'relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-200';
  const studentActive = 'bg-blue-50 text-blue-700';
  const studentIdle = 'text-slate-600 hover:bg-slate-50 hover:text-blue-700';
  const teacherActive = 'bg-[var(--st-bg-soft)] text-[var(--st-primary)] before:absolute before:-left-3 before:top-1.5 before:h-8 before:w-1 before:rounded-r before:bg-[var(--st-primary)]';
  const teacherIdle = 'text-[#31425f] hover:bg-slate-50 hover:text-[var(--st-primary)]';

  return [
    base,
    isStudentShell.value
      ? (active ? studentActive : studentIdle)
      : (active ? teacherActive : teacherIdle),
  ];
}

function navIconClass(item: NavItem, isActive: boolean, isExactActive: boolean) {
  const active = item.exact ? isExactActive : isActive;
  if (isStudentShell.value) return active ? 'text-blue-700' : 'text-slate-500';
  return active ? 'text-[var(--st-primary)]' : 'text-[#8fa1bd]';
}

function closeDrawerOnMobile() {
  if (!isDesktop.value) drawer.value = false;
}

async function handleLogout() {
  profileMenuOpen.value = false;
  await logout();
}
</script>

<template>
  <div :class="shellClasses">
    <div
      v-if="drawer && !isDesktop"
      class="fixed inset-0 z-30 bg-slate-950/35 lg:hidden"
      aria-hidden="true"
      @click="drawer = false"
    />

    <aside :class="drawerClasses" :aria-hidden="!drawer && !isDesktop">
      <div class="flex h-16 shrink-0 items-center border-b px-6" :class="isStudentShell ? 'border-slate-200' : 'border-[#e6ebf2]'">
        <NuxtLink
          to="/dashboard"
          class="flex min-w-0 items-center gap-2 text-xl font-extrabold tracking-normal"
          :class="isStudentShell ? 'text-blue-600' : 'text-[var(--st-primary-dark)]'"
          @click="closeDrawerOnMobile"
        >
          <span
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
            :class="isStudentShell ? 'bg-blue-600' : 'bg-[var(--st-primary)]'"
          >
            <AppIcon :name="isStudentShell ? 'mdi-headphones' : 'mdi-calendar-month'" :size="isStudentShell ? 24 : 22" />
          </span>
          <span v-if="isStudentShell" class="truncate">
            Prep<span class="text-slate-950">Learn</span>
          </span>
          <span v-else class="truncate">Schedule Teacher</span>
        </NuxtLink>
      </div>

      <nav class="flex-1 overflow-y-auto px-3 py-5">
        <template v-if="isStudentShell">
          <div class="mb-2 px-3 text-xs font-extrabold uppercase tracking-wide text-slate-400">
            {{ t('nav.sectionStudySpace') }}
          </div>
          <div class="grid gap-1.5">
            <NuxtLink
              v-for="item in studentNavItems"
              :key="item.to"
              v-slot="{ href, navigate, isActive, isExactActive }"
              :to="item.to"
              custom
            >
              <a
                :href="href ?? item.to"
                :class="navLinkClass(item, isActive, isExactActive)"
                @click="(event) => { navigate(event); closeDrawerOnMobile(); }"
              >
                <AppIcon :name="item.icon" :size="20" :class="navIconClass(item, isActive, isExactActive)" />
                <span class="min-w-0 truncate">{{ t(item.key) }}</span>
              </a>
            </NuxtLink>
          </div>
        </template>

        <template v-else>
          <section v-for="group in navGroups" :key="group.title" class="mb-6 last:mb-0">
            <div class="mb-1.5 px-3 text-xs font-extrabold uppercase tracking-wide text-[#97a5ba]">
              {{ t(group.title) }}
            </div>
            <div class="grid gap-1">
              <NuxtLink
                v-for="item in group.items"
                :key="item.to"
                v-slot="{ href, navigate, isActive, isExactActive }"
                :to="item.to"
                custom
              >
                <a
                  :href="href ?? item.to"
                  :class="navLinkClass(item, isActive, isExactActive)"
                  @click="(event) => { navigate(event); closeDrawerOnMobile(); }"
                >
                  <AppIcon :name="item.icon" :size="20" :class="navIconClass(item, isActive, isExactActive)" />
                  <span class="min-w-0 truncate">{{ t(item.key) }}</span>
                </a>
              </NuxtLink>
            </div>
          </section>
        </template>
      </nav>

      <div v-if="isStudentShell" class="m-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <h4 class="mb-1.5 text-sm font-extrabold text-slate-950">{{ t('nav.helpTitle') }}</h4>
        <p class="mb-3 text-xs font-medium leading-relaxed text-slate-500">{{ t('nav.helpText') }}</p>
        <button
          type="button"
          class="h-8 w-full rounded-lg border border-slate-200 bg-white text-xs font-bold text-blue-600 shadow-sm transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {{ t('nav.helpAction') }}
        </button>
      </div>

      <div v-else class="border-t border-[#e6ebf2] p-3">
        <NuxtLink v-slot="{ href, navigate, isActive, isExactActive }" :to="bottomItem.to" custom>
          <a
            :href="href ?? bottomItem.to"
            :class="navLinkClass(bottomItem, isActive, isExactActive)"
            @click="(event) => { navigate(event); closeDrawerOnMobile(); }"
          >
            <AppIcon :name="bottomItem.icon" :size="20" :class="navIconClass(bottomItem, isActive, isExactActive)" />
            <span class="min-w-0 truncate">{{ t(bottomItem.key) }}</span>
          </a>
        </NuxtLink>
      </div>
    </aside>

    <header :class="topbarClasses">
      <button
        type="button"
        class="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 lg:hidden"
        :aria-label="drawer ? 'Close navigation' : 'Open navigation'"
        @click="drawer = !drawer"
      >
        <AppIcon :name="drawer ? 'mdi-close' : 'mdi-menu'" :size="24" />
      </button>

      <label
        :for="isStudentShell ? 'student-shell-search' : 'teacher-shell-search'"
        class="ml-2 hidden h-9 min-w-0 max-w-md flex-1 items-center gap-3 rounded-lg border bg-slate-50 px-3 text-slate-400 sm:flex lg:ml-6"
        :class="isStudentShell ? 'border-slate-200' : 'border-[#dce5f1]'"
      >
        <AppIcon name="mdi-magnify" :size="20" />
        <input
          :id="isStudentShell ? 'student-shell-search' : 'teacher-shell-search'"
          class="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
          :aria-label="t('common.search')"
          :placeholder="isStudentShell ? t('nav.studentSearch') : t('nav.teacherSearch')"
          type="search"
        >
      </label>

      <div class="ml-auto flex min-w-0 items-center gap-2 pr-2 sm:gap-3 sm:pr-4 lg:pr-6">
        <LanguageSwitcher />
        <button
          type="button"
          class="hidden h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-extrabold text-orange-600 sm:inline-flex"
          :class="isStudentShell ? 'border-orange-100 bg-orange-50' : 'border-orange-200 bg-orange-50'"
        >
          <AppIcon name="mdi-fire" :size="16" class="text-orange-500" />
          {{ t('nav.streakDays', { n: 14 }) }}
        </button>
        <button
          type="button"
          class="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
          aria-label="Notifications"
        >
          <AppIcon name="mdi-bell-outline" :size="22" />
          <span class="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
        </button>
        <NuxtLink
          v-if="!isStudentShell"
          to="/calendar"
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--st-primary)] text-white transition hover:bg-[var(--st-primary-dark)] focus:outline-none focus:ring-2 focus:ring-blue-200"
          :aria-label="t('nav.calendar')"
        >
          <AppIcon name="mdi-plus" :size="24" />
        </NuxtLink>
        <div class="hidden h-8 w-px bg-slate-200 sm:block" />

        <div ref="profileMenuRef" class="relative">
          <button
            type="button"
            class="flex min-w-0 items-center gap-2 rounded-lg p-1 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
            :aria-expanded="profileMenuOpen"
            aria-haspopup="menu"
            @click.stop="profileMenuOpen = !profileMenuOpen"
            @keydown.escape.stop="profileMenuOpen = false"
          >
            <span
              class="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border font-extrabold"
              :class="isStudentShell ? 'border-slate-200 bg-slate-100 text-blue-700' : 'border-transparent bg-[var(--st-bg-soft)] text-[var(--st-primary)]'"
            >
              <img
                v-if="avatarSrc"
                class="h-full w-full object-cover"
                :alt="auth.user?.fullName ?? 'User avatar'"
                :src="avatarSrc"
              >
              <span v-else>{{ initials }}</span>
            </span>
            <span class="hidden min-w-0 leading-tight md:grid">
              <strong class="max-w-24 truncate text-sm font-extrabold text-slate-900">
                {{ auth.user?.fullName ?? 'Guest' }}
              </strong>
              <small class="mt-0.5 text-xs font-bold text-slate-500">
                <template v-if="isStudentShell">{{ t('nav.roleStudent') }}</template>
                <template v-else>{{ auth.role === 'ASSISTANT' ? t('nav.roleAssistant') : t('nav.roleTeacher') }}</template>
              </small>
            </span>
          </button>

          <div
            v-if="profileMenuOpen"
            class="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
            role="menu"
            @keydown.escape.stop="profileMenuOpen = false"
          >
            <NuxtLink
              to="/profile"
              class="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
              role="menuitem"
              @click="profileMenuOpen = false"
            >
              <AppIcon name="mdi-account-outline" :size="18" class="text-slate-500" />
              {{ t('nav.profile') }}
            </NuxtLink>
            <NuxtLink
              v-if="isStudentShell"
              to="/profile"
              class="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
              role="menuitem"
              @click="profileMenuOpen = false"
            >
              <AppIcon name="mdi-cog-outline" :size="18" class="text-slate-500" />
              {{ t('nav.settings') }}
            </NuxtLink>
            <button
              type="button"
              class="flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
              role="menuitem"
              @click="handleLogout"
            >
              <AppIcon name="mdi-logout" :size="18" class="text-slate-500" />
              {{ t('nav.logout') }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <main :class="mainClasses">
      <div class="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div
          v-if="announcement"
          class="mb-6 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900"
          role="status"
        >
          <AppIcon name="mdi-bullhorn" :size="20" class="mt-0.5 shrink-0 text-blue-600" />
          <span class="min-w-0">{{ announcement }}</span>
        </div>
        <slot />
      </div>
    </main>
  </div>
</template>
