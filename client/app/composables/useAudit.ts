import { useQuery } from '@tanstack/vue-query';

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

export function useAuditLogs() {
  const { requestPaged } = useApi();
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => requestPaged<AuditLog[]>('/audit-logs?limit=100'),
  });
}
