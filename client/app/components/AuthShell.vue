<script setup lang="ts">
// Split-screen auth layout: branded panel on the LEFT, form on the RIGHT.
// Pass an optional background `image`; otherwise a brand gradient is used.
withDefaults(defineProps<{ image?: string | null }>(), { image: null });
</script>

<template>
  <div class="auth-split">
    <!-- Left: brand / marketing panel -->
    <aside
      class="auth-aside"
      :class="{ 'has-image': !!image }"
      :style="image ? { backgroundImage: `url(${image})` } : undefined"
    >
      <div class="auth-aside-overlay">
        <slot name="aside" />
      </div>
    </aside>

    <!-- Right: form -->
    <section class="auth-form">
      <div class="auth-form-inner">
        <div class="d-flex align-center ga-2 mb-8">
          <v-avatar color="primary" size="36" rounded="lg">
            <v-icon color="white">mdi-school</v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-bold">Schedule Teacher</span>
        </div>
        <slot />
      </div>
    </section>
  </div>
</template>

<style scoped>
.auth-split {
  display: flex;
  min-height: 100vh;
}
.auth-aside {
  flex: 1 1 50%;
  position: relative;
  display: none;
  background: linear-gradient(150deg, #2f4ad0 0%, #4570ea 45%, #5d87ff 100%);
  background-size: cover;
  background-position: center;
}
.auth-aside.has-image::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, rgba(20, 30, 80, 0.55), rgba(20, 30, 80, 0.75));
}
.auth-aside-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 48px;
  color: #fff;
}
.auth-form {
  flex: 1 1 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}
.auth-form-inner {
  width: 100%;
  max-width: 400px;
}
@media (min-width: 960px) {
  .auth-aside {
    display: block;
  }
}
</style>
