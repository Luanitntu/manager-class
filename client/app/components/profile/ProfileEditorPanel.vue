<script setup lang="ts">
const emit = defineEmits<{
  saved: [];
}>();

const auth = useAuthStore();
const avatar = useAvatar();
const { data: profile, isLoading: profileLoading } = useMyProfile();
const { updateProfile } = useProfileMutations();
const error = ref<string | null>(null);
const saved = ref(false);
const loading = ref(false);

const form = reactive({
  fullName: auth.user?.fullName ?? '',
  phone: '',
  timezone: auth.user?.timezone ?? detectBrowserTimezone(),
});

const timezones = (() => {
  try {
    const fn = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf;
    if (fn) return fn('timeZone');
  } catch {
    // keep fallback list
  }
  return ['UTC', 'Asia/Ho_Chi_Minh', 'Asia/Bangkok', 'Asia/Tokyo', 'Europe/London'];
})();

const roleLabel = computed(() => auth.role ?? 'USER');
const avatarSrc = computed(() => avatar(auth.user));

watch(profile, (value) => {
  if (!value) return;
  form.fullName = value.fullName;
  form.phone = value.phone ?? '';
  form.timezone = value.timezone ?? detectBrowserTimezone();
  if (auth.user) {
    auth.user.avatarKey = value.avatarKey ?? null;
  }
}, { immediate: true });

async function save() {
  if (loading.value) return;
  error.value = null;
  saved.value = false;
  loading.value = true;
  try {
    const nextProfile = await updateProfile.mutateAsync({
      fullName: form.fullName,
      phone: form.phone || undefined,
      timezone: form.timezone || undefined,
    });
    if (auth.user) {
      auth.user.fullName = nextProfile.fullName ?? form.fullName;
      auth.user.timezone = nextProfile.timezone ?? form.timezone;
      auth.user.avatarKey = nextProfile.avatarKey ?? null;
    }
    saved.value = true;
    emit('saved');
  } catch (e) {
    error.value = extractApiError(e) ?? 'Could not save profile';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div v-if="profileLoading" class="min-w-0">
    <AppSkeleton variant="form" :rows="4" />
  </div>

  <form v-else class="grid min-w-0 gap-5" @submit.prevent="save">
    <div class="flex min-w-0 items-start gap-3 rounded-[var(--st-radius)] border border-[var(--st-border)] bg-slate-50/70 p-4">
      <UiAvatar :src="avatarSrc" :name="form.fullName" :alt="form.fullName" size="lg" />
      <div class="min-w-0">
        <div class="flex min-w-0 flex-wrap items-center gap-2">
          <h2 class="truncate text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">
            {{ form.fullName || auth.user?.email || 'Profile' }}
          </h2>
          <UiBadge tone="primary">{{ roleLabel }}</UiBadge>
        </div>
        <p class="mt-1 break-words text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
          {{ auth.user?.email }}
        </p>
      </div>
    </div>

    <UiAlert v-if="error" tone="error">
      {{ error }}
    </UiAlert>
    <UiAlert v-if="saved" tone="success">
      Profile updated.
    </UiAlert>

    <div class="grid gap-4 sm:grid-cols-2">
      <UiInput :model-value="auth.user?.email" label="Email" disabled>
        <template #leading>
          <AppIcon name="mdi-email-outline" :size="18" class="text-[var(--st-muted)]" />
        </template>
      </UiInput>
      <UiInput v-model="form.fullName" label="Full name" autocomplete="name">
        <template #leading>
          <AppIcon name="mdi-account-outline" :size="18" class="text-[var(--st-muted)]" />
        </template>
      </UiInput>
      <UiInput v-model="form.phone" label="Phone" autocomplete="tel">
        <template #leading>
          <AppIcon name="mdi-phone-outline" :size="18" class="text-[var(--st-muted)]" />
        </template>
      </UiInput>
      <UiSelect v-model="form.timezone" :items="timezones" label="Timezone" />
    </div>

    <div class="flex min-w-0 flex-col gap-3 rounded-[var(--st-radius)] border border-[var(--st-border)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <p class="text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-text)]">
          Account status
        </p>
        <p class="mt-1 text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
          Role and email are managed by the workspace owner.
        </p>
      </div>
      <UiBadge tone="info">
        <AppIcon name="mdi-shield-account-outline" :size="14" />
        {{ roleLabel }}
      </UiBadge>
    </div>

    <div class="flex justify-end">
      <UiButton type="submit" :loading="loading" :disabled="loading || !form.fullName">
        Save profile
      </UiButton>
    </div>
  </form>
</template>
