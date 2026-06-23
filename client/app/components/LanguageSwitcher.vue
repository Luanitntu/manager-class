<script setup lang="ts">
const { locale, setLocale } = useI18n();

const options = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
] as const;

const current = computed(() => options.find((o) => o.code === locale.value) ?? options[0]);

function choose(code: 'vi' | 'en') {
  setLocale(code);
}
</script>

<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn v-bind="props" variant="text" class="text-none" size="small">
        <span class="mr-1">{{ current.flag }}</span>
        {{ current.code.toUpperCase() }}
        <v-icon end size="16">mdi-chevron-down</v-icon>
      </v-btn>
    </template>
    <v-list density="compact">
      <v-list-item
        v-for="o in options"
        :key="o.code"
        :active="o.code === locale"
        @click="choose(o.code)"
      >
        <template #prepend><span class="mr-2">{{ o.flag }}</span></template>
        <v-list-item-title>{{ o.label }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
