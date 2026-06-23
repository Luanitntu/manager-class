<template>
  <v-app>
    <v-main class="bg-background">
      <div class="d-flex justify-end pa-4">
        <LanguageSwitcher />
      </div>
      <v-container class="d-flex align-center justify-center" style="min-height: calc(100vh - 72px)">
        <div style="width: 100%; max-width: 420px">
          <slot />
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>
