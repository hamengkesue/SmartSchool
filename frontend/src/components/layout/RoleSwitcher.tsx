"use client";

import React, { useState, useRef, useEffect } from "react";
import { UserRole, RoleConfig } from "@/types/chat.types";
import { ShieldAlert, Users, GraduationCap, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
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
    accentBg: "bg-blue-50/50",
  },
  parent: {
    id: "parent",
    label: "Wali Murid Terdaftar",
    badgeLabel: "Wali Murid",
    description: "Cek rincian tagihan SPP dan riwayat akademik putra/putri sendiri.",
    avatarColor: "bg-indigo-600 text-white",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    borderColor: "border-indigo-200",
    accentBg: "bg-indigo-50/50",
  },
  admin: {
    id: "admin",
    label: "Admin Keuangan & TU",
    badgeLabel: "Admin TU",
    description: "Akses penuh query database SPP seluruh siswa & cetak rekapitulasi PDF.",
    avatarColor: "bg-[#0D9488] text-white",
    badgeColor: "bg-teal-50 text-teal-800 border-teal-200",
    borderColor: "border-teal-300",
    accentBg: "bg-teal-50/60",
  },
};

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentConfig = ROLE_CONFIGS[currentRole];

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
        return <ShieldAlert className="w-4 h-4 text-[#0D9488]" />;
      case "parent":
        return <Users className="w-4 h-4 text-indigo-600" />;
      case "guest":
      default:
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Card */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full text-left p-2.5 rounded-xl border bg-white shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-2.5",
          currentConfig.borderColor,
          currentConfig.accentBg
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs",
              currentConfig.avatarColor
            )}
          >
            {getRoleIcon(currentRole)}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Role Aktif (RBAC)
            </div>
            <div className="text-xs font-bold text-slate-800 truncate">
              {currentConfig.label}
            </div>
          </div>
        </div>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            Pilih Simulasi Hak Akses
          </div>

          <div className="space-y-1 mt-1">
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
                    "w-full text-left p-2 rounded-lg text-xs transition-all flex items-start gap-2.5",
                    isSelected
                      ? "bg-slate-100 font-semibold text-slate-900"
                      : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <div className="mt-0.5">{getRoleIcon(role)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-800">{cfg.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#0D9488]" />}
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
