'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useParkingStore } from '@/lib/store';
import { ShieldCheck, Ticket, User, ArrowRightLeft, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isHostPage = pathname.startsWith('/host');
  const activePass = useParkingStore((s) => s.activePass);
  const openPassModal = useParkingStore((s) => s.openPassModal);
  const themeMode = useParkingStore((s) => s.themeMode);
  const toggleThemeMode = useParkingStore((s) => s.toggleThemeMode);

  return (
    <header className="fixed top-3 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl rounded-full bg-[#0f131c]/80 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.6)] flex justify-between items-center px-4 md:px-7 py-2.5 z-40">
      {/* Brand & Minimal Geometric Badge */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
          <div className="w-4 h-4 rounded-sm border-2 border-slate-950 flex items-center justify-center font-mono text-[10px] font-black text-slate-950">
            P
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-heading text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Park Ryze
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wider">
              Mumbai
            </span>
          </span>
        </div>
      </Link>

      {/* Center Nav Links - Desktop */}
      <nav className="hidden md:flex items-center gap-1 bg-surface-container/60 p-1 rounded-full border border-white/5">
        <Link
          href="/customer"
          className={`px-4 py-1.5 rounded-full text-xs font-medium font-heading transition-all ${
            !isHostPage
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-on-surface-variant hover:text-white'
          }`}
        >
          Customer View
        </Link>
        <Link
          href="/host"
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium font-heading transition-all ${
            isHostPage
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-on-surface-variant hover:text-white'
          }`}
        >
          <span>Host Panel</span>
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
            Admin
          </span>
        </Link>
      </nav>

      {/* Trailing Controls & Mode Switcher */}
      <div className="flex items-center gap-2.5">
        {/* Active Pass Quick Pill */}
        {activePass && (
          <button
            onClick={openPassModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25 transition-all text-xs font-mono font-medium shadow-xs"
            title="View Active Gate Pass"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Active Pass ({activePass.bayId})</span>
            <span className="sm:hidden">{activePass.bayId}</span>
          </button>
        )}

        {/* Switch Mode Button */}
        <Link
          href={isHostPage ? '/customer' : '/host'}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-heading font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-sm active:scale-95"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {isHostPage ? 'Switch to Customer' : 'Switch to Host Admin'}
          </span>
          <span className="sm:hidden">{isHostPage ? 'Customer' : 'Host'}</span>
        </Link>

        {/* Stitch MCP Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleThemeMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-surface-container dark:hover:bg-surface-container-high border border-slate-200 dark:border-white/10 text-slate-700 dark:text-on-surface transition-all duration-300 text-xs font-mono font-semibold"
          title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {themeMode === 'dark' ? (
            <>
              <Moon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Light</span>
            </>
          )}
        </button>

        {/* User Profile Chip */}
        <div className="w-8 h-8 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-white transition-colors cursor-pointer">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
