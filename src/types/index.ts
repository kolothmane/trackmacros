export interface UserProfile {
  age: number;
  sex: 'male' | 'female';
  weight: number; // kg
  height: number; // cm
  activity: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'bulk' | 'cut' | 'maintain';
  tdee: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

export interface MealEntry {
  id: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: number;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  meals: MealEntry[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  price: string;
  checked: boolean;
}

export interface ShoppingList {
  budget: number;
  items: ShoppingItem[];
  generatedAt: number;
}

export interface AppState {
  profile: UserProfile | null;
  logs: DayLog[];
  shoppingList: ShoppingList | null;
}
