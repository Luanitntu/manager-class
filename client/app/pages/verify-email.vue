<script setup lang="ts">
definePageMeta({ layout: 'auth' });

const route = useRoute();
const { verifyEmail } = useAuth();
const { t } = useI18n();
const state = ref<'verifying' | 'ok' | 'error'>('verifying');
const error = ref<string | null>(null);

onMounted(async () => {
  const token = (route.query.token as string) || '';
  if (!token) {
    state.value = 'error';
    error.value = t('errors.generic');
    return;
  }
  try {
    await verifyEmail(token);
    state.value = 'ok';
  } catch (e: unknown) {
    state.value = 'error';
    error.value = extractApiError(e);
  }
});
</script>

<template>
  <AuthShell>
    <template #aside>
      <h2 class="mb-3 text-2xl font-semibold leading-[var(--st-leading-tight)]">Schedule Teacher</h2>
      <p class="max-w-md text-base font-normal leading-[var(--st-leading-copy)] text-white/90">
        Quản lý lớp học, lịch dạy và học phí — tất cả trong một nơi.
      </p>
    </template>

    <div class="text-center">
      <template v-if="state === 'verifying'">
        <span class="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[var(--st-radius)] bg-blue-50 text-[var(--st-primary)]">
          <UiSpinner size="md" />
        </span>
        <div class="text-base font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">{{ t('auth.verifying') }}</div>
      </template>

      <template v-else-if="state === 'ok'">
        <span class="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-[var(--st-radius)] bg-emerald-600 text-white">
          <AppIcon name="mdi-check" :size="28" />
        </span>
        <h1 class="mb-2 text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">{{ t('auth.verified') }}</h1>
        <UiButton to="/login" class="mt-2">
          {{ t('auth.continueSignIn') }}
        </UiButton>
      </template>

      <template v-else>
        <span class="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-[var(--st-radius)] bg-red-600 text-white">
          <AppIcon name="mdi-alert" :size="28" />
        </span>
        <h1 class="mb-2 text-xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">{{ t('auth.verifyFailed') }}</h1>
        <p class="mb-4 text-base font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">{{ error }}</p>
        <UiButton variant="ghost" to="/login">
          {{ t('auth.backToSignIn') }}
        </UiButton>
      </template>
    </div>
  </AuthShell>
</template>
