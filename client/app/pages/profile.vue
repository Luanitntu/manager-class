<script setup lang="ts">
const auth = useAuthStore();
const { request } = useApi();
const error = ref<string | null>(null);
const saved = ref(false);
const loading = ref(false);
const profileLoading = ref(true);

const form = reactive({
  fullName: auth.user?.fullName ?? '',
  phone: '',
});

onMounted(async () => {
  try {
    const profile = await request<{ fullName: string; phone?: string | null }>(
      '/users/me/profile',
    );
    form.fullName = profile.fullName;
    form.phone = profile.phone ?? '';
  } catch {
    // keep store defaults
  } finally {
    profileLoading.value = false;
  }
});

async function save() {
  if (loading.value) return;
  error.value = null;
  saved.value = false;
  loading.value = true;
  try {
    await request('/users/me/profile', {
      method: 'PATCH',
      body: { fullName: form.fullName, phone: form.phone || undefined },
    });
    if (auth.user) auth.user.fullName = form.fullName;
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
      <v-chip size="small" class="mb-4">{{ auth.role }}</v-chip>

      <div class="d-flex justify-end">
        <v-btn color="primary" :loading="loading" :disabled="loading" @click="save">Save</v-btn>
      </div>
    </v-card>
  </div>
</template>
