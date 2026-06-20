<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';

definePageMeta({ layout: 'auth' });

const { register } = useAuth();
const error = ref<string | null>(null);
const loading = ref(false);

const schema = toTypedSchema(
  z.object({
    fullName: z.string().min(2, 'Enter your name'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'At least 8 characters'),
  }),
);

const { handleSubmit, defineField, errors } = useForm({ validationSchema: schema });
const [fullName, fullNameAttrs] = defineField('fullName');
const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');

const onSubmit = handleSubmit(async (values) => {
  error.value = null;
  loading.value = true;
  try {
    await register(values);
    await navigateTo('/calendar');
  } catch (e: unknown) {
    error.value = extractApiError(e) ?? 'Registration failed';
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
      <h1 class="text-h5 font-weight-bold">Create your account</h1>
      <p class="text-medium-emphasis">Start managing your classes</p>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" density="compact">
      {{ error }}
    </v-alert>

    <v-form @submit.prevent="onSubmit">
      <v-text-field
        v-model="fullName"
        v-bind="fullNameAttrs"
        label="Full name"
        prepend-inner-icon="mdi-account-outline"
        :error-messages="errors.fullName"
      />
      <v-text-field
        v-model="email"
        v-bind="emailAttrs"
        label="Email"
        type="email"
        prepend-inner-icon="mdi-email-outline"
        :error-messages="errors.email"
      />
      <v-text-field
        v-model="password"
        v-bind="passwordAttrs"
        label="Password"
        type="password"
        prepend-inner-icon="mdi-lock-outline"
        :error-messages="errors.password"
      />
      <v-btn type="submit" color="primary" block size="large" :loading="loading" class="mt-2">
        Create account
      </v-btn>
    </v-form>

    <div class="text-center mt-6 text-medium-emphasis">
      Already have an account?
      <NuxtLink to="/login" class="text-primary">Sign in</NuxtLink>
    </div>
  </v-card>
</template>
