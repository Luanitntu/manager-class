<script setup lang="ts">
import { useAuditLogs } from '~/composables/useAudit';

const { data, isLoading, error, refetch } = useAuditLogs();
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
    <AppPageHeader
      title="Audit Logs"
      subtitle="Important actions performed in your tenant."
      icon="mdi-history"
    />

    <AppState
      v-if="isLoading"
      variant="loading"
      title="Loading logs"
      body="Fetching security and audit event history..."
    />

    <AppState
      v-else-if="error"
      variant="error"
      title="Could not load audit logs"
      body="Failed to retrieve logs. Please check your network connection."
      action-label="Try again"
      @action="refetch()"
    />

    <template v-else>
      <v-card v-if="logs.length" class="st-card-soft">
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
          </tbody>
        </v-table>
      </v-card>
      <AppState
        v-else
        variant="empty"
        title="No audit entries yet"
        body="Security events will appear here once actions are performed on the platform."
      />
    </template>
  </div>
</template>
