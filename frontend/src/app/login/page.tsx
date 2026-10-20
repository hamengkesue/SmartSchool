"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/chat.types";
import { ROLE_CONFIGS } from "@/components/layout/RoleSwitcher";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  Users,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>("guest");

  const handleEnterApp = () => {
    // Navigate to chat space
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B365D] via-[#0F1E36] to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100/20 animate-in fade-in zoom-in-95 duration-200">
        {/* School Logo & Title */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 p-2 mx-auto mb-3 shadow-md">
            <img
              src="/images/logo-sekolah.png"
              alt="Logo Sekolah"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B365D] tracking-tight">
            SmartSchool AI Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sistem Chatbot Layanan Akademik & Keuangan Sekolah
          </p>
        </div>

        {/* Role Selector Cards */}
        <div className="space-y-3 mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Pilih Peran untuk Simulasi (RBAC):
          </label>

          {(["guest", "parent", "admin"] as UserRole[]).map((role) => {
            const config = ROLE_CONFIGS[role];
            const isSelected = selectedRole === role;

            return (
              <div
                key={role}
                onClick={() => setSelectedRole(role)}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5",
                  isSelected
                    ? "border-[#0D9488] bg-teal-50/50 shadow-sm ring-1 ring-[#0D9488]"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs",
                    config.avatarColor
                  )}
                >
                  {role === "admin" && <ShieldAlert className="w-5 h-5" />}
                  {role === "parent" && <Users className="w-5 h-5" />}
                  {role === "guest" && <GraduationCap className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">
                      {config.label}
                    </span>
                    {isSelected && (
                      <span className="text-[11px] font-bold text-[#0D9488] bg-teal-100/60 px-2 py-0.5 rounded-full">
                        Terpilih
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                    {config.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enter Button */}
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={handleEnterApp}
          className="w-full bg-[#1B365D] hover:bg-[#142846] text-white font-bold py-3 shadow-md"
        >
          <span>Masuk ke Ruang Chat AI</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        {/* Credentials / Sandbox Notice */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Mode Demo Terbuka • Tidak memerlukan password database</span>
          </p>
        </div>
      </div>
    </div>
  );
}
