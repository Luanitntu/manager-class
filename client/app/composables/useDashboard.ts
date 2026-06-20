import { useQuery } from '@tanstack/vue-query';

export interface UpcomingSession {
  id: string;
  startTime: string;
  endTime: string;
  lessonTopic?: string | null;
  class: { name: string; color?: string | null };
}

export interface DashboardStats {
  role: string;
  // teacher
  totalClasses?: number;
  totalStudents?: number;
  tuitionCollected?: number;
  outstandingTuition?: number;
  // assistant
  assignedClasses?: number;
  totalSessions?: number;
  // student
  currentClasses?: number;
  remainingTuition?: number;
  totalScores?: number;
  // super admin
  totalTeachers?: number;
  totalUsers?: number;
  upcomingSessions?: UpcomingSession[];
}

export function useDashboard() {
  const { request } = useApi();
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => request<DashboardStats>('/dashboard'),
  });
}
