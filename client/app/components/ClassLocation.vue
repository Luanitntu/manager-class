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

type LocationTone = 'neutral' | 'primary' | 'info' | 'success';

const PROVIDER: Record<MeetingProvider, { label: string; icon: string; tone: LocationTone }> = {
  GOOGLE_MEET: { label: 'Google Meet', icon: 'mdi-google', tone: 'success' },
  ZOOM: { label: 'Zoom', icon: 'mdi-video', tone: 'info' },
  OTHER: { label: 'Online', icon: 'mdi-link-variant', tone: 'primary' },
};

const info = computed(() => {
  const v = props.value;
  if (!v || !v.locationType) return null;
  if (v.locationType === 'ONLINE') {
    const p = PROVIDER[v.meetingProvider ?? 'OTHER'] ?? PROVIDER.OTHER;
    return {
      icon: p.icon,
      tone: p.tone,
      label: p.label,
      href: v.meetingUrl || undefined,
    };
  }
  return {
    icon: 'mdi-map-marker-outline',
    tone: 'neutral' as const,
    label: v.room ? `Phòng ${v.room}` : 'Tại lớp',
    href: undefined as string | undefined,
  };
});

const badgeSize = computed(() => (props.size === 'small' || props.size === 'x-small' ? 'sm' : 'md'));
</script>

<template>
  <template v-if="info">
    <component
      :is="info.href ? 'a' : 'span'"
      v-if="inline"
      :href="info.href"
      :target="info.href ? '_blank' : undefined"
      :rel="info.href ? 'noopener' : undefined"
      class="inline-flex min-w-0 items-center gap-1 text-sm font-semibold no-underline"
      :class="info.href ? 'text-white hover:underline' : 'text-inherit'"
      @click.stop
    >
      <AppIcon :name="info.icon" :size="16" />
      <span>{{ info.label }}</span>
    </component>

    <component
      :is="info.href ? 'a' : 'span'"
      v-else
      :href="info.href"
      :target="info.href ? '_blank' : undefined"
      :rel="info.href ? 'noopener' : undefined"
      class="inline-flex no-underline"
      @click.stop
    >
      <UiBadge :tone="info.tone" :size="badgeSize" :icon="info.icon">
        {{ info.label }}
      </UiBadge>
    </component>
  </template>
</template>
