<template>
  <section class="relative block min-h-screen w-1/2 overflow-hidden bg-[var(--st-bg-soft)] max-lg:hidden">
    <div class="absolute inset-0 z-10 bg-cyan-700/10 mix-blend-multiply" />
    <div class="absolute inset-0 z-20 bg-gradient-to-t from-cyan-950/80 via-cyan-950/25 to-transparent" />
    <img
      class="absolute inset-0 h-full w-full object-cover"
      src="https://images.unsplash.com/photo-1741699428220-65f37f3fbbcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080"
      alt="Không gian học tập hiện đại"
    >
    <div class="absolute inset-x-12 bottom-12 z-30 text-white">
      <blockquote class="mb-6 text-xl font-semibold leading-[1.45] xl:text-2xl">
        "Từ ngày chuyển sang dùng ScheduleTeacher, tôi tiết kiệm được 40% thời gian quản lý lịch học. Giao diện thân thiện và trực quan!"
      </blockquote>
      <div class="flex items-center gap-4">
        <span class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/20 text-xl font-semibold backdrop-blur">
          M
        </span>
        <div>
          <div class="text-base font-semibold leading-[var(--st-leading-copy)]">Cô Mai Nguyễn</div>
          <div class="text-sm font-normal leading-[var(--st-leading-copy)] text-white/80">Giáo viên IELTS</div>
        </div>
      </div>
    </div>
  </section>
</template>
