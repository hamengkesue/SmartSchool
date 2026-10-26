"use client";

import React from "react";
import { UserRole } from "@/types/chat.types";
import { RoleSwitcher } from "./RoleSwitcher";
import { Menu, Activity, ShieldCheck, Sparkles, RefreshCw } from "lucide-react";

interface TopNavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isMockMode: boolean;
  onToggleMockMode: () => void;
  isBackendHealthy: boolean;
  onToggleSidebar?: () => void;
  onResetChat?: () => void;
  isSidebarOpen?: boolean;
}

export function TopNavbar({
  currentRole,
  onRoleChange,
  isMockMode,
  onToggleMockMode,
  isBackendHealthy,
  onToggleSidebar,
  onResetChat,
  isSidebarOpen,
}: TopNavbarProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Hamburger Toggle (Garis 3) & Brand / Breadcrumb */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Garis 3 (Hamburger Menu Button) - Available on all screens to toggle/pinggirkan sidebar */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle Menu Sidebar"
          title="Buka / Tutup Sidebar (Garis 3)"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Layanan Terpadu
            </span>
            <span className="text-slate-300">/</span>
          </div>
          <h2 className="text-xs sm:text-sm md:text-base font-bold text-[#1B365D] tracking-tight truncate">
            Ruang Percakapan Asisten AI
          </h2>
        </div>
      </div>

      {/* Right: Role Switcher (setara navigasi bar di kanan atas) & Backend / Mock Mode Status */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Role Switcher positioned at the top right setara dengan navigasi bar */}
        <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />

        {/* Backend / Mock Mode Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 p-1 px-2.5 rounded-full border border-slate-200 bg-slate-50 text-xs shadow-2xs">
          {isMockMode ? (
            <div className="flex items-center gap-1.5 text-amber-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[11px]">Mock Mode</span>
            </div>
          ) : isBackendHealthy ? (
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span className="text-[11px]">FastAPI Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-[11px]">Standby</span>
            </div>
          )}

          {/* Toggle Button for Mock vs Live */}
          <button
            type="button"
            onClick={onToggleMockMode}
            title={
              isMockMode
                ? "Beralih ke Live Backend FastAPI via Ngrok"
                : "Beralih ke Mock Mode (Demo mandiri)"
            }
            className="ml-1 text-[10px] font-bold uppercase tracking-wider text-[#0D9488] hover:text-[#0F766E] underline underline-offset-2 pl-1.5 border-l border-slate-200 cursor-pointer"
          >
            {isMockMode ? "Pakai Live" : "Pakai Mock"}
          </button>
        </div>

        {/* Quick Reset Chat Button */}
        {onResetChat && (
          <button
            type="button"
            onClick={onResetChat}
            title="Mulai percakapan baru"
            aria-label="Mulai percakapan baru"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
