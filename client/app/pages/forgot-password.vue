<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';

definePageMeta({ layout: 'auth' });

const { forgotPassword } = useAuth();
const { t } = useI18n();
const loading = ref(false);
const sent = ref(false);
const error = ref<string | null>(null);

const schema = computed(() =>
  toTypedSchema(z.object({ email: z.string().email(t('auth.validation.emailInvalid')) })),
);
const { handleSubmit, defineField, errors } = useForm({ validationSchema: schema });
const [email, emailAttrs] = defineField('email');

const onSubmit = handleSubmit(async (values) => {
  if (loading.value) return;
  error.value = null;
  loading.value = true;
  try {
    await forgotPassword(values.email);
    sent.value = true;
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
      <h1 class="text-2xl font-semibold leading-[var(--st-leading-tight)] text-[var(--st-text)]">{{ t('auth.forgotTitle') }}</h1>
      <p class="mt-2 text-base font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">{{ t('auth.forgotSubtitle') }}</p>
    </div>

    <UiAlert v-if="sent" tone="success" class="mb-4">
      {{ t('auth.resetSent') }}
    </UiAlert>
    <UiAlert v-if="error" tone="error" class="mb-4">
      {{ error }}
    </UiAlert>

    <form v-if="!sent" class="grid gap-4" @submit.prevent="onSubmit">
      <UiInput
        v-model="email"
        v-bind="emailAttrs"
        :label="t('auth.email')"
        type="email"
        autocomplete="email"
        :error="errors.email"
      >
        <template #leading>
          <AppIcon name="mdi-email-outline" :size="20" class="text-slate-400" />
        </template>
      </UiInput>
      <UiButton type="submit" size="lg" class="w-full" :loading="loading" :disabled="loading">
        {{ t('auth.sendResetLink') }}
      </UiButton>
    </form>

    <div class="mt-6 text-center text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
      <NuxtLink to="/login" class="font-semibold text-[var(--st-primary)] hover:text-[var(--st-primary-dark)]">{{ t('auth.backToSignIn') }}</NuxtLink>
    </div>
  </AuthShell>
</template>
