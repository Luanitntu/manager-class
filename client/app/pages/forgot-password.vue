<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';

definePageMeta({ layout: 'auth' });

const { forgotPassword } = useAuth();
const loading = ref(false);
const sent = ref(false);
const error = ref<string | null>(null);

const schema = toTypedSchema(
  z.object({ email: z.string().email('Enter a valid email') }),
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
    error.value = extractApiError(e) ?? 'Something went wrong';
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
      <h1 class="text-h5 font-weight-bold">Forgot password</h1>
      <p class="text-medium-emphasis">We'll email you a reset link</p>
    </div>

    <v-alert v-if="sent" type="success" variant="tonal" class="mb-4" density="compact">
      If that email exists, a reset link has been sent. Check your inbox.
    </v-alert>
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" density="compact">
      {{ error }}
    </v-alert>

    <v-form v-if="!sent" @submit.prevent="onSubmit">
      <v-text-field
        v-model="email"
        v-bind="emailAttrs"
        label="Email"
        type="email"
        prepend-inner-icon="mdi-email-outline"
        :error-messages="errors.email"
      />
      <v-btn type="submit" color="primary" block size="large" :loading="loading">
        Send reset link
      </v-btn>
    </v-form>

    <div class="text-center mt-6 text-medium-emphasis">
      <NuxtLink to="/login" class="text-primary">Back to sign in</NuxtLink>
    </div>
  </v-card>
</template>
