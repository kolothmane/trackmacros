import { AppState, DayLog, MealEntry, UserProfile, ShoppingList } from '@/types';

const STORAGE_KEY = 'nutrition_tracker_v1';

export function loadState(): AppState {
  if (typeof window === 'undefined') {
    return { profile: null, logs: [], shoppingList: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { profile: null, logs: [], shoppingList: null };
    return JSON.parse(raw) as AppState;
  } catch {
    return { profile: null, logs: [], shoppingList: null };
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function getTodayLog(state: AppState): DayLog {
  const today = getTodayKey();
  return state.logs.find((l) => l.date === today) ?? { date: today, meals: [] };
}

export function addMealToState(state: AppState, meal: MealEntry): AppState {
  const today = getTodayKey();
  const logs = state.logs.filter((l) => l.date !== today);
  const todayLog = getTodayLog(state);
  return {
    ...state,
    logs: [...logs, { ...todayLog, meals: [...todayLog.meals, meal] }],
  };
}

export function removeMealFromState(state: AppState, mealId: string): AppState {
  const today = getTodayKey();
  const logs = state.logs.filter((l) => l.date !== today);
  const todayLog = getTodayLog(state);
  return {
    ...state,
    logs: [...logs, { ...todayLog, meals: todayLog.meals.filter((m) => m.id !== mealId) }],
  };
}
