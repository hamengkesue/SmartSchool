"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/types/chat.types";
import { HistorySession } from "@/hooks/useChatSession";
import {
  MessageSquarePlus,
  MessageSquare,
  Database,
  Shield,
  Sparkles,
  History,
  Clock,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isOpen: boolean;
  onClose: () => void;
  onToggle?: () => void;
  onNewChat: () => void;
  sessions?: HistorySession[];
  activeSessionId?: string;
  onSelectSession?: (sessionId: string) => void;
  onRestoreLastSession?: () => void;
}

export function AppSidebar({
  currentRole,
  onRoleChange,
  isOpen,
  onClose,
  onNewChat,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onRestoreLastSession,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container - Can be toggled / collapsed ("dipinggirkan") smoothly */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Top Header: Clean School Branding (Logo dihapus sesuai permintaan) & Collapse Button (Garis 3) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex flex-col group min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-black text-[#1B365D] tracking-tight leading-none group-hover:text-teal-700 transition-colors">
                SmartSchool AI
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-50 text-[#0D9488] border border-teal-200">
                v2.0
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#0D9488] shrink-0" />
              <span className="truncate">Asisten Akademik & SPP</span>
            </p>
          </Link>

          {/* Close button for mobile screen only (pada desktop hanya ada 1 hamburger di TopNavbar) */}
          <button
            type="button"
            onClick={onClose}
            title="Tutup Menu Sidebar"
            aria-label="Tutup Menu Sidebar"
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action: New Chat Button */}
        <div className="p-4">
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              onNewChat();
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                onClose();
              }
            }}
            className="w-full justify-center bg-[#1B365D] hover:bg-[#142846] text-white font-semibold py-2.5 shadow-sm hover:shadow cursor-pointer transition-all"
          >
            <MessageSquarePlus className="w-4 h-4 mr-2" />
            + Percakapan Baru
          </Button>
        </div>

        {/* Middle Navigation & Chat History */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
          {/* Main Navigation Links */}
          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 1024) {
                  onClose();
                }
              }}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors",
                pathname === "/"
                  ? "bg-[#1B365D]/10 text-[#1B365D]"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <MessageSquare className="w-4 h-4 text-[#0D9488]" />
              <span>Ruang Chat AI</span>
            </Link>

            {/* Admin Dedicated Link */}
            <Link
              href="/admin/knowledge-base"
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 1024) {
                  onClose();
                }
              }}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-teal-50 text-teal-800 border border-teal-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-[#0D9488]" />
                <span>Knowledge Base PDF</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#1B365D] text-white font-bold">
                Admin
              </span>
            </Link>
          </div>

          {/* Chat History Section */}
          <div>
            <div className="px-2 mb-2 flex items-center justify-between">
              {/* Clickable "Riwayat Sesi" button to return to the last opened conversation */}
              <button
                type="button"
                onClick={() => {
                  if (onRestoreLastSession) onRestoreLastSession();
                  if (typeof window !== "undefined" && window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                title="Klik untuk kembali ke riwayat terakhir yang sedang dibuka"
                className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-[#0D9488] uppercase tracking-wider transition-colors cursor-pointer group"
              >
                <History className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0D9488] transition-colors" />
                <span>Riwayat Sesi</span>
              </button>
              <span className="text-[10px] text-slate-400 font-medium">
                {sessions.length} riwayat
              </span>
            </div>

            {/* History Session Cards */}
            <div className="space-y-1">
              {sessions.map((item) => {
                const isActive = activeSessionId === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (onSelectSession) onSelectSession(item.id);
                      if (typeof window !== "undefined" && window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                    title={item.title}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between group cursor-pointer border",
                      isActive
                        ? "bg-teal-50/80 text-teal-900 border-teal-200/90 font-semibold shadow-2xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
                          isActive ? "bg-[#0D9488]" : "bg-slate-300 group-hover:bg-slate-400"
                        )}
                      />
                      <span className="truncate">{item.title}</span>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] shrink-0 font-medium",
                        isActive ? "text-teal-700" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    >
                      {item.date}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* School Quick Info Card */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
              <Shield className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>Sistem Terintegrasi</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              FastAPI, LangChain, n8n Automation, & Qdrant Cloud.
            </p>
          </div>
        </div>

        {/* Bottom Section: Footer Information (Role switcher dipindah ke navbar kanan atas) */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70 text-xs text-slate-500">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-700">Peran Pengguna (RBAC)</span>
            <span className="text-[#0D9488] font-medium flex items-center gap-0.5">
              Di Navbar Atas
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 leading-snug">
            Ganti peran hak akses kapan saja melalui menu di sudut kanan atas navbar.
          </p>
        </div>
      </aside>
    </>
  );
}
