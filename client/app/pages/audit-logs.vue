<script setup lang="ts">
import { useAuditLogs } from '~/composables/useAudit';

const { data, isLoading } = useAuditLogs();
const logs = computed(() => data.value?.data ?? []);

const actionColor: Record<string, string> = {
  CREATED: 'success',
  UPDATED: 'info',
  DELETED: 'error',
  RECORDED: 'primary',
};

function colorFor(action: string) {
  const key = Object.keys(actionColor).find((k) => action.includes(k));
  return key ? actionColor[key] : 'grey';
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString();
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Audit Logs</h1>
    <p class="text-medium-emphasis mb-6">Important actions performed in your tenant.</p>

    <v-card>
      <v-table>
        <thead>
          <tr>
            <th>When</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Entity</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in logs" :key="l.id">
            <td class="text-caption">{{ fmt(l.createdAt) }}</td>
            <td>
              {{ l.actor?.fullName ?? '—' }}
              <span class="text-caption text-medium-emphasis">({{ l.actor?.role }})</span>
            </td>
            <td>
              <v-chip :color="colorFor(l.action)" size="small" variant="tonal">
                {{ l.action.replace(/_/g, ' ') }}
              </v-chip>
            </td>
            <td class="text-caption">
              {{ l.entityType }}<span v-if="l.entityId"> · {{ l.entityId.slice(0, 8) }}</span>
            </td>
          </tr>
          <tr v-if="!logs.length && !isLoading">
            <td colspan="4" class="text-center text-medium-emphasis pa-6">No audit entries yet.</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>
