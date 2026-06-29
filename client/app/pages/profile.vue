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
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Profile</h1>
    <p class="text-medium-emphasis mb-6">Manage your account details.</p>

    <AppSkeleton v-if="profileLoading" variant="form" :rows="4" style="max-width: 520px" />

    <v-card v-else class="pa-6" max-width="520">
      <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
        {{ error }}
      </v-alert>
      <v-alert v-if="saved" type="success" variant="tonal" density="compact" class="mb-4">
        Profile updated.
      </v-alert>

      <v-text-field :model-value="auth.user?.email" label="Email" disabled />
      <v-text-field v-model="form.fullName" label="Full name" />
      <v-text-field v-model="form.phone" label="Phone" />
      <v-autocomplete v-model="form.timezone" :items="timezones" label="Timezone" />
      <v-chip size="small" class="mb-4">{{ auth.role }}</v-chip>

      <div class="d-flex justify-end">
        <v-btn color="primary" :loading="loading" :disabled="loading" @click="save">Save</v-btn>
      </div>
    </v-card>
  </div>
</template>
