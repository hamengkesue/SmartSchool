"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole, ChatSession } from "@/types/chat.types";
import { RoleSwitcher } from "./RoleSwitcher";
import {
  MessageSquarePlus,
  MessageSquare,
  Database,
  FileText,
  Shield,
  ExternalLink,
  X,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  sessions?: ChatSession[];
  activeSessionId?: string;
  onSelectSession?: (sessionId: string) => void;
  onDeleteSession?: (sessionId: string) => void;
}

function formatSessionDate(dateStr?: string): string {
  if (!dateStr) return "Hari ini";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Hari ini";
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    if (isToday) {
      return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
    if (isYesterday) return "Kemarin";
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  } catch {
    return "Hari ini";
  }
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
  onDeleteSession,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Top Header: School Logo & Title */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/images/logo-sekolah.png"
              alt="Logo SmartSchool"
              className="w-10 h-10 object-contain drop-shadow-xs transition-transform group-hover:scale-105"
            />
            <div>
              <h1 className="text-sm font-black text-[#1B365D] tracking-tight leading-none">
                SmartSchool AI
              </h1>
              <p className="text-[11px] font-medium text-[#0D9488] mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Asisten Akademik & SPP
              </p>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
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
              onClose();
            }}
            className="w-full justify-center bg-[#1B365D] hover:bg-[#142846] text-white font-semibold py-2.5 shadow-sm hover:shadow"
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
              onClick={onClose}
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
              onClick={onClose}
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
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Riwayat Sesi
              </span>
              {sessions.length > 0 && (
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                  {sessions.length}
                </span>
              )}
            </div>

            <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
              {sessions.length > 0 ? (
                sessions.map((item) => {
                  const isActive = item.id === activeSessionId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectSession?.(item.id);
                        onClose();
                      }}
                      className={cn(
                        "w-full px-2.5 py-2 rounded-lg text-xs transition-all flex items-center justify-between group cursor-pointer",
                        isActive
                          ? "bg-teal-50 text-teal-900 font-semibold border border-teal-200/80 shadow-2xs"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 pr-1.5">
                        <MessageSquare
                          className={cn(
                            "w-3.5 h-3.5 shrink-0",
                            isActive ? "text-teal-600" : "text-slate-400"
                          )}
                        />
                        <span className="truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-slate-400 font-medium group-hover:hidden">
                          {formatSessionDate(item.updatedAt || item.createdAt)}
                        </span>
                        {onDeleteSession && (
                          <button
                            type="button"
                            title="Hapus percakapan ini"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession(item.id);
                            }}
                            className="hidden group-hover:flex p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-[11px]">Belum ada riwayat percakapan</p>
                </div>
              )}
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

        {/* Bottom Section: Role Switcher Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />
        </div>
      </aside>
    </>
  );
}
