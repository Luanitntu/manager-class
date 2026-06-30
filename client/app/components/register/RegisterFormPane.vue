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
  <section class="relative z-10 flex min-h-screen w-1/2 flex-col items-center justify-center overflow-y-auto bg-white px-10 py-24 max-lg:w-full max-lg:px-6 max-sm:px-5">
    <NuxtLink
      to="/"
      class="absolute right-12 top-8 inline-flex items-center gap-2 text-xl font-semibold leading-none text-[var(--st-primary)] max-lg:left-6 max-lg:right-auto max-sm:left-5 max-sm:text-base"
      aria-label="ScheduleTeacher"
    >
      <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--st-radius)] bg-[var(--st-primary)] text-white">
        <AppIcon name="mdi-calendar-check" :size="20" />
      </span>
      <span>ScheduleTeacher</span>
    </NuxtLink>

    <div class="grid w-full max-w-[432px] gap-4 max-sm:max-w-[360px]">
      <div>
        <h1 class="mb-2 text-2xl font-semibold leading-[var(--st-leading-tight)] text-slate-900">Tạo tài khoản mới</h1>
        <p class="text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">Tham gia cùng hàng ngàn giáo viên khác ngay hôm nay.</p>
      </div>

      <form class="grid gap-3" @submit.prevent="onSubmit">
        <div class="grid gap-3">
          <UiInput
            v-for="field in REGISTER_FIELDS"
            :id="`register-${field.id}`"
            :key="field.id"
            v-model="fieldModels[field.id].value"
            v-bind="fieldAttrs[field.id].value"
            :type="field.type"
            :inputmode="field.inputmode"
            :autocomplete="field.autocomplete"
            :label="field.label"
            :placeholder="field.placeholder"
            :error="errors[field.id]"
          >
            <template #leading>
              <AppIcon :name="field.icon" :size="20" class="text-slate-400" />
            </template>
          </UiInput>
        </div>

        <p class="text-xs font-normal leading-[1.45] text-slate-500">
          Bằng việc đăng ký, bạn đồng ý với
          <a href="#" class="font-semibold text-[var(--st-primary)] hover:text-[var(--st-primary-dark)]">Điều khoản dịch vụ</a>
          và
          <a href="#" class="font-semibold text-[var(--st-primary)] hover:text-[var(--st-primary-dark)]">Chính sách bảo mật</a>
          của chúng tôi.
        </p>

        <UiButton
          type="submit"
          size="lg"
          class="w-full"
          :loading="loading"
          :disabled="loading"
          trailing-icon="mdi-arrow-right"
        >
          Đăng ký miễn phí
        </UiButton>
      </form>

      <div class="relative flex justify-center text-sm font-normal leading-none text-[var(--st-muted)] before:absolute before:inset-x-0 before:top-1/2 before:h-px before:bg-slate-200">
        <span class="relative bg-white px-4">Hoặc đăng ký qua</span>
      </div>

      <div class="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        <UiButton
          type="button"
          variant="secondary"
          class="w-full"
          disabled
          title="Chưa hỗ trợ đăng ký bằng mạng xã hội"
          leading-icon="mdi-google"
        >
          <span>Google</span>
        </UiButton>
        <UiButton
          type="button"
          variant="secondary"
          class="w-full"
          disabled
          title="Chưa hỗ trợ đăng ký bằng mạng xã hội"
          leading-icon="mdi-github"
        >
          <span>GitHub</span>
        </UiButton>
      </div>

      <p class="text-center text-sm font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
        Đã có tài khoản?
        <NuxtLink to="/login" class="font-semibold text-[var(--st-primary)] hover:text-[var(--st-primary-dark)]">Đăng nhập</NuxtLink>
      </p>
    </div>
  </section>
</template>
