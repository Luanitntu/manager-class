import { useQuery } from '@tanstack/vue-query';
import type { MaybeRefOrGetter } from 'vue';

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
  newValue?: unknown;
  oldValue?: unknown;
  createdAt: string;
  actor?: { id: string; fullName: string; role: string };
}

interface AuditFilters {
  action?: MaybeRefOrGetter<string | undefined>;
  entityType?: MaybeRefOrGetter<string | undefined>;
  from?: MaybeRefOrGetter<string | undefined>;
  to?: MaybeRefOrGetter<string | undefined>;
  page?: MaybeRefOrGetter<number>;
}

export function useAuditLogs(f: AuditFilters = {}, limit: MaybeRefOrGetter<number> = 25) {
  const { requestPaged } = useApi();
  return useQuery({
    queryKey: ['audit-logs', f.action, f.entityType, f.from, f.to, f.page, limit],
    queryFn: () => {
      const params = new URLSearchParams({
        limit: String(toValue(limit) ?? 25),
        page: String(toValue(f.page) ?? 1),
      });
      const action = toValue(f.action);
      const entityType = toValue(f.entityType);
      const from = toValue(f.from);
      const to = toValue(f.to);
      if (action) params.set('action', action);
      if (entityType) params.set('entityType', entityType);
      if (from) params.set('from', new Date(from).toISOString());
      if (to) params.set('to', new Date(to).toISOString());
      return requestPaged<AuditLog[]>(ApiEndpoints.auditLogs.list(params));
    },
  });
}
