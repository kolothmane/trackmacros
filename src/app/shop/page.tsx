'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Loader2, RefreshCw, CheckSquare, Square } from 'lucide-react';
import { loadState, saveState } from '@/lib/storage';
import { ShoppingItem } from '@/types';

const BUDGET_OPTIONS = [30, 50, 80, 100, 150];

export default function ShopPage() {
  const [budget, setBudget] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [generatedAt, setGeneratedAt] = useState<number | null>(null);

  useEffect(() => {
    const state = loadState();
    if (state.shoppingList) {
      setItems(state.shoppingList.items);
      setBudget(state.shoppingList.budget);
      setGeneratedAt(state.shoppingList.generatedAt);
    }
  }, []);

  async function generateList() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Génère une liste de courses hebdomadaire pour la musculation et la nutrition sportive avec un budget de ${budget}€. Inclus des protéines, légumes, féculents et éventuellement des compléments pas chers. Retourne le type "shop".`,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'Erreur API');
      if (data.type === 'shop' && data.data?.items) {
        const newItems: ShoppingItem[] = data.data.items.map((item: { name: string; quantity: string; price: string }) => ({
          id: crypto.randomUUID(),
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          checked: false,
        }));
        const now = Date.now();
        setItems(newItems);
        setGeneratedAt(now);
        const state = loadState();
        saveState({ ...state, shoppingList: { budget, items: newItems, generatedAt: now } });
      } else {
        throw new Error('Format de réponse inattendu');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  function toggleItem(id: string) {
    const updated = items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item));
    setItems(updated);
    const state = loadState();
    if (state.shoppingList) {
      saveState({ ...state, shoppingList: { ...state.shoppingList, items: updated } });
    }
  }

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Liste de Courses</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Génère une liste hebdomadaire adaptée à ton budget</p>
      </div>

      {/* Budget Selector */}
      <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-3">
        <p className="text-sm font-medium text-zinc-300">Budget hebdomadaire</p>
        <div className="flex gap-2 flex-wrap">
          {BUDGET_OPTIONS.map((b) => (
            <button
              key={b}
              onClick={() => setBudget(b)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold min-h-[44px] transition-colors ${
                budget === b
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {b}€
            </button>
          ))}
        </div>
        <button
          onClick={generateList}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold rounded-xl py-3 min-h-[44px] transition-colors"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
          {loading ? 'Génération...' : items.length > 0 ? 'Régénérer la liste' : 'Générer la liste'}
        </button>
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
      </div>

      {/* Shopping List */}
      {items.length > 0 && (
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-300">Articles ({checkedCount}/{items.length})</h2>
            {generatedAt && (
              <div className="flex items-center gap-1 text-zinc-500">
                <RefreshCw size={11} />
                <span className="text-[10px]">
                  {new Date(generatedAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}
          </div>
          <div className="space-y-1">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center gap-3 py-2.5 px-1 rounded-xl hover:bg-zinc-800 transition-colors text-left"
              >
                {item.checked ? (
                  <CheckSquare size={20} className="text-blue-400 flex-shrink-0" />
                ) : (
                  <Square size={20} className="text-zinc-600 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${item.checked ? 'line-through text-zinc-500' : 'text-white'}`}>
                    {item.name}
                  </span>
                  <span className="text-xs text-zinc-500 ml-2">{item.quantity}</span>
                </div>
                <span className="text-xs font-medium text-zinc-400 flex-shrink-0">{item.price}</span>
              </button>
            ))}
          </div>
          {checkedCount === items.length && items.length > 0 && (
            <p className="text-center text-sm text-green-400 font-medium py-2">✓ Liste complète !</p>
          )}
        </div>
      )}
    </div>
  );
}
