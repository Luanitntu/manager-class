<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';

definePageMeta({ layout: 'auth' });

const { login } = useAuth();
const route = useRoute();
const error = ref<string | null>(null);
const loading = ref(false);

const schema = toTypedSchema(
  z.object({
    identifier: z.string().min(1, 'Email or username is required'),
    password: z.string().min(1, 'Password is required'),
  }),
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
    error.value = extractApiError(e) ?? 'Login failed';
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
      <h1 class="text-h5 font-weight-bold">Welcome back</h1>
      <p class="text-medium-emphasis">Sign in to Schedule Teacher</p>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" density="compact">
      {{ error }}
    </v-alert>

    <v-form @submit.prevent="onSubmit">
      <v-text-field
        v-model="identifier"
        v-bind="identifierAttrs"
        label="Email or username"
        prepend-inner-icon="mdi-account-outline"
        :error-messages="errors.identifier"
      />
      <v-text-field
        v-model="password"
        v-bind="passwordAttrs"
        label="Password"
        type="password"
        prepend-inner-icon="mdi-lock-outline"
        :error-messages="errors.password"
      />
      <div class="d-flex justify-end mb-2">
        <NuxtLink to="/forgot-password" class="text-primary text-caption">
          Forgot password?
        </NuxtLink>
      </div>
      <v-btn type="submit" color="primary" block size="large" :loading="loading">
        Sign in
      </v-btn>
    </v-form>

    <div class="text-center mt-6 text-medium-emphasis">
      No account?
      <NuxtLink to="/register" class="text-primary">Create one</NuxtLink>
    </div>
  </v-card>
</template>
