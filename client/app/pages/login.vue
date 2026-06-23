<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';

definePageMeta({ layout: false });

const { login } = useAuth();
const route = useRoute();
const error = ref<string | null>(null);
const loading = ref(false);

const schema = toTypedSchema(
  z.object({
    identifier: z.string().min(1, 'Email là bắt buộc'),
    password: z.string().min(1, 'Mật khẩu là bắt buộc'),
  }),
);

const { handleSubmit, defineField, errors } = useForm({ validationSchema: schema });
const [identifier, identifierAttrs] = defineField('identifier');
const [password, passwordAttrs] = defineField('password');

const socialButtons = [
  { name: 'Google', icon: 'google' },
  { name: 'GitHub', icon: 'github' },
];

const onSubmit = handleSubmit(async (values) => {
  error.value = null;
  loading.value = true;
  try {
    const res = await login(values.identifier, values.password);
    const home = res.user.role === 'SUPER_ADMIN' ? '/dashboard' : '/calendar';
    const redirect = (route.query.redirect as string) || home;
    await navigateTo(redirect);
  } catch (e: unknown) {
    error.value = extractApiError(e) ?? 'Đăng nhập không thành công';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <v-app>
    <main class="login-shell">
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

          <form class="login-form" @submit.prevent="onSubmit">
            <div v-if="error" class="login-error">
              {{ error }}
            </div>

            <div class="login-fields">
              <div class="login-field">
                <label for="login-identifier">
                  Email
                </label>
                <div class="login-input-wrap">
                  <div class="login-input-icon">
                    <v-icon icon="mdi-email-outline" size="18" />
                  </div>
                  <input
                    id="login-identifier"
                    v-model="identifier"
                    v-bind="identifierAttrs"
                    type="text"
                    inputmode="email"
                    autocomplete="username"
                    placeholder="nguyenvana@gmail.com"
                    :aria-invalid="!!errors.identifier"
                    aria-describedby="login-identifier-error"
                  >
                </div>
                <p v-if="errors.identifier" id="login-identifier-error" class="login-field-error">
                  {{ errors.identifier }}
                </p>
              </div>

              <div class="login-field">
                <label for="login-password">
                  Mật khẩu
                </label>
                <div class="login-input-wrap">
                  <div class="login-input-icon">
                    <v-icon icon="mdi-lock-outline" size="18" />
                  </div>
                  <input
                    id="login-password"
                    v-model="password"
                    v-bind="passwordAttrs"
                    type="password"
                    autocomplete="current-password"
                    placeholder="••••••••"
                    :aria-invalid="!!errors.password"
                    aria-describedby="login-password-error"
                  >
                </div>
                <p v-if="errors.password" id="login-password-error" class="login-field-error">
                  {{ errors.password }}
                </p>
              </div>
            </div>

            <div class="login-options">
              <label class="login-remember">
                <input
                  type="checkbox"
                >
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <NuxtLink
                to="/forgot-password"
                class="login-link"
              >
                Quên mật khẩu?
              </NuxtLink>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="login-submit"
            >
              <v-progress-circular v-if="loading" indeterminate size="18" width="2" color="white" />
              <template v-else>
                <span>Đăng nhập</span>
                <v-icon icon="mdi-arrow-right" size="18" />
              </template>
            </button>
          </form>

          <div class="login-divider">
            <span>Hoặc tiếp tục với</span>
          </div>

          <div class="login-social">
            <button
              v-for="button in socialButtons"
              :key="button.name"
              type="button"
              aria-disabled="true"
              title="Chưa hỗ trợ đăng nhập bằng mạng xã hội"
              class="login-social-button"
            >
              <svg
                v-if="button.icon === 'google'"
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
              <v-icon v-else icon="mdi-github" size="20" />
              <span>{{ button.name }}</span>
            </button>
          </div>

          <p class="login-register">
            Chưa có tài khoản?
            <NuxtLink to="/register">
              Đăng ký ngay
            </NuxtLink>
          </p>
        </div>
      </section>

      <section class="login-visual">
        <div class="login-visual-tint" />
        <div class="login-visual-gradient" />
        <img
          src="https://images.unsplash.com/photo-1741699428220-65f37f3fbbcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Không gian học tập hiện đại"
        >
        <div class="login-quote">
          <blockquote>
            "Từ ngày chuyển sang dùng ScheduleTeacher, tôi tiết kiệm được 40% thời gian quản lý lịch học. Giao diện thân thiện và trực quan!"
          </blockquote>
          <div class="login-person">
            <div class="login-avatar">
              M
            </div>
            <div>
              <div class="login-person-name">Cô Mai Nguyễn</div>
              <div class="login-person-role">Giáo viên IELTS</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </v-app>
</template>

<style scoped>
.login-shell {
  min-height: 100vh;
  display: flex;
  background: #fff;
  color: #0f172a;
  font-family: var(--st-font-family);
}

.login-shell :deep(.v-icon) {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  line-height: 1;
  vertical-align: middle;
}

.login-form-pane {
  position: relative;
  z-index: 1;
  width: 50%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 96px;
}

.login-brand {
  position: absolute;
  top: 32px;
  left: 40px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #0071f9;
  font-size: 20px;
  line-height: 1;
  font-weight: 800;
  text-decoration: none;
}

.login-brand-icon {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  border-radius: 10px;
  background: #0071f9;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 452px;
}

.login-heading {
  margin-bottom: 32px;
}

.login-heading h1 {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: 0;
}

.login-heading p {
  margin: 0;
  color: #64748b;
  font-size: 16px;
  line-height: 1.5;
}

.login-form {
  display: grid;
  gap: 24px;
}

.login-error {
  border: 1px solid #fecaca;
  border-radius: 12px;
  background: #fef2f2;
  color: #b91c1c;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
}

.login-fields {
  display: grid;
  gap: 20px;
}

.login-field label {
  display: block;
  margin-bottom: 6px;
  color: #334155;
  font-size: 14px;
  line-height: 1.4;
  font-weight: 700;
}

.login-input-wrap {
  position: relative;
}

.login-input-icon {
  position: absolute;
  inset-block: 0;
  left: 0;
  width: 44px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  pointer-events: none;
}

.login-input-wrap input {
  width: 100%;
  height: 52px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  color: #0f172a;
  padding: 0 16px 0 44px;
  font-size: 15px;
  line-height: 52px;
  outline: none;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.login-input-wrap input::placeholder {
  color: #94a3b8;
}

.login-input-wrap input:focus {
  border-color: #0071f9;
  box-shadow: 0 0 0 3px rgb(0 113 249 / 16%);
}

.login-field-error {
  margin: 6px 0 0;
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
}

.login-options {
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-size: 14px;
}

.login-remember {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-weight: 700;
  line-height: 1.25;
  cursor: pointer;
}

.login-remember input {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  accent-color: #0071f9;
  cursor: pointer;
}

.login-link,
.login-register a {
  display: inline-flex;
  align-items: center;
  color: #0071f9;
  font-weight: 800;
  line-height: 1.2;
  text-decoration: none;
}

.login-submit {
  width: 100%;
  height: 54px;
  border: 0;
  border-radius: 14px;
  background: #0071f9;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  line-height: 1;
  font-size: 16px;
  font-weight: 800;
  box-shadow: 0 10px 18px rgb(0 113 249 / 22%);
  cursor: pointer;
  transition: background 160ms ease, opacity 160ms ease;
}

.login-submit:hover {
  background: #0064df;
}

.login-submit:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.login-divider {
  position: relative;
  margin: 32px 0;
  display: flex;
  justify-content: center;
  color: #64748b;
  font-size: 14px;
  line-height: 1;
}

.login-divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e2e8f0;
}

.login-divider span {
  position: relative;
  z-index: 1;
  background: #fff;
  padding: 0 16px;
}

.login-social {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.login-social-button {
  height: 46px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  line-height: 1;
  font-size: 15px;
  font-weight: 700;
}

.login-social-icon {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  display: block;
}

.login-register {
  margin: 32px 0 0;
  color: #64748b;
  text-align: center;
  font-size: 14px;
}

.login-visual {
  position: relative;
  display: block;
  width: 50%;
  min-height: 100vh;
  overflow: hidden;
  background: #f1f5f9;
}

.login-visual img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-visual-tint {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: rgb(37 99 235 / 10%);
  mix-blend-mode: multiply;
}

.login-visual-gradient {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(to top, rgb(15 23 42 / 80%), rgb(15 23 42 / 20%), transparent);
}

.login-quote {
  position: absolute;
  z-index: 3;
  left: 48px;
  right: 48px;
  bottom: 48px;
  color: #fff;
}

.login-quote blockquote {
  margin: 0 0 24px;
  font-size: 26px;
  line-height: 1.45;
  font-weight: 700;
}

.login-person {
  display: flex;
  align-items: center;
  gap: 16px;
}

.login-avatar {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  border-radius: 999px;
  background: rgb(255 255 255 / 20%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  backdrop-filter: blur(8px);
}

.login-person-name {
  font-size: 18px;
  font-weight: 800;
}

.login-person-role {
  color: rgb(255 255 255 / 80%);
  font-size: 15px;
}

@media (max-width: 1023px) {
  .login-shell {
    display: block;
  }

  .login-form-pane {
    width: 100%;
    padding: 96px 32px 48px;
  }

  .login-brand {
    left: 32px;
  }

  .login-visual {
    display: none;
  }
}

@media (max-width: 520px) {
  .login-form-pane {
    padding-inline: 24px;
  }

  .login-card {
    max-width: none;
  }

  .login-options {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
