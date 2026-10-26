"use client";

import React, { useState, useRef, useEffect } from "react";
import { UserRole, RoleConfig } from "@/types/chat.types";
import { ShieldAlert, Users, GraduationCap, ChevronDown, Check, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  className?: string;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  guest: {
    id: "guest",
    label: "Tamu Publik / Calon Wali",
    badgeLabel: "Publik / Tamu",
    description: "Akses informasi umum PPDB, brosur pendaftaran, dan panduan sekolah.",
    avatarColor: "bg-blue-600 text-white",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    borderColor: "border-blue-200",
    accentBg: "bg-blue-50/70",
  },
  parent: {
    id: "parent",
    label: "Wali Murid Terdaftar",
    badgeLabel: "Wali Murid",
    description: "Cek rincian tagihan SPP dan riwayat akademik putra/putri sendiri.",
    avatarColor: "bg-indigo-600 text-white",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    borderColor: "border-indigo-200",
    accentBg: "bg-indigo-50/70",
  },
  admin: {
    id: "admin",
    label: "Admin Keuangan & TU",
    badgeLabel: "Admin TU",
    description: "Akses penuh query database SPP seluruh siswa & cetak rekapitulasi PDF.",
    avatarColor: "bg-[#0D9488] text-white",
    badgeColor: "bg-teal-50 text-teal-800 border-teal-200",
    borderColor: "border-teal-300",
    accentBg: "bg-teal-50/70",
  },
};

export function RoleSwitcher({ currentRole, onRoleChange, className }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentConfig = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.guest;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0D9488]" />;
      case "parent":
        return <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />;
      case "guest":
      default:
        return <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />;
    }
  };

  const getRoleIconBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <ShieldAlert className="w-4 h-4 text-white" />;
      case "parent":
        return <Users className="w-4 h-4 text-white" />;
      case "guest":
      default:
        return <GraduationCap className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button in Navbar (setara dengan navigasi bar di kanan atas) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Beralih peran hak akses (RBAC)"
        className={cn(
          "flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border bg-white shadow-2xs hover:shadow-xs transition-all cursor-pointer focus:outline-hidden",
          currentConfig.borderColor,
          isOpen ? "ring-2 ring-[#0D9488]/30" : "hover:border-slate-300",
          className
        )}
      >
        <div
          className={cn(
            "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-2xs",
            currentConfig.avatarColor
          )}
        >
          {getRoleIconBadge(currentRole)}
        </div>

        <div className="flex items-center gap-1.5 text-left">
          <span className="hidden md:inline text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Peran:
          </span>
          <span className="text-xs font-bold text-slate-800">
            {currentConfig.badgeLabel}
          </span>
        </div>

        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu (pops downward from navbar) */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 p-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#0D9488]" />
              Ganti Simulasi Peran (RBAC)
            </span>
            <span className="text-[10px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
              Langsung Aktif
            </span>
          </div>

          <div className="space-y-1.5 mt-2">
            {(["guest", "parent", "admin"] as UserRole[]).map((role) => {
              const cfg = ROLE_CONFIGS[role];
              const isSelected = currentRole === role;

              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    onRoleChange(role);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 cursor-pointer border",
                    isSelected
                      ? "bg-teal-50/60 border-[#0D9488]/40 shadow-2xs font-semibold text-slate-900"
                      : "hover:bg-slate-50 border-transparent text-slate-700"
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-2xs",
                      cfg.avatarColor
                    )}
                  >
                    {getRoleIconBadge(role)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{cfg.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#0D9488] shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-snug line-clamp-2">
                      {cfg.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
