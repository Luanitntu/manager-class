<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';

definePageMeta({ layout: 'auth' });

const { register } = useAuth();
const { t } = useI18n();
const error = ref<string | null>(null);
const loading = ref(false);

const schema = computed(() =>
  toTypedSchema(
    z.object({
      fullName: z.string().min(2, t('auth.validation.nameRequired')),
      email: z.string().email(t('auth.validation.emailInvalid')),
      password: z.string().min(8, t('auth.validation.passwordMin')),
    }),
  ),
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
    error.value = extractApiError(e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <AuthShell>
    <template #aside>
      <h2 class="text-h4 font-weight-bold mb-3">Quản lý lớp học chuyên nghiệp</h2>
      <p class="text-body-1" style="opacity: 0.9; max-width: 460px">
        Nền tảng được thiết kế chuyên biệt để giúp bạn tối ưu hoá công tác quản lý,
        tập trung 100% vào chất lượng giảng dạy.
      </p>
      <div class="d-flex align-center ga-3 mt-6">
        <div class="d-flex">
          <v-avatar v-for="n in 3" :key="n" color="rgba(255,255,255,0.25)" size="34" class="st-stack">
            <v-icon size="18" color="white">mdi-account</v-icon>
          </v-avatar>
        </div>
        <div>
          <div class="font-weight-bold">Hơn 5000+</div>
          <div class="text-caption" style="opacity: 0.8">giáo viên đang sử dụng</div>
        </div>
      </div>
    </template>

    <h1 class="text-h4 font-weight-bold mb-1">{{ t('auth.createAccount') }}</h1>
    <p class="text-medium-emphasis mb-6">{{ t('auth.joinThousands') }}</p>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" density="compact">
      {{ error }}
    </v-alert>

    <v-form @submit.prevent="onSubmit">
      <v-text-field
        v-model="fullName"
        v-bind="fullNameAttrs"
        :label="t('auth.fullName')"
        prepend-inner-icon="mdi-account-outline"
        :error-messages="errors.fullName"
        variant="outlined"
      />
      <v-text-field
        v-model="email"
        v-bind="emailAttrs"
        :label="t('auth.email')"
        type="email"
        prepend-inner-icon="mdi-email-outline"
        :error-messages="errors.email"
        variant="outlined"
      />
      <v-text-field
        v-model="password"
        v-bind="passwordAttrs"
        :label="t('auth.password')"
        type="password"
        prepend-inner-icon="mdi-lock-outline"
        :error-messages="errors.password"
        :placeholder="t('auth.validation.passwordMin')"
        variant="outlined"
      />

      <p class="text-caption text-medium-emphasis mb-4">
        Bằng việc đăng ký, bạn đồng ý với
        <a href="#" class="text-primary text-decoration-none">Điều khoản dịch vụ</a> và
        <a href="#" class="text-primary text-decoration-none">Chính sách bảo mật</a> của chúng tôi.
      </p>

      <v-btn type="submit" color="primary" block size="large" :loading="loading" append-icon="mdi-arrow-right">
        {{ t('auth.signUpFree') }}
      </v-btn>
    </v-form>

    <div class="d-flex align-center ga-3 my-5 text-medium-emphasis text-caption">
      <v-divider /> {{ t('auth.orSignUpWith') }} <v-divider />
    </div>

    <!-- OAuth: UI only; wiring comes later. -->
    <v-btn variant="outlined" block size="large" class="text-none" prepend-icon="mdi-google">
      Google
    </v-btn>

    <div class="text-center mt-6 text-medium-emphasis">
      {{ t('auth.haveAccount') }}
      <NuxtLink to="/login" class="text-primary font-weight-medium text-decoration-none">
        {{ t('auth.signIn') }}
      </NuxtLink>
    </div>
  </AuthShell>
</template>

<style scoped>
.st-stack {
  border: 2px solid rgba(255, 255, 255, 0.6);
  margin-left: -10px;
}
.st-stack:first-child {
  margin-left: 0;
}
</style>
