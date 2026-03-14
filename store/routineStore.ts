import { create } from 'zustand';

export interface RoutineTask {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  completed: boolean;
}

interface RoutineState {
  tasks: RoutineTask[];
  lastLoadedDate: string | null;  // 'YYYY-MM-DD' — detect day change

  // Actions
  setTasks: (tasks: RoutineTask[]) => void;
  markComplete: (id: string) => void;
  resetForNewDay: () => void;
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
  tasks: [],
  lastLoadedDate: null,

  setTasks: (tasks) =>
    set({ tasks, lastLoadedDate: todayString() }),

  markComplete: (id) =>
    set({
      tasks: get().tasks.map(t => t.id === id ? { ...t, completed: true } : t),
    }),

  resetForNewDay: () => {
    const today = todayString();
    if (get().lastLoadedDate !== today) {
      set({ tasks: [], lastLoadedDate: null });
    }
  },
}));
