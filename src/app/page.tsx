'use client';

import { useEffect, useState } from 'react';
import { Flame, TrendingUp, Droplets } from 'lucide-react';
import CalorieRing from '@/components/CalorieRing';
import MacroBar from '@/components/MacroBar';
import { loadState, getTodayLog } from '@/lib/storage';
import { AppState, DayLog, UserProfile } from '@/types';

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayLog, setTodayLog] = useState<DayLog>({ date: '', meals: [] });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const state: AppState = loadState();
    setProfile(state.profile);
    setTodayLog(getTodayLog(state));
    setLoaded(true);
  }, []);

  const totals = todayLog.meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  if (!loaded) return null;

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center">
          <TrendingUp className="text-blue-400" size={32} />
        </div>
        <h1 className="text-2xl font-bold">Bienvenue sur TrackMacros</h1>
        <p className="text-zinc-400 text-sm max-w-xs">
          Commencez par configurer votre profil pour calculer vos besoins caloriques.
        </p>
        <a
          href="/profile"
          className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl px-6 py-3 transition-colors"
        >
          Configurer mon profil
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-zinc-400 text-sm">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-orange-500/20 rounded-full px-3 py-1.5">
          <Flame size={14} className="text-orange-400" />
          <span className="text-xs font-semibold text-orange-400">{Math.round(totals.calories)} kcal</span>
        </div>
      </div>

      {/* Calorie Ring */}
      <div className="bg-zinc-900 rounded-2xl p-6 flex flex-col items-center gap-4 border border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-400 self-start">Calories du jour</h2>
        <CalorieRing consumed={totals.calories} target={profile.targetCalories} />
        <div className="grid grid-cols-3 w-full gap-3 mt-2">
          {[
            { label: 'Objectif', value: `${Math.round(profile.targetCalories)} kcal`, color: 'text-zinc-300' },
            { label: 'Consommé', value: `${Math.round(totals.calories)} kcal`, color: 'text-blue-400' },
            { label: 'Restant', value: `${Math.round(Math.max(profile.targetCalories - totals.calories, 0))} kcal`, color: 'text-green-400' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className={`text-sm font-semibold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Macro Bars */}
      <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 space-y-4">
        <div className="flex items-center gap-2">
          <Droplets size={16} className="text-blue-400" />
          <h2 className="text-sm font-medium text-zinc-300">Macronutriments</h2>
        </div>
        <MacroBar label="Protéines" current={totals.protein} target={profile.targetProtein} color="bg-blue-500" />
        <MacroBar label="Glucides" current={totals.carbs} target={profile.targetCarbs} color="bg-amber-500" />
        <MacroBar label="Lipides" current={totals.fat} target={profile.targetFat} color="bg-rose-500" />
      </div>

      {/* Today's Meals */}
      {todayLog.meals.length > 0 && (
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 space-y-3">
          <h2 className="text-sm font-medium text-zinc-300">Repas du jour</h2>
          {todayLog.meals.map((meal) => (
            <div key={meal.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{meal.description}</p>
                <p className="text-xs text-zinc-500">
                  P: {Math.round(meal.protein)}g · G: {Math.round(meal.carbs)}g · L: {Math.round(meal.fat)}g
                </p>
              </div>
              <span className="text-sm font-semibold text-blue-400 ml-3">{Math.round(meal.calories)} kcal</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
