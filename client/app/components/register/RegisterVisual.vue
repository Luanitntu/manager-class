<template>
  <section class="relative block min-h-screen w-1/2 overflow-hidden bg-slate-100 max-lg:hidden">
    <div class="absolute inset-0 z-10 bg-cyan-600/20 mix-blend-multiply" />
    <div class="absolute inset-0 z-20 bg-gradient-to-t from-cyan-950/80 via-transparent to-transparent" />
    <img
      class="absolute inset-0 h-full w-full object-cover"
      src="https://images.unsplash.com/photo-1509062522246-3755977927d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBjbGFzc3Jvb20lMjB0ZWFjaGVyJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzgyMTEwNTE1fDA&ixlib=rb-4.1.0&q=80&w=1080"
      alt="Register illustration"
    >
    <div class="absolute inset-x-12 bottom-12 z-30 text-white">
      <h2 class="mb-4 max-w-xl text-2xl font-semibold leading-[1.2] xl:text-3xl">Quản lý lớp học chuyên nghiệp</h2>
      <p class="max-w-lg text-base font-normal leading-[var(--st-leading-copy)] text-white/80">
        Nền tảng được thiết kế chuyên biệt để giúp bạn tối ưu hóa công tác quản lý,
        tập trung 100% vào chất lượng giảng dạy.
      </p>
      <div class="mt-8 flex items-center gap-4">
        <div class="flex">
          <span
            v-for="avatar in [11, 12, 13, 14]"
            :key="avatar"
            class="-ml-4 first:ml-0 inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white bg-slate-300"
          >
            <img :src="`https://i.pravatar.cc/100?img=${avatar}`" alt="user" class="h-full w-full object-cover">
          </span>
        </div>
        <div class="grid">
          <strong class="text-base font-semibold leading-[var(--st-leading-tight)] text-white">Hơn 5000+</strong>
          <span class="text-sm font-normal leading-[var(--st-leading-copy)] text-white/70">giáo viên đang sử dụng</span>
        </div>
      </div>
    </div>
  </section>
</template>
