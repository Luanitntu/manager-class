<script setup lang="ts">
import { useSystemHealth, useAdminSettings, useQueueStats } from '~/composables/useAdmin';

const { data: settings } = useAdminSettings();
const intervalMs = computed(() => (settings.value?.healthRefreshSeconds ?? 300) * 1000);

const { data, isLoading, isError, refetch, isFetching } = useSystemHealth(intervalMs);
const { data: queue } = useQueueStats(intervalMs);

const queueRows: { key: string; label: string; color: string }[] = [
  { key: 'waiting', label: 'Đang chờ', color: 'warning' },
  { key: 'active', label: 'Đang chạy', color: 'info' },
  { key: 'delayed', label: 'Hẹn giờ', color: 'secondary' },
  { key: 'completed', label: 'Hoàn tất', color: 'success' },
  { key: 'failed', label: 'Thất bại', color: 'error' },
];

function fmtUptime(sec: number) {
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">{{ $t('nav.health') }}</h1>
        <p class="text-medium-emphasis ma-0">
          Trạng thái hệ thống · tự cập nhật mỗi {{ Math.round(intervalMs / 1000) }}s
          (đổi trong Cài đặt).
        </p>
      </div>
      <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="isFetching" @click="refetch()">
        Làm mới
      </v-btn>
    </div>

    <v-alert v-if="isError" type="error" variant="tonal" class="mb-4">
      Không lấy được trạng thái (server có thể offline).
    </v-alert>

    <template v-if="data">
      <v-card class="pa-5 mb-4 d-flex align-center ga-4">
        <v-avatar :color="data.status === 'healthy' ? 'success' : 'warning'" size="48">
          <v-icon color="white" size="28">
            {{ data.status === 'healthy' ? 'mdi-check-circle' : 'mdi-alert' }}
          </v-icon>
        </v-avatar>
        <div>
          <div class="text-h6 font-weight-bold text-capitalize">{{ data.status }}</div>
          <div class="text-caption text-medium-emphasis">
            Cập nhật: {{ new Date(data.timestamp).toLocaleTimeString() }}
          </div>
        </div>
        <v-spacer />
        <div class="text-right">
          <div class="text-caption text-medium-emphasis">Uptime</div>
          <div class="font-weight-bold">{{ fmtUptime(data.uptimeSeconds) }}</div>
        </div>
      </v-card>

      <v-row>
        <!-- Services -->
        <v-col cols="12" md="4">
          <v-card class="pa-5 h-100">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">Dịch vụ</h3>
            <div class="d-flex align-center justify-space-between py-2 border-b">
              <div class="d-flex align-center ga-2">
                <v-icon :color="data.database.ok ? 'success' : 'error'">
                  {{ data.database.ok ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
                <span>Database <span class="text-caption text-medium-emphasis">({{ data.database.provider }})</span></span>
              </div>
              <span class="text-caption text-medium-emphasis">
                <template v-if="data.database.ok">{{ data.database.latencyMs }} ms</template>
                <span v-else class="text-error">down</span>
              </span>
            </div>
            <div class="d-flex align-center justify-space-between py-2">
              <div class="d-flex align-center ga-2">
                <v-icon :color="data.redis.ok ? 'success' : 'error'">
                  {{ data.redis.ok ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
                <span>Redis</span>
              </div>
              <span class="text-caption text-medium-emphasis">
                <template v-if="data.redis.ok">{{ data.redis.latencyMs }} ms</template>
                <span v-else class="text-error">down</span>
              </span>
            </div>
          </v-card>
        </v-col>

        <!-- Resources -->
        <v-col cols="12" md="4">
          <v-card class="pa-5 h-100">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">Tài nguyên</h3>
            <div class="mb-2">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>RAM</span>
                <span>{{ data.system.memUsedMb }} / {{ data.system.memTotalMb }} MB</span>
              </div>
              <v-progress-linear
                :model-value="data.system.memUsedPct"
                :color="data.system.memUsedPct > 85 ? 'error' : 'primary'"
                height="8"
                rounded
              />
            </div>
            <v-table density="compact">
              <tbody>
                <tr><td class="text-medium-emphasis">CPU</td><td>{{ data.system.cpuCores }} cores</td></tr>
                <tr><td class="text-medium-emphasis">Load (1m)</td><td>{{ data.system.loadAvg1m }}</td></tr>
                <tr><td class="text-medium-emphasis">Process RSS</td><td>{{ data.process.rssMb }} MB</td></tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>

        <!-- Environment -->
        <v-col cols="12" md="4">
          <v-card class="pa-5 h-100">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">Môi trường</h3>
            <v-table density="compact">
              <tbody>
                <tr><td class="text-medium-emphasis">Env</td><td>{{ data.env }}</td></tr>
                <tr><td class="text-medium-emphasis">Platform</td><td>{{ data.system.platform }} / {{ data.system.arch }}</td></tr>
                <tr><td class="text-medium-emphasis">Host</td><td>{{ data.system.hostname }}</td></tr>
                <tr><td class="text-medium-emphasis">Node</td><td>{{ data.versions.node }}</td></tr>
                <tr><td class="text-medium-emphasis">NestJS</td><td>{{ data.versions.nestjs }}</td></tr>
                <tr><td class="text-medium-emphasis">Prisma</td><td>{{ data.versions.prisma }}</td></tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>

      <p class="text-caption text-medium-emphasis mt-3">
        CPU model: {{ data.system.cpuModel }}
      </p>

      <!-- Queue (BullMQ) -->
      <v-card class="pa-5 mt-4">
        <div class="d-flex align-center justify-space-between mb-3">
          <h3 class="text-subtitle-1 font-weight-bold">Hàng đợi tác vụ (BullMQ)</h3>
          <v-chip
            v-if="queue"
            size="small"
            :color="queue.enabled ? 'success' : 'grey'"
            variant="tonal"
          >
            {{ queue.enabled ? 'Đang bật' : 'Đã tắt' }}
          </v-chip>
        </div>
        <div v-if="queue?.enabled && queue.counts" class="d-flex ga-4 flex-wrap">
          <div
            v-for="row in queueRows"
            :key="row.key"
            class="text-center px-4 py-2 rounded-lg"
            style="min-width: 96px; background: rgba(var(--v-theme-on-surface), 0.04)"
          >
            <div class="text-h6 font-weight-bold" :class="`text-${row.color}`">
              {{ queue.counts[row.key] ?? 0 }}
            </div>
            <div class="text-caption text-medium-emphasis">{{ row.label }}</div>
          </div>
        </div>
        <p v-else class="text-caption text-medium-emphasis ma-0">
          Hàng đợi đang tắt (QUEUE_ENABLED=false hoặc Redis không khả dụng). Email/nhắc lịch
          sẽ chạy đồng bộ.
        </p>
      </v-card>
    </template>

    <div v-else-if="isLoading" class="text-center pa-12">
      <v-progress-circular indeterminate color="primary" />
    </div>
  </div>
</template>
