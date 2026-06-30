<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [boolean];
  confirm: [];
  cancel: [];
  close: [];
}>();

function cancel() {
  emit('cancel');
  emit('update:modelValue', false);
}

function close() {
  emit('close');
  emit('update:modelValue', false);
}
</script>

<template>
  <UiDialog
    :model-value="props.modelValue"
    size="sm"
    :title="title"
    @update:model-value="emit('update:modelValue', $event)"
    @close="close"
  >
    <p class="text-base font-normal leading-[var(--st-leading-copy)] text-[var(--st-muted)]">
      {{ message }}
    </p>
    <template #footer>
      <UiActionGroup>
        <UiButton variant="secondary" :disabled="loading" @click="cancel">
          {{ cancelLabel }}
        </UiButton>
        <UiButton :variant="destructive ? 'danger' : 'primary'" :loading="loading" @click="emit('confirm')">
          {{ confirmLabel }}
        </UiButton>
      </UiActionGroup>
    </template>
  </UiDialog>
</template>
