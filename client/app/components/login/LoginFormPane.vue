<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';

const { login } = useAuth();
const route = useRoute();
const loading = ref(false);
const rememberMe = ref(true);
const toast = useToast();

const schema = toTypedSchema(
  z.object({
    identifier: z.string().min(1, 'Email là bắt buộc'),
    password: z.string().min(1, 'Mật khẩu là bắt buộc'),
  }),
);

const { handleSubmit, defineField, errors } = useForm({ validationSchema: schema });
const [identifier, identifierAttrs] = defineField('identifier');
const [password, passwordAttrs] = defineField('password');

const onSubmit = handleSubmit(
  async (values) => {
    if (loading.value) return;
    loading.value = true;
    try {
      const res = await login(values.identifier, values.password, rememberMe.value);
      const home = roleHome(res.user.role);
      const redirect = (route.query.redirect as string) || home;
      await navigateTo(redirect);
    } catch (e: unknown) {
      toast.error(
        extractApiError(e) ?? 'Đăng nhập không thành công',
        'Đăng nhập thất bại',
      );
    } finally {
      loading.value = false;
    }
  },
  () => {
    toast.warning('Vui lòng nhập đầy đủ email và mật khẩu.', 'Thông tin chưa hợp lệ');
  },
);
</script>

<template>
  <section class="login-form-pane">
    <NuxtLink
      to="/"
      class="login-brand"
      aria-label="ScheduleTeacher"
    >
      <span class="login-brand-icon">
        <v-icon icon="mdi-calendar-check" size="20" />
      </span>
      <span>ScheduleTeacher</span>
    </NuxtLink>

    <div class="login-card">
      <div class="login-heading">
        <h1>
          Đăng nhập
        </h1>
        <p>
          Chào mừng trở lại! Vui lòng nhập thông tin của bạn.
        </p>
      </div>

      <v-form class="login-form" @submit.prevent="onSubmit">
        <div class="login-fields">
          <div class="login-field">
            <label for="login-identifier">
              Email
            </label>
            <v-text-field
              id="login-identifier"
              v-model="identifier"
              v-bind="identifierAttrs"
              class="login-input"
              type="text"
              inputmode="email"
              autocomplete="username"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-email-outline"
              placeholder="nguyenvana@gmail.com"
              :error-messages="errors.identifier ? [errors.identifier] : []"
              hide-spin-buttons
            />
          </div>

          <div class="login-field">
            <label for="login-password">
              Mật khẩu
            </label>
            <v-text-field
              id="login-password"
              v-model="password"
              v-bind="passwordAttrs"
              class="login-input"
              type="password"
              autocomplete="current-password"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-outline"
              placeholder="••••••••"
              :error-messages="errors.password ? [errors.password] : []"
            />
          </div>
        </div>

        <div class="login-options">
          <v-checkbox
            v-model="rememberMe"
            class="login-remember"
            color="primary"
            density="compact"
            hide-details
            label="Ghi nhớ đăng nhập"
          />
          <NuxtLink
            to="/forgot-password"
            class="login-forgot-link"
          >
            Quên mật khẩu?
          </NuxtLink>
        </div>

        <v-btn
          type="submit"
          class="login-submit"
          color="primary"
          variant="flat"
          block
          :loading="loading"
          :disabled="loading"
        >
          <span>Đăng nhập</span>
          <v-icon icon="mdi-arrow-right" size="18" />
        </v-btn>
      </v-form>

      <div class="login-divider">
        <span>Hoặc tiếp tục với</span>
      </div>

      <div class="login-social">
        <v-btn
          type="button"
          class="login-social-button"
          variant="outlined"
          block
          disabled
          title="Chưa hỗ trợ đăng nhập bằng mạng xã hội"
        >
          <svg
            class="login-social-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Google</span>
        </v-btn>
        <v-btn
          type="button"
          class="login-social-button"
          variant="outlined"
          block
          disabled
          title="Chưa hỗ trợ đăng nhập bằng mạng xã hội"
        >
          <v-icon icon="mdi-github" size="20" />
          <span>GitHub</span>
        </v-btn>
      </div>

      <p class="login-register">
        Chưa có tài khoản?
        <NuxtLink to="/register">
          Đăng ký ngay
        </NuxtLink>
      </p>
    </div>
  </section>
</template>
