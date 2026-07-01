<script setup lang="ts">
const auth = useAuthStore();
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
    const fn = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] })
      .supportedValuesOf;
    if (fn) return fn('timeZone');
  } catch {
    // keep fallback
  }
  return ['UTC', 'Asia/Ho_Chi_Minh', 'Asia/Bangkok', 'Asia/Tokyo', 'Europe/London'];
})();

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
    await updateProfile.mutateAsync({
      fullName: form.fullName,
      phone: form.phone || undefined,
      timezone: form.timezone || undefined,
    });
    if (auth.user) {
      auth.user.fullName = form.fullName;
      auth.user.timezone = form.timezone;
    }
    saved.value = true;
  } catch (e) {
    error.value = extractApiError(e) ?? 'Could not save profile';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UiPage>
    <UiPageHeader
      title="Profile"
      subtitle="Manage your account details."
    />

    <div v-if="profileLoading" class="max-w-[520px]">
      <AppSkeleton variant="form" :rows="4" />
    </div>

    <UiCard v-else padding="lg" class="max-w-[520px]">
      <UiAlert v-if="error" tone="error" class="mb-4">
        {{ error }}
      </UiAlert>
      <UiAlert v-if="saved" tone="success" class="mb-4">
        Profile updated.
      </UiAlert>

      <div class="grid gap-4">
        <UiInput :model-value="auth.user?.email" label="Email" disabled />
        <UiInput v-model="form.fullName" label="Full name" autocomplete="name" />
        <UiInput v-model="form.phone" label="Phone" autocomplete="tel" />
        <UiSelect v-model="form.timezone" :items="timezones" label="Timezone" />
        <div class="flex min-w-0 flex-wrap items-center gap-2">
          <span class="text-sm font-semibold leading-[var(--st-leading-copy)] text-[var(--st-text)]">Role</span>
          <UiBadge tone="primary">{{ auth.role }}</UiBadge>
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <UiButton :loading="loading" :disabled="loading" @click="save">
          Save profile
        </UiButton>
      </div>
    </UiCard>
  </UiPage>
</template>
