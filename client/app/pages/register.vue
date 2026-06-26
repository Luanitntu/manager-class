<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';

definePageMeta({ layout: false });

const { register } = useAuth();
const error = ref<string | null>(null);
const loading = ref(false);

const schema = toTypedSchema(
  z.object({
    fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
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
    error.value = extractApiError(e) ?? 'Đăng ký không thành công';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <v-app>
    <main class="register-shell">
      <section class="register-form-pane">
        <NuxtLink to="/" class="register-brand" aria-label="ScheduleTeacher">
          <span class="register-brand__icon">
            <v-icon icon="mdi-calendar-check" size="20" />
          </span>
          <span>ScheduleTeacher</span>
        </NuxtLink>

        <div class="register-card">
          <div class="register-heading">
            <h1>Tạo tài khoản mới</h1>
            <p>Tham gia cùng hàng ngàn giáo viên khác ngay hôm nay.</p>
          </div>

          <form class="register-form" @submit.prevent="onSubmit">
            <div v-if="error" class="register-error">
              {{ error }}
            </div>

            <div class="register-fields">
              <div class="register-field">
                <label for="register-full-name">Họ và tên</label>
                <div class="register-input-wrap">
                  <span class="register-input-icon">
                    <v-icon icon="mdi-account-outline" size="18" />
                  </span>
                  <input
                    id="register-full-name"
                    v-model="fullName"
                    v-bind="fullNameAttrs"
                    type="text"
                    autocomplete="name"
                    placeholder="Nguyễn Văn A"
                    :aria-invalid="!!errors.fullName"
                    aria-describedby="register-full-name-error"
                  >
                </div>
                <p v-if="errors.fullName" id="register-full-name-error" class="register-field-error">
                  {{ errors.fullName }}
                </p>
              </div>

              <div class="register-field">
                <label for="register-email">Email</label>
                <div class="register-input-wrap">
                  <span class="register-input-icon">
                    <v-icon icon="mdi-email-outline" size="18" />
                  </span>
                  <input
                    id="register-email"
                    v-model="email"
                    v-bind="emailAttrs"
                    type="email"
                    inputmode="email"
                    autocomplete="email"
                    placeholder="nguyenvana@gmail.com"
                    :aria-invalid="!!errors.email"
                    aria-describedby="register-email-error"
                  >
                </div>
                <p v-if="errors.email" id="register-email-error" class="register-field-error">
                  {{ errors.email }}
                </p>
              </div>

              <div class="register-field">
                <label for="register-password">Mật khẩu</label>
                <div class="register-input-wrap">
                  <span class="register-input-icon">
                    <v-icon icon="mdi-lock-outline" size="18" />
                  </span>
                  <input
                    id="register-password"
                    v-model="password"
                    v-bind="passwordAttrs"
                    type="password"
                    autocomplete="new-password"
                    placeholder="Tối thiểu 8 ký tự"
                    :aria-invalid="!!errors.password"
                    aria-describedby="register-password-error"
                  >
                </div>
                <p v-if="errors.password" id="register-password-error" class="register-field-error">
                  {{ errors.password }}
                </p>
              </div>
            </div>

            <p class="register-terms">
              Bằng việc đăng ký, bạn đồng ý với
              <a href="#">Điều khoản dịch vụ</a>
              và
              <a href="#">Chính sách bảo mật</a>
              của chúng tôi.
            </p>

            <button type="submit" class="register-submit" :disabled="loading">
              <v-progress-circular v-if="loading" indeterminate size="18" width="2" color="white" />
              <template v-else>
                <span>Đăng ký miễn phí</span>
                <v-icon icon="mdi-arrow-right" size="18" />
              </template>
            </button>
          </form>

          <div class="register-divider">
            <span>Hoặc đăng ký qua</span>
          </div>

          <div class="register-social">
            <button type="button" class="register-social-button" disabled aria-disabled="true">
              <svg class="register-social-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285f4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34a853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#fbbc05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#ea4335"
                />
              </svg>
              <span>Google</span>
            </button>
            <button type="button" class="register-social-button" disabled aria-disabled="true">
              <v-icon icon="mdi-github" size="20" />
              <span>GitHub</span>
            </button>
          </div>

          <p class="register-login">
            Đã có tài khoản?
            <NuxtLink to="/login">Đăng nhập</NuxtLink>
          </p>
        </div>
      </section>

      <section class="register-visual">
        <div class="register-visual__tint" />
        <div class="register-visual__gradient" />
        <img
          src="https://images.unsplash.com/photo-1509062522246-3755977927d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBjbGFzc3Jvb20lMjB0ZWFjaGVyJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzgyMTEwNTE1fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Register illustration"
        >
        <div class="register-story">
          <h2>Quản lý lớp học chuyên nghiệp</h2>
          <p>
            Nền tảng được thiết kế chuyên biệt để giúp bạn tối ưu hóa công tác quản lý,
            tập trung 100% vào chất lượng giảng dạy.
          </p>
          <div class="register-teachers">
            <div class="register-avatars">
              <span v-for="avatar in [11, 12, 13, 14]" :key="avatar">
                <img :src="`https://i.pravatar.cc/100?img=${avatar}`" alt="user">
              </span>
            </div>
            <div class="register-count">
              <strong>Hơn 5000+</strong>
              <span>giáo viên đang sử dụng</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </v-app>
</template>

<style scoped lang="scss">
$brand-blue: #2563eb;
$brand-blue-dark: #1d4ed8;
$slate-50: #f8fafc;
$slate-100: #f1f5f9;
$slate-200: #e2e8f0;
$slate-400: #94a3b8;
$slate-500: #64748b;
$slate-600: #475569;
$slate-700: #334155;
$slate-900: #0f172a;

@mixin center-flex {
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: row-reverse;
  background: #fff;
  color: $slate-900;
  font-family: var(--st-font-family);

  :deep(.v-icon) {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    line-height: 1;
    vertical-align: middle;
  }
}

.register-form-pane {
  position: relative;
  z-index: 10;
  width: 50%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 96px;
  background: #fff;
}

.register-brand {
  position: absolute;
  top: 32px;
  right: 48px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--st-primary);
  font-size: 20px;
  line-height: 1;
  font-weight: 800;
  text-decoration: none;

  &__icon {
    width: 32px;
    height: 32px;
    flex: 0 0 32px;
    border-radius: 8px;
    background: var(--st-primary);
    color: #fff;
    @include center-flex;
  }
}

.register-card {
  width: 100%;
  max-width: 448px;
  margin: 0 auto;
  display: grid;
  gap: 32px;
}

.register-heading {
  h1 {
    margin: 0 0 8px;
    color: $slate-900;
    font-size: 30px;
    line-height: 1.2;
    font-weight: 800;
    letter-spacing: 0;
  }

  p {
    margin: 0;
    color: $slate-600;
    font-size: 16px;
    line-height: 1.5;
  }
}

.register-form {
  display: grid;
  gap: 20px;
}

.register-fields {
  display: grid;
  gap: 16px;
}

.register-field {
  label {
    display: block;
    margin-bottom: 4px;
    color: $slate-700;
    font-size: 14px;
    font-weight: 600;
  }
}

.register-input-wrap {
  position: relative;
}

.register-input-icon {
  position: absolute;
  inset-block: 0;
  left: 0;
  width: 40px;
  height: 50px;
  color: $slate-400;
  pointer-events: none;
  @include center-flex;
}

.register-input-wrap input {
  width: 100%;
  min-height: 50px;
  border: 1px solid var(--st-border);
  border-radius: 8px;
  outline: 0;
  background: #fff;
  color: $slate-900;
  padding: 12px 16px 12px 40px;
  font-size: 16px;
  line-height: 1.4;
  transition: border-color 160ms ease, box-shadow 160ms ease;

  &::placeholder {
    color: $slate-400;
  }

  &:focus {
    border-color: var(--st-primary);
    box-shadow: var(--st-focus);
  }

  &[aria-invalid="true"] {
    border-color: #ef4444;
  }
}

.register-field-error {
  margin: 6px 0 0;
  color: #dc2626;
  font-size: 13px;
  font-weight: 700;
}

.register-error {
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fef2f2;
  color: #b91c1c;
  padding: 12px 14px;
  font-size: 14px;
  font-weight: 700;
}

.register-terms {
  margin: 0;
  color: $slate-500;
  font-size: 14px;
  line-height: 1.5;

  a {
    color: $brand-blue;
    font-weight: 700;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.register-submit {
  width: 100%;
  min-height: 52px;
  border: 0;
  border-radius: 8px;
  background: var(--st-primary);
  color: #fff;
  padding: 14px 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
  box-shadow: none;
  cursor: pointer;
  transition: background 160ms ease, transform 160ms ease;

  &:hover:not(:disabled) {
    background: $brand-blue-dark;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }
}

.register-divider {
  position: relative;
  text-align: center;

  &::before {
    content: "";
    position: absolute;
    inset: 50% 0 auto;
    border-top: 1px solid $slate-200;
  }

  span {
    position: relative;
    display: inline-block;
    background: #fff;
    color: $slate-500;
    padding: 0 16px;
    font-size: 14px;
  }
}

.register-social {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.register-social-button {
  min-height: 46px;
  border: 1px solid var(--st-border);
  border-radius: 8px;
  background: #fff;
  color: $slate-700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  font-size: 15px;
  font-weight: 600;
  line-height: 1;
  cursor: not-allowed;
  opacity: 0.58;
  transition: background 160ms ease, border-color 160ms ease;

  &:hover:not(:disabled) {
    border-color: var(--st-primary);
    background: var(--st-bg-soft);
  }
}

.register-social-icon {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  display: block;
}

.register-login {
  margin: 0;
  color: $slate-600;
  font-size: 14px;
  line-height: 1.35;
  text-align: center;

  a {
    display: inline-flex;
    align-items: center;
    color: $brand-blue;
    font-weight: 800;
    line-height: 1.2;
    text-decoration: none;

    &:hover {
      color: $brand-blue-dark;
    }
  }
}

.register-visual {
  position: relative;
  display: block;
  width: 50%;
  min-height: 100vh;
  overflow: hidden;
  background: $slate-100;

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__tint,
  &__gradient {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  &__tint {
    background: rgb(8 145 178 / 18%);
    mix-blend-mode: multiply;
  }

  &__gradient {
    background: linear-gradient(to top, rgb(22 78 99 / 82%), transparent 58%, transparent);
  }
}

.register-story {
  position: absolute;
  left: 48px;
  right: 48px;
  bottom: 48px;
  z-index: 2;
  color: #fff;

  h2 {
    max-width: 576px;
    margin: 0 0 16px;
    font-size: 40px;
    line-height: 1.16;
    font-weight: 800;
    letter-spacing: 0;
  }

  p {
    max-width: 512px;
    margin: 0;
    color: rgb(255 255 255 / 80%);
    font-size: 18px;
    line-height: 1.62;
  }
}

.register-teachers {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
}

.register-avatars {
  display: flex;

  span {
    width: 40px;
    height: 40px;
    flex: 0 0 40px;
    border: 2px solid #fff;
    border-radius: 999px;
    overflow: hidden;
    background: #cbd5e1;
    @include center-flex;

    + span {
      margin-left: -16px;
    }
  }

  img {
    position: static;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.register-count {
  display: flex;
  flex-direction: column;
  justify-content: center;

  strong {
    color: #fff;
    font-weight: 800;
    line-height: 1.2;
  }

  span {
    color: rgb(255 255 255 / 70%);
    font-size: 14px;
  }
}

@media (max-width: 1023px) {
  .register-shell {
    display: block;
  }

  .register-form-pane {
    width: 100%;
    padding: 96px 32px 48px;
  }

  .register-brand {
    right: 32px;
  }

  .register-visual {
    display: none;
  }
}

@media (max-width: 639px) {
  .register-form-pane {
    padding: 88px 24px 40px;
  }

  .register-brand {
    right: 24px;
  }

  .register-card {
    gap: 28px;
  }

  .register-heading h1 {
    font-size: 28px;
  }

  .register-social {
    grid-template-columns: 1fr;
  }
}
</style>
