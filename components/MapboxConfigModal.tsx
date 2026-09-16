'use client';

import React, { useState } from 'react';
import { useParkingStore } from '@/lib/store';
import { Key, Check, X, Shield, ExternalLink, Sparkles, Layers } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MapboxConfigModal({ isOpen, onClose }: Props) {
  const mapboxToken = useParkingStore((s) => s.mapboxToken);
  const setMapboxToken = useParkingStore((s) => s.setMapboxToken);

  const [inputToken, setInputToken] = useState(
    mapboxToken ||
    (typeof window !== 'undefined' ? localStorage.getItem('park_ryze_mapbox_token') || '' : '') ||
    'G6nQ7QJ4pu2tz9txZigU'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMapboxToken(inputToken.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const isMapbox = inputToken.trim().startsWith('pk.');
  const isMapTiler = !isMapbox && inputToken.trim().length > 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-md bg-[#121622] border border-white/10 rounded-2xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 text-on-surface">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                Map API Credentials
              </h3>
              <p className="text-xs text-on-surface-variant font-sans">
                Active MapTiler / Mapbox GL Engine
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Provider Status Badge */}
        <div className="mb-4 p-3 rounded-xl bg-[#0c1017] border border-emerald-500/30 flex items-center gap-2.5 text-xs font-mono text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            {isMapbox
              ? 'Mapbox Vector Dark Active'
              : isMapTiler
              ? 'MapTiler Streets-v2 Dark Active (Zero Watermarks)'
              : 'Vector Maps Ready'}
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-1.5">
              API Key or Token
            </label>
            <input
              type="text"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder="Paste MapTiler Key or Mapbox Token..."
              className="w-full bg-[#0a0e16] border border-[#2B313E] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-slate-600 focus:border-emerald-500 outline-none transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Auto-detects MapTiler keys (like <code className="text-emerald-400">G6nQ...ZigU</code>) or Mapbox tokens (<code className="text-sky-400">pk.eyJ...</code>). Zero watermarks and full Mumbai streets resolution!
            </p>
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Map credentials updated & applied!</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-on-surface-variant text-xs font-mono transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading text-xs font-bold transition-all shadow-sm"
            >
              Apply Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
