<script setup lang="ts">
definePageMeta({ layout: false });

const stats = [
  { value: '1,200+', label: 'Giáo viên sử dụng' },
  { value: '80k+', label: 'Học viên được quản lý' },
  { value: '35%', label: 'Giảm thời gian vận hành' },
  { value: '99%', label: 'Dữ liệu đúng lớp' },
];

const features = [
  ['mdi-calendar-clock', 'Lịch dạy calendar-first', 'Xếp lịch, theo dõi buổi học, điểm danh và tránh trùng lịch trong cùng một màn hình quen thuộc.'],
  ['mdi-account-school-outline', 'Quản lý học viên tập trung', 'Hồ sơ, lớp đang học, lịch sử học tập, nhận xét và trạng thái học phí luôn nằm đúng ngữ cảnh.'],
  ['mdi-file-document-multiple-outline', 'Tài liệu và bài tập rõ ràng', 'Giáo viên chia sẻ tài liệu theo lớp; học viên xem đúng tài nguyên được giao.'],
  ['mdi-cash-check', 'Theo dõi học phí', 'Nắm nhanh khoản đã thu, còn thiếu, quá hạn và lịch sử thanh toán theo từng học viên.'],
  ['mdi-chart-box-outline', 'Báo cáo dễ đọc', 'Tổng hợp tiến độ lớp, điểm số, nhận xét và dữ liệu vận hành thành các bảng biểu gọn gàng.'],
  ['mdi-shield-check-outline', 'Dữ liệu tách biệt theo giáo viên', 'Thiết kế multi-tenant giúp dữ liệu lớp học được phân tách theo teacher/tenant rõ ràng.'],
];

const checklist = [
  'Hiển thị lịch theo ngày, tuần, tháng cho giáo viên.',
  'Điểm danh và ghi chú buổi học nhanh trên desktop hoặc mobile.',
  'Theo dõi học viên, tài liệu, học phí, báo cáo từ một luồng làm việc.',
  'Cổng học viên riêng để xem lịch, tài liệu, điểm số và thanh toán.',
];

const heroDelay = ['[animation-delay:0ms]', '[animation-delay:90ms]', '[animation-delay:170ms]', '[animation-delay:250ms]', '[animation-delay:330ms]'];
</script>

<template>
  <main class="min-h-screen bg-white font-sans text-slate-900 [--brand-blue:#0071F9] [--brand-orange:#FF6B00] motion-reduce:[&_*,&_*::before,&_*::after]:!animate-none motion-reduce:[&_*,&_*::before,&_*::after]:!transition-none">
    <div class="animate-slide-down bg-[var(--brand-blue)] px-4 py-2 text-xs text-white sm:px-6 lg:px-8">
      <div class="mx-auto flex min-h-5 w-[min(1180px,calc(100%-32px))] flex-col items-center justify-between gap-2 sm:flex-row">
        <div class="flex items-center gap-6">
          <span class="flex items-center gap-1.5"><v-icon icon="mdi-phone-outline" size="14" /> Hotline: 0909 123 456</span>
          <span class="hidden items-center gap-1.5 sm:flex"><v-icon icon="mdi-email-outline" size="14" /> Email: hello@scheduleteacher.vn</span>
        </div>
        <span class="hidden font-semibold opacity-90 md:block">Phần mềm quản lý lớp học dành cho giáo viên ngoại ngữ</span>
      </div>
    </div>

    <header class="sticky top-0 z-20 animate-slide-down border-b border-slate-200 bg-white/95 shadow-[0_8px_20px_rgba(15,23,42,0.04)] backdrop-blur [animation-delay:80ms]">
      <div class="mx-auto flex min-h-20 w-[min(1180px,calc(100%-32px))] flex-wrap items-center justify-center gap-4 py-3 md:justify-between md:py-0">
        <NuxtLink to="/" class="group inline-flex items-center gap-2.5 text-xl font-black tracking-normal text-[var(--brand-blue)] no-underline transition hover:-translate-y-px md:text-2xl" aria-label="Schedule Teacher">
          <span class="inline-flex size-10 items-center justify-center rounded-xl bg-[var(--brand-blue)] text-white shadow-[0_12px_24px_rgba(0,113,249,0.24)] transition group-hover:rotate-[-4deg] group-hover:scale-105 group-hover:shadow-[0_16px_30px_rgba(0,113,249,0.32)]"><v-icon icon="mdi-calendar-check" size="24" /></span>
          <span>Schedule<span class="text-slate-900">Teacher</span></span>
        </NuxtLink>

        <nav class="hidden gap-7 text-sm font-extrabold text-slate-700 lg:flex" aria-label="Landing navigation">
          <a href="#features" class="relative no-underline transition after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-[var(--brand-blue)] after:transition hover:text-[var(--brand-blue)] hover:after:scale-x-100">Tính năng</a>
          <a href="#workflow" class="relative no-underline transition after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-[var(--brand-blue)] after:transition hover:text-[var(--brand-blue)] hover:after:scale-x-100">Quy trình</a>
          <a href="#student" class="relative no-underline transition after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-[var(--brand-blue)] after:transition hover:text-[var(--brand-blue)] hover:after:scale-x-100">Học viên</a>
          <a href="#contact" class="relative no-underline transition after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-[var(--brand-blue)] after:transition hover:text-[var(--brand-blue)] hover:after:scale-x-100">Liên hệ</a>
        </nav>

        <div class="flex items-center gap-2.5">
          <NuxtLink to="/login" class="hidden min-h-11 items-center justify-center rounded-xl px-5 font-black leading-none text-[var(--brand-blue)] no-underline transition hover:-translate-y-0.5 hover:bg-blue-50 sm:inline-flex">Đăng nhập</NuxtLink>
          <NuxtLink to="/register" class="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--brand-orange)] px-6 font-black leading-none text-white no-underline shadow-[0_14px_28px_rgba(255,107,0,0.24)] transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-[0_18px_34px_rgba(255,107,0,0.34)]">Dùng thử miễn phí</NuxtLink>
        </div>
      </div>
    </header>

    <section class="relative overflow-hidden bg-[linear-gradient(90deg,rgba(248,250,252,.98)_0%,rgba(248,250,252,.94)_42%,rgba(248,250,252,.72)_100%),url('https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1800&q=82')] bg-cover bg-center py-16 after:absolute after:inset-x-0 after:bottom-0 after:h-36 after:bg-gradient-to-b after:from-transparent after:to-slate-50 lg:py-24">
      <div class="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,113,249,.06)_25%,transparent_25%,transparent_50%,rgba(0,113,249,.06)_50%,rgba(0,113,249,.06)_75%,transparent_75%,transparent)] bg-[length:24px_24px] opacity-40" />
      <div class="relative z-10 mx-auto grid w-[min(1180px,calc(100%-32px))] items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(420px,.9fr)]">
        <div class="grid justify-items-center gap-6 text-center lg:justify-items-start lg:text-left">
          <div :class="['inline-flex w-fit animate-fade-lift items-center gap-2.5 rounded-full border border-orange-200 bg-orange-100 px-4 py-2 text-sm font-black text-[var(--brand-orange)]', heroDelay[0]]">
            <span class="size-2.5 animate-soft-pulse rounded-full bg-[var(--brand-orange)]" />
            Giải pháp tối ưu cho giáo viên và lớp học nhỏ
          </div>
          <h1 :class="['max-w-3xl animate-fade-lift text-[clamp(42px,6vw,72px)] font-black leading-[1.12] tracking-normal text-slate-900', heroDelay[1]]">
            Phần mềm quản lý
            <span class="block text-[var(--brand-blue)]">lớp học & học viên</span>
            toàn diện
          </h1>
          <p :class="['max-w-2xl animate-fade-lift text-lg leading-8 text-slate-600', heroDelay[2]]">
            Schedule Teacher giúp giáo viên xếp lịch, điểm danh, quản lý học viên, tài liệu, học phí và báo cáo trên một nền tảng sạch, nhanh, dễ dùng.
          </p>
          <div :class="['flex w-full animate-fade-lift flex-col items-center gap-4 sm:w-auto sm:flex-row', heroDelay[3]]">
            <NuxtLink to="/register" class="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-blue)] px-8 text-lg font-black leading-none text-white no-underline shadow-[0_18px_34px_rgba(0,113,249,0.22)] transition hover:-translate-y-1 hover:bg-blue-700 hover:shadow-[0_22px_44px_rgba(0,113,249,0.32)] sm:w-auto">
              <span>Đăng ký dùng thử</span>
              <v-icon icon="mdi-arrow-right" />
            </NuxtLink>
            <a href="#workflow" class="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-8 text-lg font-black leading-none text-slate-700 no-underline transition hover:-translate-y-1 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)] sm:w-auto">
              <v-icon icon="mdi-play-circle-outline" class="text-[var(--brand-orange)]" />
              <span>Xem cách hoạt động</span>
            </a>
          </div>
          <div :class="['flex animate-fade-lift flex-wrap items-center justify-center gap-4 text-sm font-bold text-slate-500 lg:justify-start', heroDelay[4]]">
            <span class="flex items-center gap-1.5"><v-icon icon="mdi-check-circle" class="text-green-500" /> Miễn phí 14 ngày</span>
            <span class="flex items-center gap-1.5"><v-icon icon="mdi-check-circle" class="text-green-500" /> Không cần thẻ thanh toán</span>
          </div>
        </div>

        <div class="relative min-h-[480px] animate-fade-lift [animation-delay:180ms] max-sm:min-h-0" aria-label="Schedule Teacher product preview">
          <div class="absolute inset-[40px_-20px_-10px_40px] animate-glow-drift rounded-full bg-gradient-to-br from-blue-500/25 to-orange-500/20 blur-3xl" />
          <div class="relative animate-float-preview overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_30px_70px_rgba(15,23,42,0.18)] transition duration-500 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-[0_38px_90px_rgba(15,23,42,0.22)]">
            <div class="flex h-11 items-center gap-2 border-b border-slate-200 bg-slate-50 px-4">
              <span class="size-2.5 rounded-full bg-slate-300" /><span class="size-2.5 rounded-full bg-slate-300" /><span class="size-2.5 rounded-full bg-slate-300" />
            </div>
            <div class="grid min-h-[390px] grid-cols-[78px_1fr] max-sm:grid-cols-1">
              <div class="grid content-start gap-3.5 bg-slate-100 p-4 max-sm:hidden">
                <span class="h-10 rounded-xl bg-[var(--brand-blue)]" />
                <span class="h-10 rounded-xl bg-blue-100" />
                <span class="h-10 rounded-xl bg-blue-100" />
                <span class="h-10 rounded-xl bg-blue-100" />
              </div>
              <div class="grid gap-5 p-6">
                <div class="flex items-center justify-between gap-4">
                  <div><small class="block font-bold text-slate-500">Hôm nay</small><strong class="mt-1 block text-[22px] text-slate-900">IELTS Speaking Part 2</strong></div>
                  <span class="rounded-lg bg-sky-100 px-3 py-2 font-black text-[var(--brand-blue)]">09:00</span>
                </div>
                <div class="grid grid-cols-7 gap-2.5">
                  <div v-for="day in 14" :key="day" :class="['min-h-14 rounded-xl border p-2', [2, 6, 9].includes(day) ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white']">
                    <small class="font-black text-slate-400">{{ day }}</small>
                    <span v-if="[2, 6, 9].includes(day)" class="mt-3.5 block h-1.5 animate-bar-grow rounded-full bg-[var(--brand-blue)]" />
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3.5">
                  <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50"><v-icon icon="mdi-account-group-outline" class="text-[var(--brand-blue)]" /><strong class="mt-2 block text-2xl">12</strong><small class="font-bold text-slate-500">Học viên</small></div>
                  <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50"><v-icon icon="mdi-check-decagram-outline" class="text-[var(--brand-blue)]" /><strong class="mt-2 block text-2xl">100%</strong><small class="font-bold text-slate-500">Điểm danh</small></div>
                </div>
              </div>
            </div>
          </div>
          <div class="absolute left-[-22px] top-1/4 flex animate-float-card items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.16)] max-sm:relative max-sm:left-auto max-sm:top-auto max-sm:mx-auto max-sm:mt-4 max-sm:w-fit">
            <v-icon icon="mdi-check-circle-outline" class="text-green-600" />
            <div><small class="block font-bold text-slate-500">Điểm danh</small><strong>Hoàn tất 100%</strong></div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-[var(--brand-blue)] py-11 text-white">
      <div class="mx-auto grid w-[min(1180px,calc(100%-32px))] grid-cols-1 text-center sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="(stat, index) in stats" :key="stat.label" :style="{ animationDelay: `${index * 80}ms` }" :class="['animate-fade-lift border-white/25 px-6 py-5 sm:border-l lg:py-0', index === 0 ? 'sm:border-l-0' : '']">
          <strong class="mb-2 block text-[clamp(30px,4vw,48px)] font-black">{{ stat.value }}</strong>
          <span class="font-bold text-blue-100">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <section id="features" class="bg-white py-20 lg:py-24">
      <div class="mx-auto w-[min(1180px,calc(100%-32px))]">
        <div class="mx-auto mb-14 max-w-3xl text-center">
          <span class="text-[13px] font-black uppercase tracking-[.08em] text-[var(--brand-orange)]">Tại sao chọn Schedule Teacher?</span>
          <h2 class="mt-3 text-[clamp(32px,4vw,46px)] font-black leading-tight tracking-normal text-slate-900">Lợi ích rõ ràng cho lớp học thật</h2>
          <p class="mt-4 text-lg leading-8 text-slate-600">Giao diện lấy cảm hứng từ các sản phẩm giáo dục hiện đại: sáng, gọn, tập trung vào hành động hằng ngày.</p>
        </div>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article v-for="([icon, title, desc], index) in features" :key="title" :style="{ animationDelay: `${index * 60}ms` }" class="group animate-fade-lift rounded-[18px] border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div class="flex size-14 items-center justify-center rounded-[14px] border border-slate-200 bg-white text-[var(--brand-blue)] transition group-hover:rotate-[-3deg] group-hover:scale-110 group-hover:bg-[var(--brand-blue)] group-hover:text-white"><v-icon :icon="icon" size="28" /></div>
            <h3 class="mt-5 text-xl font-black text-slate-900">{{ title }}</h3>
            <p class="mt-2.5 leading-7 text-slate-600">{{ desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="workflow" class="border-t border-slate-200 bg-slate-50 py-20 lg:py-24">
      <div class="mx-auto grid w-[min(1180px,calc(100%-32px))] items-center gap-16 lg:grid-cols-2">
        <div>
          <div class="mb-6 flex size-14 items-center justify-center rounded-[14px] border border-slate-200 bg-white text-[var(--brand-blue)]"><v-icon icon="mdi-calendar-month-outline" /></div>
          <h2 class="text-[clamp(32px,4vw,46px)] font-black leading-tight tracking-normal text-slate-900">Quản lý lịch dạy và điểm danh thông minh</h2>
          <p class="mt-4 text-lg leading-8 text-slate-600">Calendar-first giúp giáo viên nhìn ngay việc cần làm hôm nay, lớp nào sắp diễn ra, học viên nào cần theo dõi và tài liệu nào phải chuẩn bị.</p>
          <ul class="mt-7 grid gap-4 p-0">
            <li v-for="item in checklist" :key="item" class="flex animate-fade-lift gap-3.5 font-bold text-slate-700"><v-icon icon="mdi-check-bold" class="mt-0.5 text-[var(--brand-orange)]" /><span>{{ item }}</span></li>
          </ul>
        </div>
        <div class="relative before:absolute before:inset-0 before:rotate-3 before:rounded-[20px] before:bg-[var(--brand-blue)] before:opacity-10">
          <img class="relative h-[420px] w-full rounded-[20px] object-cover shadow-[0_24px_55px_rgba(15,23,42,0.16)] transition duration-500 hover:scale-[1.025] hover:saturate-105 max-sm:h-[300px]" src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80" alt="Giáo viên đang hướng dẫn học viên trong lớp học">
        </div>
      </div>
    </section>

    <section id="student" class="bg-slate-50 pb-20 lg:pb-24">
      <div class="mx-auto grid w-[min(1180px,calc(100%-32px))] items-center gap-16 lg:grid-cols-2">
        <div class="relative order-2 before:absolute before:inset-0 before:rotate-[-3deg] before:rounded-[20px] before:bg-[var(--brand-orange)] before:opacity-10 lg:order-1">
          <img class="relative h-[420px] w-full rounded-[20px] object-cover shadow-[0_24px_55px_rgba(15,23,42,0.16)] transition duration-500 hover:scale-[1.025] hover:saturate-105 max-sm:h-[300px]" src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" alt="Nhóm học viên học cùng nhau">
        </div>
        <div class="order-1 lg:order-2">
          <div class="mb-6 flex size-14 items-center justify-center rounded-[14px] border border-slate-200 bg-white text-[var(--brand-orange)]"><v-icon icon="mdi-school-outline" /></div>
          <h2 class="text-[clamp(32px,4vw,46px)] font-black leading-tight tracking-normal text-slate-900">Cổng học viên riêng, rõ việc cần làm</h2>
          <p class="mt-4 text-lg leading-8 text-slate-600">Học viên có một không gian riêng để xem lịch học, tài liệu, bài tập, điểm số, nhận xét và trạng thái thanh toán mà không phụ thuộc vào tin nhắn rời rạc.</p>
          <ul class="mt-7 grid gap-4 p-0">
            <li class="flex gap-3.5 font-bold text-slate-700"><v-icon icon="mdi-check-bold" class="mt-0.5 text-[var(--brand-blue)]" /><span>Xem lịch học và link lớp trực tuyến.</span></li>
            <li class="flex gap-3.5 font-bold text-slate-700"><v-icon icon="mdi-check-bold" class="mt-0.5 text-[var(--brand-blue)]" /><span>Nhận tài liệu đúng lớp, đúng giáo viên.</span></li>
            <li class="flex gap-3.5 font-bold text-slate-700"><v-icon icon="mdi-check-bold" class="mt-0.5 text-[var(--brand-blue)]" /><span>Theo dõi điểm số, nhận xét và học phí.</span></li>
          </ul>
        </div>
      </div>
    </section>

    <section id="contact" class="relative overflow-hidden bg-[var(--brand-blue)] py-20 text-white">
      <div class="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.08)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.08)_50%,rgba(255,255,255,.08)_75%,transparent_75%,transparent)] bg-[length:24px_24px] opacity-40" />
      <div class="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <h2 class="text-[clamp(32px,4vw,46px)] font-black leading-tight tracking-normal text-white">Chuyển đổi số lớp học của bạn ngay hôm nay</h2>
        <p class="mx-auto my-8 max-w-2xl text-xl text-blue-100">Thử một quy trình quản lý gọn hơn cho lịch dạy, học viên, tài liệu và học phí.</p>
        <NuxtLink to="/register" class="inline-flex min-h-16 items-center justify-center rounded-xl bg-[var(--brand-orange)] px-10 text-xl font-black leading-none text-white no-underline shadow-[0_22px_48px_rgba(120,53,15,0.42)] transition hover:-translate-y-1 hover:bg-orange-600 hover:shadow-[0_26px_56px_rgba(120,53,15,0.5)]">Đăng ký dùng thử miễn phí 14 ngày</NuxtLink>
        <small class="mt-5 block text-blue-200">Không yêu cầu thẻ thanh toán - hỗ trợ cài đặt ban đầu</small>
      </div>
    </section>

    <footer class="bg-slate-900 py-16 pb-7 text-slate-400">
      <div class="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div class="grid gap-3.5">
          <NuxtLink to="/" class="inline-flex items-center gap-2.5 text-2xl font-black text-white no-underline"><span class="inline-flex size-10 items-center justify-center rounded-xl bg-[var(--brand-blue)] text-white"><v-icon icon="mdi-calendar-check" size="24" /></span><span>ScheduleTeacher</span></NuxtLink>
          <p class="max-w-md leading-7">Phần mềm quản lý lớp học, học viên, lịch dạy và tài liệu dành cho giáo viên hiện đại.</p>
          <span class="inline-flex items-center gap-2.5"><v-icon icon="mdi-phone-outline" size="18" /> 0909 123 456</span>
          <span class="inline-flex items-center gap-2.5"><v-icon icon="mdi-email-outline" size="18" /> hello@scheduleteacher.vn</span>
        </div>
        <div class="grid content-start gap-3.5"><h3 class="mb-2 text-lg font-bold text-white">Sản phẩm</h3><a href="#features" class="text-inherit no-underline hover:text-white">Tính năng nổi bật</a><a href="#workflow" class="text-inherit no-underline hover:text-white">Lịch dạy</a><a href="#student" class="text-inherit no-underline hover:text-white">Cổng học viên</a></div>
        <div class="grid content-start gap-3.5"><h3 class="mb-2 text-lg font-bold text-white">Tài nguyên</h3><a href="#" class="text-inherit no-underline hover:text-white">Hướng dẫn sử dụng</a><a href="#" class="text-inherit no-underline hover:text-white">Câu hỏi thường gặp</a><a href="#" class="text-inherit no-underline hover:text-white">Chính sách bảo mật</a></div>
        <div class="grid content-start gap-3.5"><h3 class="mb-2 text-lg font-bold text-white">Truy cập</h3><NuxtLink to="/login" class="text-inherit no-underline hover:text-white">Đăng nhập</NuxtLink><NuxtLink to="/register" class="text-inherit no-underline hover:text-white">Tạo tài khoản</NuxtLink><NuxtLink to="/calendar" class="text-inherit no-underline hover:text-white">Lịch dạy</NuxtLink></div>
      </div>
      <div class="mx-auto mt-14 flex w-[min(1180px,calc(100%-32px))] flex-col items-center justify-between gap-5 border-t border-slate-800 pt-6 text-center md:flex-row md:text-left">
        <span>© 2026 Schedule Teacher. All rights reserved.</span>
        <span>Facebook · YouTube · TikTok</span>
      </div>
    </footer>
  </main>
</template>
