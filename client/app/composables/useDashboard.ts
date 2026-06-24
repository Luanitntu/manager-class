import { useQuery } from '@tanstack/vue-query';
import type { ClassLocationInfo } from './useClasses';

export interface UpcomingSession {
  id: string;
  startTime: string;
  endTime: string;
  lessonTopic?: string | null;
  class: { name: string; color?: string | null } & ClassLocationInfo;
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
  totalAssistants?: number;
  totalUsers?: number;
  totalDocuments?: number;
  totalSessions?: number;
  signups?: { months: string[]; counts: number[] };
  revenueCollected?: number;
  revenueOutstanding?: number;
  revenueByTeacher?: { teacherId: string; teacherName: string; collected: number; total: number }[];
  plans?: { trial: number; personal: number; pro: number; business: number };
  subscriptionRevenue?: {
    months: string[];
    byPlan: { personal: number[]; pro: number[]; business: number[] };
    total: number[];
    grandTotal: number;
  };
  upcomingSessions?: UpcomingSession[];
}

export function useDashboard() {
  const { request } = useApi();
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => request<DashboardStats>('/dashboard'),
  });
}
