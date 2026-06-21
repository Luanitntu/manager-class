<script setup lang="ts">
import { useProfile, useProfileMutations } from '~/composables/useProfile';
import { useSnackbar } from '~/composables/useSnackbar';

const auth = useAuthStore();
const { data: profile, isLoading, error, refetch } = useProfile();
const { update } = useProfileMutations();
const { success: showSuccess, error: showError } = useSnackbar();

const form = reactive({
  fullName: '',
  phone: '',
});

watch(
  profile,
  (p) => {
    if (p) {
      form.fullName = p.fullName;
      form.phone = p.phone ?? '';
    }
  },
  { immediate: true },
);

async function save() {
  try {
    await update.mutateAsync({
      fullName: form.fullName,
      phone: form.phone || null,
    });
    showSuccess('Profile updated successfully.');
  } catch (e) {
    showError(extractApiError(e) ?? 'Could not save profile');
  }
}
</script>

<template>
  <div>
    <AppPageHeader
      title="Profile"
      subtitle="Manage your account details."
      icon="mdi-account-circle-outline"
    />

    <AppState
      v-if="isLoading"
      variant="loading"
      title="Loading profile"
      body="Retrieving your account details..."
    />

    <AppState
      v-else-if="error"
      variant="error"
      title="Could not load profile"
      body="Failed to fetch profile info. Please check your connection."
      action-label="Try again"
      @action="refetch()"
    />

    <v-card v-else class="pa-6 st-card-soft" max-width="520">
      <v-text-field :model-value="auth.user?.email" label="Email" disabled class="mb-2" />
      <v-text-field v-model="form.fullName" label="Full name" class="mb-2" />
      <v-text-field v-model="form.phone" label="Phone" class="mb-4" />
      
      <div class="mb-4">
        <v-chip size="small" variant="tonal" color="primary">
          Role: {{ auth.role }}
        </v-chip>
      </div>

      <div class="d-flex justify-end">
        <v-btn
          color="primary"
          :loading="update.isPending.value"
          :disabled="!form.fullName"
          @click="save"
        >
          Save
        </v-btn>
      </div>
    </v-card>
  </div>
</template>
