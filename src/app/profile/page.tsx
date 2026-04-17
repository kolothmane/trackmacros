'use client';

import { useState, useEffect } from 'react';
import { User, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';
import { loadState, saveState } from '@/lib/storage';
import { UserProfile } from '@/types';

const activityLabels: Record<string, string> = {
  sedentary: "Sédentaire (peu/pas d'exercice)",
  light: 'Léger (1-3j/semaine)',
  moderate: 'Modéré (3-5j/semaine)',
  active: 'Actif (6-7j/semaine)',
  very_active: 'Très actif (2x/jour)',
};

export default function ProfilePage() {
  const [form, setForm] = useState({
    age: '',
    sex: 'male',
    weight: '',
    height: '',
    activity: 'moderate',
    goal: 'bulk',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const state = loadState();
    if (state.profile) {
      setProfile(state.profile);
      setForm({
        age: String(state.profile.age),
        sex: state.profile.sex,
        weight: String(state.profile.weight),
        height: String(state.profile.height),
        activity: state.profile.activity,
        goal: state.profile.goal,
      });
    }
  }, []);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Calcule le TDEE pour : âge ${form.age} ans, sexe ${form.sex === 'male' ? 'homme' : 'femme'}, poids ${form.weight}kg, taille ${form.height}cm, activité ${activityLabels[form.activity]}, objectif ${form.goal === 'bulk' ? 'prise de masse' : form.goal === 'cut' ? 'sèche' : 'maintien'}. Retourne le type "setup".`,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'Erreur API');
      if (data.type === 'setup' && data.data) {
        const newProfile: UserProfile = {
          age: Number(form.age),
          sex: form.sex as 'male' | 'female',
          weight: Number(form.weight),
          height: Number(form.height),
          activity: form.activity as UserProfile['activity'],
          goal: form.goal as UserProfile['goal'],
          tdee: Number(data.data.tdee),
          targetCalories: Number(data.data.targetCalories),
          targetProtein: Number(data.data.targetProtein),
          targetCarbs: Number(data.data.targetCarbs),
          targetFat: Number(data.data.targetFat),
        };
        const state = loadState();
        saveState({ ...state, profile: newProfile });
        setProfile(newProfile);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('Format de réponse inattendu');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    const state = loadState();
    saveState({ ...state, profile: null, logs: [] });
    setProfile(null);
    setForm({ age: '', sex: 'male', weight: '', height: '', activity: 'moderate', goal: 'bulk' });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Profil &amp; Objectifs</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Calcule ton TDEE et définis tes objectifs</p>
        </div>
        {profile && (
          <button onClick={handleReset} className="p-2 rounded-xl text-zinc-500 hover:text-red-400 transition-colors">
            <RotateCcw size={18} />
          </button>
        )}
      </div>

      {/* Current Profile Summary */}
      {profile && (
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-3">
          <div className="flex items-center gap-2">
            <User size={16} className="text-blue-400" />
            <h2 className="text-sm font-medium text-zinc-300">Profil actuel</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'TDEE', value: `${Math.round(profile.tdee)} kcal` },
              { label: 'Objectif', value: `${Math.round(profile.targetCalories)} kcal` },
              { label: 'Protéines', value: `${Math.round(profile.targetProtein)}g` },
              { label: 'Glucides', value: `${Math.round(profile.targetCarbs)}g` },
              { label: 'Lipides', value: `${Math.round(profile.targetFat)}g` },
              { label: 'Poids', value: `${profile.weight} kg` },
            ].map((s) => (
              <div key={s.label} className="bg-zinc-800 rounded-xl p-3">
                <p className="text-sm font-semibold text-white">{s.value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-4">
        <h2 className="text-sm font-medium text-zinc-300">
          {profile ? 'Modifier le profil' : 'Créer mon profil'}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Âge</label>
            <input
              type="number"
              placeholder="25"
              value={form.age}
              onChange={(e) => set('age', e.target.value)}
              className="w-full bg-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              min="10"
              max="100"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Sexe</label>
            <select
              value={form.sex}
              onChange={(e) => set('sex', e.target.value)}
              className="w-full bg-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            >
              <option value="male">Homme</option>
              <option value="female">Femme</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Poids (kg)</label>
            <input
              type="number"
              placeholder="75"
              value={form.weight}
              onChange={(e) => set('weight', e.target.value)}
              className="w-full bg-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              min="30"
              max="300"
              step="0.1"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Taille (cm)</label>
            <input
              type="number"
              placeholder="175"
              value={form.height}
              onChange={(e) => set('height', e.target.value)}
              className="w-full bg-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              min="100"
              max="250"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Niveau d&apos;activité</label>
          <select
            value={form.activity}
            onChange={(e) => set('activity', e.target.value)}
            className="w-full bg-zinc-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          >
            {Object.entries(activityLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-zinc-400">Objectif</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'bulk', label: 'Prise de masse' },
              { value: 'maintain', label: 'Maintien' },
              { value: 'cut', label: 'Sèche' },
            ].map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => set('goal', o.value)}
                className={`py-2.5 rounded-xl text-xs font-semibold min-h-[44px] transition-colors ${
                  form.goal === o.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold rounded-xl py-3 min-h-[44px] transition-colors"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : success ? (
            <CheckCircle2 size={18} className="text-green-400" />
          ) : null}
          {loading ? 'Calcul en cours...' : success ? 'Profil mis à jour !' : 'Calculer mon TDEE'}
        </button>

        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
      </form>
    </div>
  );
}
