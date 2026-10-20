"use client";

import React from "react";
import { UserRole } from "@/types/chat.types";
import { INITIAL_GUEST_PROMPTS } from "@/hooks/useChatSession";
import {
  GraduationCap,
  CreditCard,
  FileText,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyWelcomeScreenProps {
  currentRole: UserRole;
  onSelectPrompt: (promptText: string) => void;
}

export function EmptyWelcomeScreen({
  currentRole,
  onSelectPrompt,
}: EmptyWelcomeScreenProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "GraduationCap":
        return <GraduationCap className="w-5 h-5 text-blue-600" />;
      case "CreditCard":
        return <CreditCard className="w-5 h-5 text-teal-600" />;
      case "FileText":
        return <FileText className="w-5 h-5 text-purple-600" />;
      case "Printer":
      default:
        return <Printer className="w-5 h-5 text-amber-600" />;
    }
  };

  const getColorClasses = (colorScheme: string) => {
    switch (colorScheme) {
      case "blue":
        return {
          bg: "bg-blue-50/70 hover:bg-blue-50",
          border: "border-blue-200/80 hover:border-blue-300",
          badge: "bg-blue-100/80 text-blue-800",
        };
      case "teal":
        return {
          bg: "bg-teal-50/70 hover:bg-teal-50",
          border: "border-teal-200/80 hover:border-teal-300",
          badge: "bg-teal-100/80 text-teal-800",
        };
      case "purple":
        return {
          bg: "bg-purple-50/70 hover:bg-purple-50",
          border: "border-purple-200/80 hover:border-purple-300",
          badge: "bg-purple-100/80 text-purple-800",
        };
      case "amber":
      default:
        return {
          bg: "bg-amber-50/70 hover:bg-amber-50",
          border: "border-amber-200/80 hover:border-amber-300",
          badge: "bg-amber-100/80 text-amber-800",
        };
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 animate-in fade-in duration-300">
      {/* Welcome Hero Card */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0D9488] text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generative AI Terpadu Sekolah • RAG & SPP Database</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#1B365D] tracking-tight">
          Selamat Datang di <span className="text-[#0D9488]">SmartSchool AI</span>
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          Asisten pintar terintegrasi untuk konsultasi alur PPDB, pembacaan berkas PDF, pengecekan tagihan SPP, dan pencetakan dokumen resmi.
        </p>
      </div>

      {/* 4 Quick Action Cards */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pintasan Pertanyaan Cepat (Quick Prompts)
          </span>
          <span className="text-[11px] text-slate-400">Pilih salah satu untuk menguji coba</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {INITIAL_GUEST_PROMPTS.map((prompt) => {
            const colors = getColorClasses(prompt.colorScheme);
            const isRestrictedForRole =
              prompt.category === "spp" && currentRole === "guest";

            return (
              <button
                key={prompt.id}
                type="button"
                onClick={() => onSelectPrompt(prompt.prompt)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all duration-200 group flex flex-col justify-between shadow-2xs hover:shadow-md cursor-pointer",
                  colors.bg,
                  colors.border
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-white shadow-2xs flex items-center justify-center shrink-0">
                      {getIcon(prompt.iconName)}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                        colors.badge
                      )}
                    >
                      {prompt.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#1B365D] transition-colors">
                    {prompt.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    &ldquo;{prompt.prompt}&rdquo;
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px] font-medium text-slate-500 group-hover:text-[#0D9488]">
                  <span>{isRestrictedForRole ? "🔒 Memerlukan Role Admin" : "Klik untuk mencoba"}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Role Reminder Tip */}
      <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200/80 flex items-center gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-5 h-5 text-[#0D9488] shrink-0" />
        <p className="leading-snug">
          <strong>Tip Hak Akses (RBAC):</strong> Untuk menguji query data seluruh penunggak SPP, pastikan Anda telah beralih ke role <strong>Admin Keuangan / TU</strong> melalui dropdown di sidebar.
        </p>
      </div>
    </div>
  );
}
