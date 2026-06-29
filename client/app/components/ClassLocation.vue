<script setup lang="ts">
import type { ClassLocationInfo, MeetingProvider } from '~/composables/useClasses';

const props = withDefaults(
  defineProps<{
    value?: ClassLocationInfo | null;
    size?: string;
    // inline = plain icon + text (e.g. on the colored dashboard hero); default = chip.
    inline?: boolean;
  }>(),
  { value: null, size: 'small', inline: false },
);

const PROVIDER: Record<MeetingProvider, { label: string; icon: string; color: string }> = {
  GOOGLE_MEET: { label: 'Google Meet', icon: 'mdi-google', color: 'success' },
  ZOOM: { label: 'Zoom', icon: 'mdi-video', color: 'info' },
  OTHER: { label: 'Online', icon: 'mdi-link-variant', color: 'primary' },
};

const info = computed(() => {
  const v = props.value;
  if (!v || !v.locationType) return null;
  if (v.locationType === 'ONLINE') {
    const p = PROVIDER[v.meetingProvider ?? 'OTHER'] ?? PROVIDER.OTHER;
    return {
      icon: p.icon,
      color: p.color,
      label: p.label,
      href: v.meetingUrl || undefined,
    };
  }
  return {
    icon: 'mdi-map-marker-outline',
    color: 'default',
    label: v.room ? `Phòng ${v.room}` : 'Tại lớp',
    href: undefined as string | undefined,
  };
});
</script>

<template>
  <template v-if="info">
    <!-- Inline: icon + text (optionally a link). For colored backgrounds. -->
    <component
      :is="info.href ? 'a' : 'span'"
      v-if="inline"
      :href="info.href"
      :target="info.href ? '_blank' : undefined"
      rel="noopener"
      class="d-inline-flex align-center ga-1 text-decoration-none"
      :class="info.href ? 'text-white' : ''"
      @click.stop
    >
      <v-icon :size="16">{{ info.icon }}</v-icon>
      <span>{{ info.label }}</span>
    </component>

    <!-- Default: chip (links open the meeting in a new tab). -->
    <v-chip
      v-else
      :size="size"
      :color="info.color === 'default' ? undefined : info.color"
      variant="tonal"
      :prepend-icon="info.icon"
      :href="info.href"
      :target="info.href ? '_blank' : undefined"
      :link="!!info.href"
      @click.stop
    >
      {{ info.label }}
    </v-chip>
  </template>
</template>
