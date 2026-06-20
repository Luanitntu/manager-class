<template>
  <v-app>
    <v-main class="bg-background">
      <v-container class="fill-height d-flex align-center justify-center">
        <div style="width: 100%; max-width: 420px">
          <slot />
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>
