<script setup lang="ts">
import type { PaginationMeta } from '~/composables/useApi';

const props = defineProps<{ meta: PaginationMeta }>();
const page = defineModel<number>('page', { required: true });
const limit = defineModel<number>('limit', { required: true });
</script>

<template>
  <UiPagination v-model:page="page" v-model:limit="limit" :meta="props.meta" />
</template>
