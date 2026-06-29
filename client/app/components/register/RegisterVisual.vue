<template>
  <section class="register-visual">
    <div class="register-visual__tint" />
    <div class="register-visual__gradient" />
    <v-img
      class="register-visual-image"
      src="https://images.unsplash.com/photo-1509062522246-3755977927d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBjbGFzc3Jvb20lMjB0ZWFjaGVyJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzgyMTEwNTE1fDA&ixlib=rb-4.1.0&q=80&w=1080"
      alt="Register illustration"
      cover
    />
    <div class="register-story">
      <h2>Quản lý lớp học chuyên nghiệp</h2>
      <p>
        Nền tảng được thiết kế chuyên biệt để giúp bạn tối ưu hóa công tác quản lý,
        tập trung 100% vào chất lượng giảng dạy.
      </p>
      <div class="register-teachers">
        <div class="register-avatars">
          <v-avatar
            v-for="avatar in [11, 12, 13, 14]"
            :key="avatar"
            class="register-avatar"
            size="40"
          >
            <v-img :src="`https://i.pravatar.cc/100?img=${avatar}`" alt="user" cover />
          </v-avatar>
        </div>
        <div class="register-count">
          <strong>Hơn 5000+</strong>
          <span>giáo viên đang sử dụng</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss" src="../../styles/register/visual.scss"></style>
