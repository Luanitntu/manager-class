<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';

definePageMeta({ layout: 'auth' });

const { login } = useAuth();
const { t } = useI18n();
const route = useRoute();
const error = ref<string | null>(null);
const loading = ref(false);

const schema = computed(() =>
  toTypedSchema(
    z.object({
      identifier: z.string().min(1, t('auth.validation.identifierRequired')),
      password: z.string().min(1, t('auth.validation.passwordRequired')),
    }),
  ),
);

const { handleSubmit, defineField, errors } = useForm({ validationSchema: schema });
const [identifier, identifierAttrs] = defineField('identifier');
const [password, passwordAttrs] = defineField('password');

const onSubmit = handleSubmit(async (values) => {
  error.value = null;
  loading.value = true;
  try {
    const res = await login(values.identifier, values.password);
    const home = res.user.role === 'SUPER_ADMIN' ? '/dashboard' : '/calendar';
    const redirect = (route.query.redirect as string) || home;
    await navigateTo(redirect);
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
        <v-icon color="white" size="28">mdi-school</v-icon>
      </v-avatar>
      <h1 class="text-h5 font-weight-bold">{{ t('auth.welcomeBack') }}</h1>
      <p class="text-medium-emphasis">{{ t('auth.signInSubtitle') }}</p>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" density="compact">
      {{ error }}
    </v-alert>

    <v-form @submit.prevent="onSubmit">
      <v-text-field
        v-model="identifier"
        v-bind="identifierAttrs"
        :label="t('auth.identifier')"
        prepend-inner-icon="mdi-account-outline"
        :error-messages="errors.identifier"
      />
      <v-text-field
        v-model="password"
        v-bind="passwordAttrs"
        :label="t('auth.password')"
        type="password"
        prepend-inner-icon="mdi-lock-outline"
        :error-messages="errors.password"
      />
      <div class="d-flex justify-end mb-2">
        <NuxtLink to="/forgot-password" class="text-primary text-caption">
          {{ t('auth.forgotPassword') }}
        </NuxtLink>
      </div>
      <v-btn type="submit" color="primary" block size="large" :loading="loading">
        {{ t('auth.signIn') }}
      </v-btn>
    </v-form>

    <div class="text-center mt-6 text-medium-emphasis">
      {{ t('auth.noAccount') }}
      <NuxtLink to="/register" class="text-primary">{{ t('auth.createOne') }}</NuxtLink>
    </div>
  </v-card>
</template>
