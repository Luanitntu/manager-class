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
  <v-card class="pa-8">
    <div class="text-center mb-6">
      <v-avatar color="primary" size="48" rounded="lg" class="mb-3">
        <v-icon color="white" size="28">mdi-lock-reset</v-icon>
      </v-avatar>
      <h1 class="text-h5 font-weight-bold">{{ t('auth.resetTitle') }}</h1>
    </div>

    <v-alert v-if="done" type="success" variant="tonal" class="mb-4" density="compact">
      {{ t('auth.resetDone') }}
    </v-alert>
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" density="compact">
      {{ error }}
    </v-alert>

    <v-form v-if="!done" @submit.prevent="onSubmit">
      <v-text-field
        v-model="password"
        v-bind="passwordAttrs"
        :label="t('auth.newPassword')"
        type="password"
        prepend-inner-icon="mdi-lock-outline"
        :error-messages="errors.password"
      />
      <v-btn type="submit" color="primary" block size="large" :loading="loading">
        {{ t('auth.updatePassword') }}
      </v-btn>
    </v-form>

    <div class="text-center mt-6 text-medium-emphasis">
      <NuxtLink to="/login" class="text-primary">{{ t('auth.backToSignIn') }}</NuxtLink>
    </div>
  </v-card>
</template>
