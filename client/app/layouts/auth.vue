<template>
  <v-app>
    <v-main class="bg-surface">
      <div class="auth-lang">
        <LanguageSwitcher />
      </div>
      <slot />
    </v-main>
  </v-app>
</template>

<style scoped>
.auth-lang {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}
</style>
