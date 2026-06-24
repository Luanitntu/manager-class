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
      <h2 class="text-h4 font-weight-bold mb-3">Schedule Teacher</h2>
      <p class="text-body-1" style="opacity: 0.9; max-width: 460px">
        Quản lý lớp học, lịch dạy và học phí — tất cả trong một nơi.
      </p>
    </template>

    <div class="mb-6">
      <v-avatar color="primary" size="48" rounded="lg" class="mb-3">
        <v-icon color="white" size="28">mdi-lock-reset</v-icon>
      </v-avatar>
      <h1 class="text-h5 font-weight-bold">{{ t('auth.forgotTitle') }}</h1>
      <p class="text-medium-emphasis">{{ t('auth.forgotSubtitle') }}</p>
    </div>

    <v-alert v-if="sent" type="success" variant="tonal" class="mb-4" density="compact">
      {{ t('auth.resetSent') }}
    </v-alert>
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" density="compact">
      {{ error }}
    </v-alert>

    <v-form v-if="!sent" @submit.prevent="onSubmit">
      <v-text-field
        v-model="email"
        v-bind="emailAttrs"
        :label="t('auth.email')"
        type="email"
        prepend-inner-icon="mdi-email-outline"
        :error-messages="errors.email"
      />
      <v-btn type="submit" color="primary" block size="large" :loading="loading">
        {{ t('auth.sendResetLink') }}
      </v-btn>
    </v-form>

    <div class="text-center mt-6 text-medium-emphasis">
      <NuxtLink to="/login" class="text-primary text-decoration-none">{{ t('auth.backToSignIn') }}</NuxtLink>
    </div>
  </AuthShell>
</template>
