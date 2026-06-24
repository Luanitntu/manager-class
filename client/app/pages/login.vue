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
const rememberMe = ref(true);

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
    const res = await login(values.identifier, values.password, rememberMe.value);
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
  <AuthShell>
    <template #aside>
      <v-icon size="36" class="mb-4" style="opacity: 0.9">mdi-format-quote-open</v-icon>
      <p class="text-h6 font-weight-medium" style="line-height: 1.5">
        Từ ngày chuyển sang dùng Schedule Teacher, tôi tiết kiệm được 40% thời gian chấm bài
        và quản lý lịch học. Giao diện cực kỳ thân thiện và trực quan!
      </p>
      <div class="d-flex align-center ga-3 mt-4">
        <v-avatar color="rgba(255,255,255,0.2)" size="40"><span class="text-white">M</span></v-avatar>
        <div>
          <div class="font-weight-bold">Cô Mai Nguyễn</div>
          <div class="text-caption" style="opacity: 0.8">Giáo viên IELTS</div>
        </div>
      </div>
    </template>

    <h1 class="text-h4 font-weight-bold mb-1">{{ t('auth.signIn') }}</h1>
    <p class="text-medium-emphasis mb-6">{{ t('auth.welcomeBack') }}! {{ t('auth.signInSubtitle') }}</p>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" density="compact">
      {{ error }}
    </v-alert>

    <v-form @submit.prevent="onSubmit">
      <v-text-field
        v-model="identifier"
        v-bind="identifierAttrs"
        :label="t('auth.identifier')"
        prepend-inner-icon="mdi-email-outline"
        :error-messages="errors.identifier"
        variant="outlined"
      />
      <v-text-field
        v-model="password"
        v-bind="passwordAttrs"
        :label="t('auth.password')"
        type="password"
        prepend-inner-icon="mdi-lock-outline"
        :error-messages="errors.password"
        variant="outlined"
      />

      <div class="d-flex align-center justify-space-between mb-4">
        <v-checkbox
          v-model="rememberMe"
          :label="t('auth.rememberMe')"
          density="compact"
          hide-details
        />
        <NuxtLink to="/forgot-password" class="text-primary text-body-2 font-weight-medium text-decoration-none">
          {{ t('auth.forgotPassword') }}
        </NuxtLink>
      </div>

      <v-btn type="submit" color="primary" block size="large" :loading="loading" append-icon="mdi-arrow-right">
        {{ t('auth.signIn') }}
      </v-btn>
    </v-form>

    <div class="d-flex align-center ga-3 my-5 text-medium-emphasis text-caption">
      <v-divider /> {{ t('auth.orContinueWith') }} <v-divider />
    </div>

    <!-- OAuth: UI only; wiring comes later. -->
    <v-btn variant="outlined" block size="large" class="text-none" prepend-icon="mdi-google">
      Google
    </v-btn>

    <div class="text-center mt-6 text-medium-emphasis">
      {{ t('auth.noAccount') }}
      <NuxtLink to="/register" class="text-primary font-weight-medium text-decoration-none">
        {{ t('auth.createOne') }}
      </NuxtLink>
    </div>
  </AuthShell>
</template>
