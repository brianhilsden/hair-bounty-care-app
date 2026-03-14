import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routineApi } from '../lib/api/routine';

export function useRoutine() {
  const queryClient = useQueryClient();

  const todayQuery = useQuery({
    queryKey: ['routines', 'today'],
    queryFn: routineApi.getTodayRoutines,
  });

  const streakQuery = useQuery({
    queryKey: ['streak'],
    queryFn: routineApi.getStreak,
  });

  const statsQuery = useQuery({
    queryKey: ['routine', 'stats'],
    queryFn: routineApi.getRoutineStats,
  });

  const logRoutineMutation = useMutation({
    mutationFn: (templateId: string) => routineApi.logRoutine(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      queryClient.invalidateQueries({ queryKey: ['routine', 'stats'] });
    },
  });

  const routines = todayQuery.data?.data ?? [];
  const completedCount = routines.filter((r) => r.completed).length;
  const totalCount = routines.length;

  return {
    routines,
    streak: streakQuery.data?.data ?? null,
    stats: statsQuery.data?.data ?? null,
    isLoading: todayQuery.isLoading,
    completedCount,
    totalCount,
    progress: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
    logRoutine: logRoutineMutation,
  };
}
