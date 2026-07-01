<script setup lang="ts">
const auth = useAuthStore();
const { data: sessions, isLoading: sessionsLoading } = useActiveSessions();

const activeSessionsCount = computed(() => sessions.value?.length ?? 0);
const currentSession = computed(() => sessions.value?.find((session) => session.current));

function fmt(iso?: string | null) {
  return iso ? new Date(iso).toLocaleString() : '-';
}
</script>

<template>
  <UiPage class="space-y-6" padding="none" width="full">
    <UiPageHeader
      title="Profile"
      subtitle="A fallback account center. The primary edit flow is also available from the shell profile menu."
    />

    <section class="relative min-w-0 overflow-hidden rounded-[var(--st-radius)] bg-[var(--st-primary)] text-white">
      <div class="grid min-h-[210px] gap-6 px-6 py-6 md:grid-cols-[minmax(0,1fr)_280px] md:px-8 md:py-8">
        <div class="flex min-w-0 flex-col justify-center gap-4">
          <UiBadge class="border-white/30 bg-white/15 text-white" tone="neutral" size="sm">
            <AppIcon name="mdi-account-circle-outline" :size="14" />
            Account workspace
          </UiBadge>
          <div class="min-w-0 space-y-2">
            <h1 class="max-w-3xl break-words text-2xl font-semibold leading-[var(--st-leading-tight)]">
              {{ auth.user?.fullName ?? 'Profile' }}
            </h1>
            <p class="max-w-3xl break-words text-base font-normal leading-[var(--st-leading-copy)] text-white/90">
              {{ auth.user?.email }}
            </p>
          </div>
        </div>

        <div aria-hidden="true" class="hidden min-h-36 items-center justify-center md:flex">
          <div class="relative h-36 w-56">
            <div class="absolute left-2 top-4 h-28 w-40 rotate-[-5deg] rounded-[var(--st-radius)] border border-white/25 bg-white/15 shadow-lg backdrop-blur-sm" />
            <div class="absolute right-2 top-0 grid h-24 w-24 place-items-center rounded-full border border-white/30 bg-white/20 text-white shadow-lg">
              <AppIcon name="mdi-shield-account-outline" :size="42" />
            </div>
            <div class="absolute bottom-4 left-10 h-3 w-32 rotate-[-18deg] rounded-full bg-[var(--st-accent)]" />
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-3">
      <UiMetricCard label="Role" :value="auth.role ?? 'User'">
        <template #icon>
          <span class="grid h-11 w-11 place-items-center rounded-[var(--st-radius)] border border-blue-200 bg-blue-50 text-[var(--st-primary)]">
            <AppIcon name="mdi-shield-account-outline" :size="24" />
          </span>
        </template>
        <template #hint>
          Workspace permission
        </template>
      </UiMetricCard>
      <UiMetricCard label="Timezone" :value="auth.user?.timezone ?? detectBrowserTimezone()">
        <template #icon>
          <span class="grid h-11 w-11 place-items-center rounded-[var(--st-radius)] border border-emerald-200 bg-emerald-50 text-emerald-600">
            <AppIcon name="mdi-earth" :size="24" />
          </span>
        </template>
        <template #hint>
          Used for schedules
        </template>
      </UiMetricCard>
      <UiMetricCard label="Sessions" :value="sessionsLoading ? '...' : activeSessionsCount">
        <template #icon>
          <span class="grid h-11 w-11 place-items-center rounded-[var(--st-radius)] border border-orange-200 bg-orange-50 text-orange-600">
            <AppIcon name="mdi-laptop-account" :size="24" />
          </span>
        </template>
        <template #hint>
          Active sign-ins
        </template>
      </UiMetricCard>
    </section>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
      <section class="min-w-0 rounded-[var(--st-radius)] border border-[var(--st-border)] bg-white p-4 sm:p-6">
        <div class="mb-5 flex min-w-0 items-start gap-3">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--st-radius)] bg-[var(--st-bg-soft)] text-[var(--st-primary)]">
            <AppIcon name="mdi-account-edit-outline" :size="22" />
          </span>
          <div class="min-w-0">
            <h2 class="text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
              Profile details
            </h2>
            <p class="mt-1 text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
              Same save flow as the shell dialog, kept here for direct account access.
            </p>
          </div>
        </div>
        <ProfileEditorPanel />
      </section>

      <aside class="grid min-w-0 gap-6">
        <UiCard padding="md">
          <div class="mb-4 flex min-w-0 items-center gap-2">
            <AppIcon name="mdi-laptop-account" :size="20" class="shrink-0 text-[var(--st-primary)]" />
            <h2 class="min-w-0 truncate text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
              Current session
            </h2>
          </div>
          <div v-if="sessionsLoading" class="py-2">
            <AppSkeleton variant="list" :rows="2" />
          </div>
          <div v-else class="grid gap-3 text-sm leading-[var(--st-leading-copy)]">
            <div class="flex min-w-0 items-start gap-3">
              <span class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[var(--st-radius)] bg-[var(--st-bg-soft)] text-[var(--st-primary)]">
                <AppIcon name="mdi-map-marker-outline" :size="18" />
              </span>
              <div class="min-w-0">
                <p class="font-semibold text-[var(--st-text)]">IP address</p>
                <p class="break-words text-[var(--st-muted)]">{{ currentSession?.ipAddress ?? '-' }}</p>
              </div>
            </div>
            <div class="flex min-w-0 items-start gap-3">
              <span class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[var(--st-radius)] bg-[var(--st-bg-soft)] text-[var(--st-primary)]">
                <AppIcon name="mdi-calendar-clock-outline" :size="18" />
              </span>
              <div class="min-w-0">
                <p class="font-semibold text-[var(--st-text)]">Expires</p>
                <p class="break-words text-[var(--st-muted)]">{{ fmt(currentSession?.expiresAt) }}</p>
              </div>
            </div>
          </div>
        </UiCard>

        <UiCard padding="md">
          <div class="mb-4 flex min-w-0 items-center gap-2">
            <AppIcon name="mdi-information-outline" :size="20" class="shrink-0 text-orange-600" />
            <h2 class="min-w-0 truncate text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
              Account notes
            </h2>
          </div>
          <ul class="space-y-3">
            <li class="flex min-w-0 gap-3">
              <span class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[var(--st-radius)] bg-[var(--st-bg-soft)] text-[var(--st-primary)]">
                <AppIcon name="mdi-email-lock-outline" :size="18" />
              </span>
              <p class="min-w-0 text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
                Email and role are managed by account permissions.
              </p>
            </li>
            <li class="flex min-w-0 gap-3">
              <span class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[var(--st-radius)] bg-[var(--st-bg-soft)] text-[var(--st-primary)]">
                <AppIcon name="mdi-calendar-month-outline" :size="18" />
              </span>
              <p class="min-w-0 text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
                Timezone changes affect schedule and dashboard display.
              </p>
            </li>
          </ul>
        </UiCard>
      </aside>
    </div>
  </UiPage>
</template>
