<script setup lang="ts">
definePageMeta({ layout: 'auth' });

const route = useRoute();
const { verifyEmail } = useAuth();
const state = ref<'verifying' | 'ok' | 'error'>('verifying');
const error = ref<string | null>(null);

onMounted(async () => {
  const token = (route.query.token as string) || '';
  if (!token) {
    state.value = 'error';
    error.value = 'Missing verification token';
    return;
  }
  try {
    await verifyEmail(token);
    state.value = 'ok';
  } catch (e: unknown) {
    state.value = 'error';
    error.value = extractApiError(e) ?? 'Verification failed';
  }
});
</script>

<template>
  <v-card class="pa-8 text-center">
    <template v-if="state === 'verifying'">
      <v-progress-circular indeterminate color="primary" class="mb-4" />
      <div class="text-medium-emphasis">Verifying your email…</div>
    </template>

    <template v-else-if="state === 'ok'">
      <v-avatar color="success" size="48" rounded="lg" class="mb-3">
        <v-icon color="white" size="28">mdi-check</v-icon>
      </v-avatar>
      <h1 class="text-h6 font-weight-bold mb-2">Email verified</h1>
      <v-btn color="primary" to="/login">Continue to sign in</v-btn>
    </template>

    <template v-else>
      <v-avatar color="error" size="48" rounded="lg" class="mb-3">
        <v-icon color="white" size="28">mdi-alert</v-icon>
      </v-avatar>
      <h1 class="text-h6 font-weight-bold mb-2">Verification failed</h1>
      <p class="text-medium-emphasis mb-4">{{ error }}</p>
      <v-btn variant="text" to="/login">Back to sign in</v-btn>
    </template>
  </v-card>
</template>
