<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';

interface RegisterField {
  id: 'fullName' | 'email' | 'password';
  label: string;
  icon: string;
  type: 'text' | 'email' | 'password';
  autocomplete: string;
  placeholder: string;
  inputmode?: 'email';
}

const REGISTER_FIELDS: RegisterField[] = [
  {
    id: 'fullName',
    label: 'Họ và tên',
    icon: 'mdi-account-outline',
    type: 'text',
    autocomplete: 'name',
    placeholder: 'Nguyễn Văn A',
  },
  {
    id: 'email',
    label: 'Email',
    icon: 'mdi-email-outline',
    type: 'email',
    inputmode: 'email',
    autocomplete: 'email',
    placeholder: 'nguyenvana@gmail.com',
  },
  {
    id: 'password',
    label: 'Mật khẩu',
    icon: 'mdi-lock-outline',
    type: 'password',
    autocomplete: 'new-password',
    placeholder: 'Tối thiểu 8 ký tự',
  },
];

const { register } = useAuth();
const loading = ref(false);
const toast = useToast();

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

const fieldModels = { fullName, email, password };
const fieldAttrs = { fullName: fullNameAttrs, email: emailAttrs, password: passwordAttrs };

const onSubmit = handleSubmit(
  async (values) => {
    if (loading.value) return;
    loading.value = true;
    try {
      const res = await register(values);
      await navigateTo(roleHome(res.user.role));
    } catch (e: unknown) {
      toast.error(extractApiError(e) ?? 'Đăng ký không thành công', 'Đăng ký thất bại');
    } finally {
      loading.value = false;
    }
  },
  () => {
    toast.warning('Vui lòng kiểm tra đầy đủ thông tin đăng ký.', 'Thông tin chưa hợp lệ');
  },
);
</script>

<template>
  <section class="register-form-pane">
    <NuxtLink
      to="/"
      class="register-brand"
      aria-label="ScheduleTeacher"
    >
      <v-avatar class="register-brand__icon" color="primary" size="32" rounded="lg">
        <v-icon icon="mdi-calendar-check" size="20" color="white" />
      </v-avatar>
      <span>ScheduleTeacher</span>
    </NuxtLink>

    <v-sheet class="register-card" color="transparent">
      <div class="register-heading">
        <h1>Tạo tài khoản mới</h1>
        <p>Tham gia cùng hàng ngàn giáo viên khác ngay hôm nay.</p>
      </div>

      <v-form class="register-form" @submit.prevent="onSubmit">
        <div class="register-fields">
          <v-text-field
            v-for="field in REGISTER_FIELDS"
            :id="`register-${field.id}`"
            :key="field.id"
            v-model="fieldModels[field.id].value"
            v-bind="fieldAttrs[field.id].value"
            class="register-input"
            :type="field.type"
            :inputmode="field.inputmode"
            :autocomplete="field.autocomplete"
            :label="field.label"
            :prepend-inner-icon="field.icon"
            :placeholder="field.placeholder"
            :error-messages="errors[field.id] ? [errors[field.id]] : []"
            variant="outlined"
            density="comfortable"
            hide-spin-buttons
          />
        </div>

        <p class="register-terms">
          Bằng việc đăng ký, bạn đồng ý với
          <a href="#">Điều khoản dịch vụ</a>
          và
          <a href="#">Chính sách bảo mật</a>
          của chúng tôi.
        </p>

        <v-btn
          type="submit"
          class="register-submit"
          color="primary"
          variant="flat"
          block
          :loading="loading"
          :disabled="loading"
        >
          <span>Đăng ký miễn phí</span>
          <v-icon icon="mdi-arrow-right" size="18" />
        </v-btn>
      </v-form>

      <div class="register-divider">
        <v-divider />
        <span>Hoặc đăng ký qua</span>
      </div>

      <div class="register-social">
        <v-btn
          type="button"
          class="register-social-button"
          variant="outlined"
          block
          disabled
          title="Chưa hỗ trợ đăng ký bằng mạng xã hội"
        >
          <v-icon icon="mdi-google" size="20" />
          <span>Google</span>
        </v-btn>
        <v-btn
          type="button"
          class="register-social-button"
          variant="outlined"
          block
          disabled
          title="Chưa hỗ trợ đăng ký bằng mạng xã hội"
        >
          <v-icon icon="mdi-github" size="20" />
          <span>GitHub</span>
        </v-btn>
      </div>

      <p class="register-login">
        Đã có tài khoản?
        <NuxtLink to="/login">Đăng nhập</NuxtLink>
      </p>
    </v-sheet>
  </section>
</template>

<style scoped lang="scss" src="../../styles/register/form-pane.scss"></style>
