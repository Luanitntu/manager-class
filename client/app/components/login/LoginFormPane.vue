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
  <section class="relative z-10 flex min-h-screen w-1/2 items-center justify-center overflow-y-auto px-10 py-24 max-lg:w-full max-lg:px-6 max-sm:px-5">
    <NuxtLink
      to="/"
      class="absolute left-10 top-8 inline-flex items-center gap-2 text-xl font-semibold leading-none text-[var(--st-primary)] max-lg:left-6 max-sm:left-5 max-sm:text-base"
      aria-label="ScheduleTeacher"
    >
      <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--st-radius)] bg-[var(--st-primary)] text-white">
        <AppIcon name="mdi-calendar-check" :size="20" />
      </span>
      <span>ScheduleTeacher</span>
    </NuxtLink>

    <div class="w-full max-w-[440px] max-sm:max-w-[360px]">
      <div class="mb-6">
        <h1 class="mb-2 text-2xl font-semibold leading-[var(--st-leading-tight)] text-slate-900">
          Đăng nhập
        </h1>
        <p class="text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
          Chào mừng trở lại! Vui lòng nhập thông tin của bạn.
        </p>
      </div>

      <form class="grid gap-4" @submit.prevent="onSubmit">
        <div class="grid gap-3">
          <UiInput
              id="login-identifier"
              v-model="identifier"
              v-bind="identifierAttrs"
              label="Email"
              type="text"
              inputmode="email"
              autocomplete="username"
              placeholder="nguyenvana@gmail.com"
              :error="errors.identifier"
            >
              <template #leading>
                <AppIcon name="mdi-email-outline" :size="20" class="text-slate-400" />
              </template>
          </UiInput>

          <UiInput
              id="login-password"
              v-model="password"
              v-bind="passwordAttrs"
              label="Mật khẩu"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              :error="errors.password"
            >
              <template #leading>
                <AppIcon name="mdi-lock-outline" :size="20" class="text-slate-400" />
              </template>
          </UiInput>
        </div>

        <div class="flex min-w-0 items-center justify-between gap-4 text-sm max-sm:flex-col max-sm:items-start">
          <UiCheckbox
            v-model="rememberMe"
            label="Ghi nhớ đăng nhập"
          />
          <NuxtLink
            to="/forgot-password"
            class="inline-flex shrink-0 items-center font-semibold leading-[var(--st-leading-copy)] text-[var(--st-primary)] hover:text-[var(--st-primary-dark)]"
          >
            Quên mật khẩu?
          </NuxtLink>
        </div>

        <UiButton
          type="submit"
          size="lg"
          class="w-full"
          :loading="loading"
          :disabled="loading"
          trailing-icon="mdi-arrow-right"
        >
          Đăng nhập
        </UiButton>
      </form>

      <div class="relative my-5 flex justify-center text-sm font-normal leading-none text-[var(--st-muted)] before:absolute before:inset-x-0 before:top-1/2 before:h-px before:bg-slate-200">
        <span class="relative bg-white px-4">Hoặc tiếp tục với</span>
      </div>

      <div class="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        <UiButton
          type="button"
          variant="secondary"
          class="h-[42px] !min-h-[42px] w-full items-center justify-center whitespace-nowrap text-sm"
          disabled
          title="Chưa hỗ trợ đăng nhập bằng mạng xã hội"
        >
          <template #leading>
            <svg
            class="h-5 w-5 shrink-0"
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
          </template>
          <span>Google</span>
        </UiButton>
        <UiButton
          type="button"
          variant="secondary"
          class="h-[42px] !min-h-[42px] w-full items-center justify-center whitespace-nowrap text-sm"
          disabled
          title="Chưa hỗ trợ đăng nhập bằng mạng xã hội"
        >
          <template #leading>
            <AppIcon name="mdi-github" :size="20" />
          </template>
          <span>GitHub</span>
        </UiButton>
      </div>

      <p class="mt-5 text-center text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
        Chưa có tài khoản?
        <NuxtLink to="/register" class="font-semibold text-[var(--st-primary)] hover:text-[var(--st-primary-dark)]">
          Đăng ký ngay
        </NuxtLink>
      </p>
    </div>
  </section>
</template>
