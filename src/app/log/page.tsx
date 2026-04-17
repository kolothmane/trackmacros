'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2, CheckCircle2, Trash2, Zap } from 'lucide-react';
import { loadState, saveState, addMealToState, removeMealFromState, getTodayLog } from '@/lib/storage';
import { MealEntry } from '@/types';

const QUICK_SUPPLEMENTS = [
  { label: '1 scoop Whey', prompt: '1 scoop de whey protéine (30g)' },
  { label: 'Gainer 2 scoops', prompt: '2 scoops de mass gainer (100g)' },
  { label: 'Créatine 5g', prompt: '5g de créatine monohydrate' },
  { label: 'BCAA 10g', prompt: '10g de BCAA en poudre' },
];

export default function LogPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [meals, setMeals] = useState<MealEntry[]>([]);

  useEffect(() => {
    const state = loadState();
    setMeals(getTodayLog(state).meals);
  }, []);

  async function handleSubmit(text: string) {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Analyse ce repas/complément et retourne les macros : ${text}` }),
      });
      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error ?? 'Erreur API');

      if (data.type === 'track' && data.data) {
        const meal: MealEntry = {
          id: crypto.randomUUID(),
          description: data.data.description ?? text,
          calories: Number(data.data.calories) || 0,
          protein: Number(data.data.protein) || 0,
          carbs: Number(data.data.carbs) || 0,
          fat: Number(data.data.fat) || 0,
          timestamp: Date.now(),
        };
        const state = loadState();
        const newState = addMealToState(state, meal);
        saveState(newState);
        setMeals(getTodayLog(newState).meals);
        setInput('');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        throw new Error('Format de réponse inattendu');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  function handleRemove(mealId: string) {
    const state = loadState();
    const newState = removeMealFromState(state, mealId);
    saveState(newState);
    setMeals(getTodayLog(newState).meals);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Log Repas</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Décrivez votre repas en langage naturel</p>
      </div>

      {/* Input Section */}
      <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-3">
        <textarea
          className="w-full bg-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          placeholder="Ex: 2 œufs brouillés, 100g d'avoine avec du lait, 1 banane..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          onClick={() => handleSubmit(input)}
          disabled={loading || !input.trim()}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold rounded-xl py-3 min-h-[44px] transition-colors"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : success ? (
            <CheckCircle2 size={18} className="text-green-400" />
          ) : (
            <Plus size={18} />
          )}
          {loading ? 'Analyse en cours...' : success ? 'Ajouté !' : 'Analyser & Ajouter'}
        </button>
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
      </div>

      {/* Quick Supplements */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-yellow-400" />
          <h2 className="text-sm font-medium text-zinc-400">Compléments rapides</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_SUPPLEMENTS.map((s) => (
            <button
              key={s.label}
              onClick={() => handleSubmit(s.prompt)}
              disabled={loading}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 transition-colors min-h-[44px] text-left"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Meals List */}
      {meals.length > 0 && (
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-3">
          <h2 className="text-sm font-medium text-zinc-300">Repas enregistrés aujourd'hui</h2>
          {meals.map((meal) => (
            <div key={meal.id} className="flex items-start gap-3 py-2 border-b border-zinc-800 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{meal.description}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {Math.round(meal.calories)} kcal · P:{Math.round(meal.protein)}g · G:{Math.round(meal.carbs)}g · L:{Math.round(meal.fat)}g
                </p>
              </div>
              <button
                onClick={() => handleRemove(meal.id)}
                className="text-zinc-600 hover:text-red-400 transition-colors p-1 flex-shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
