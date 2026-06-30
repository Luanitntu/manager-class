<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';

definePageMeta({ layout: 'auth' });

const route = useRoute();
const { resetPassword } = useAuth();
const { t } = useI18n();
const token = computed(() => (route.query.token as string) || '');

const loading = ref(false);
const done = ref(false);
const error = ref<string | null>(null);

const schema = computed(() =>
  toTypedSchema(z.object({ password: z.string().min(8, t('auth.validation.passwordMin')) })),
);
const { handleSubmit, defineField, errors } = useForm({ validationSchema: schema });
const [password, passwordAttrs] = defineField('password');

const onSubmit = handleSubmit(async (values) => {
  if (loading.value) return;
  error.value = null;
  if (!token.value) {
    error.value = t('errors.generic');
    return;
  }
  loading.value = true;
  try {
    await resetPassword(token.value, values.password);
    done.value = true;
  } catch (e: unknown) {
    error.value = extractApiError(e);
  } finally {
    loading.value = false;
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

    <div class="mb-6">
      <span class="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-[var(--st-radius)] bg-[var(--st-primary)] text-white">
        <AppIcon name="mdi-lock-reset" :size="28" />
      </span>
      <h1 class="text-2xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">{{ t('auth.resetTitle') }}</h1>
    </div>

    <UiAlert v-if="done" tone="success" class="mb-4">
      {{ t('auth.resetDone') }}
    </UiAlert>
    <UiAlert v-if="error" tone="error" class="mb-4">
      {{ error }}
    </UiAlert>

    <form v-if="!done" class="grid gap-4" @submit.prevent="onSubmit">
      <UiInput
        v-model="password"
        v-bind="passwordAttrs"
        :label="t('auth.newPassword')"
        type="password"
        autocomplete="new-password"
        :error="errors.password"
      >
        <template #leading>
          <AppIcon name="mdi-lock-outline" :size="20" class="text-slate-400" />
        </template>
      </UiInput>
      <UiButton type="submit" size="lg" class="w-full" :loading="loading" :disabled="loading">
        {{ t('auth.updatePassword') }}
      </UiButton>
    </form>

    <div class="mt-6 text-center text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
      <NuxtLink to="/login" class="font-semibold text-[var(--st-primary)] hover:text-[var(--st-primary-dark)]">{{ t('auth.backToSignIn') }}</NuxtLink>
    </div>
  </AuthShell>
</template>
