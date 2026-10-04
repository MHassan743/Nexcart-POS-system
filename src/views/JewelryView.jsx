import React, { useState } from 'react';
import { usePOS } from '../context/POSContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Modal } from '../components/Modal.jsx';
import { 
  Gem, 
  Scale, 
  Calculator, 
  Sparkles, 
  RefreshCw, 
  DollarSign
} from 'lucide-react';

export const JewelryView = () => {
  const { store } = useAuth();

  // Gold Rate State (Saved in localStorage)
  const [rates, setRates] = useState(() => {
    try {
      const stored = localStorage.getItem('nexcart_gold_rates');
      return stored ? JSON.parse(stored) : {
        rate24kPerTola: 285000,
        rate22kPerTola: 261250,
        rate21kPerTola: 249375,
        rate18kPerTola: 213750,
        lastUpdated: new Date().toISOString()
      };
    } catch {
      return { rate24kPerTola: 285000, rate22kPerTola: 261250, rate21kPerTola: 249375, rate18kPerTola: 213750, lastUpdated: new Date().toISOString() };
    }
  });

  const [editRate24k, setEditRate24k] = useState(rates.rate24kPerTola.toString());

  // Calculator inputs
  const [calcKarat, setCalcKarat] = useState('22K');
  const [calcWeightGram, setCalcWeightGram] = useState('11.664'); // 1 Tola = 11.664 grams
  const [makingChargesPerGram, setMakingChargesPerGram] = useState('1500');
  const [stoneCharges, setStoneCharges] = useState('2000');

  const update24kRate = (val) => {
    const r24 = Number(val || 0);
    const updated = {
      rate24kPerTola: r24,
      rate22kPerTola: Math.round(r24 * (22 / 24)),
      rate21kPerTola: Math.round(r24 * (21 / 24)),
      rate18kPerTola: Math.round(r24 * (18 / 24)),
      lastUpdated: new Date().toISOString()
    };
    setRates(updated);
    localStorage.setItem('nexcart_gold_rates', JSON.stringify(updated));
  };

  // 1 Tola = 11.664 Grams
  const currentTolaRate = calcKarat === '24K' ? rates.rate24kPerTola :
                          calcKarat === '22K' ? rates.rate22kPerTola :
                          calcKarat === '21K' ? rates.rate21kPerTola : rates.rate18kPerTola;

  const currentGramRate = currentTolaRate / 11.664;
  const weightGrams = Number(calcWeightGram || 0);
  const rawGoldCost = weightGrams * currentGramRate;
  const totalMakingCost = weightGrams * Number(makingChargesPerGram || 0);
  const totalStoneCost = Number(stoneCharges || 0);
  const estimatedJewelryTotal = rawGoldCost + totalMakingCost + totalStoneCost;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-wide flex items-center gap-2">
            <Gem className="w-7 h-7 text-amber-400" />
            <span>Jewelry Gold Rate & Weight Valuation Calculator</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live gold rate per Tola/Gram calculator with 24K, 22K, 21K, 18K purity and making charges (Kharad).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            Last Updated: <strong className="text-amber-400">{new Date(rates.lastUpdated).toLocaleTimeString()}</strong>
          </div>
        </div>
      </div>

      {/* Gold Rates Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 space-y-2">
          <div className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">24K Pure Gold (Per Tola)</div>
          <div className="font-heading font-extrabold text-2xl text-white">
            {store?.currencySymbol}{rates.rate24kPerTola.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {store?.currencySymbol}{(rates.rate24kPerTola / 11.664).toFixed(2)} / gram
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">22K Gold (Per Tola)</div>
          <div className="font-heading font-extrabold text-2xl text-amber-300">
            {store?.currencySymbol}{rates.rate22kPerTola.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {store?.currencySymbol}{(rates.rate22kPerTola / 11.664).toFixed(2)} / gram
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">21K Gold (Per Tola)</div>
          <div className="font-heading font-extrabold text-2xl text-amber-300">
            {store?.currencySymbol}{rates.rate21kPerTola.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {store?.currencySymbol}{(rates.rate21kPerTola / 11.664).toFixed(2)} / gram
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">18K Gold (Per Tola)</div>
          <div className="font-heading font-extrabold text-2xl text-amber-300">
            {store?.currencySymbol}{rates.rate18kPerTola.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {store?.currencySymbol}{(rates.rate18kPerTola / 11.664).toFixed(2)} / gram
          </div>
        </div>
      </div>

      {/* Main Grid: Rate Updater & Valuation Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Set Market Rate */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Today's Market Rate Settings</span>
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Set 24K Rate per Tola ({store?.currencySymbol})</label>
            <input
              type="number"
              value={editRate24k}
              onChange={(e) => setEditRate24k(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-amber-400 font-mono focus:outline-none"
            />
          </div>

          <button
            onClick={() => update24kRate(editRate24k)}
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs text-white shadow-lg"
          >
            Update All Karat Rates
          </button>
        </div>

        {/* Right 2 Cols: Item Valuation Calculator */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Calculator className="w-4 h-4 text-sky-400" />
            <span>Live Ornaments Valuation Estimator</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Karat Purity</label>
              <select
                value={calcKarat}
                onChange={(e) => setCalcKarat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
              >
                <option value="24K">24K (99.9% Pure)</option>
                <option value="22K">22K (91.6% Gold)</option>
                <option value="21K">21K (87.5% Gold)</option>
                <option value="18K">18K (75.0% Gold)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Weight in Grams (1 Tola = 11.664g)</label>
              <input
                type="number"
                step="0.001"
                value={calcWeightGram}
                onChange={(e) => setCalcWeightGram(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Making Charges (Kharad) per Gram ({store?.currencySymbol})</label>
              <input
                type="number"
                value={makingChargesPerGram}
                onChange={(e) => setMakingChargesPerGram(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Stone & Pearl Charges ({store?.currencySymbol})</label>
              <input
                type="number"
                value={stoneCharges}
                onChange={(e) => setStoneCharges(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="flex justify-between"><span>Gold Weight Tola Equiv:</span><span className="font-mono">{(weightGrams / 11.664).toFixed(3)} Tola</span></div>
            <div className="flex justify-between"><span>Net Gold Metal Cost:</span><span className="font-mono">{store?.currencySymbol}{rawGoldCost.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Total Making Charges:</span><span className="font-mono">{store?.currencySymbol}{totalMakingCost.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Stone & Crafting Fees:</span><span className="font-mono">{store?.currencySymbol}{totalStoneCost.toFixed(2)}</span></div>

            <div className="flex justify-between text-base font-extrabold text-amber-400 pt-2 border-t border-slate-800">
              <span>ESTIMATED JEWELRY PRICE:</span>
              <span className="font-mono">{store?.currencySymbol}{estimatedJewelryTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
