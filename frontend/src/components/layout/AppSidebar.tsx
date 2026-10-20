"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/types/chat.types";
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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
}

export function AppSidebar({
  currentRole,
  onRoleChange,
  isOpen,
  onClose,
  onNewChat,
}: AppSidebarProps) {
  const pathname = usePathname();

  const SAMPLE_HISTORY = [
    { id: "h1", title: "Syarat & Jadwal PPDB 2026", date: "Hari ini" },
    { id: "h2", title: "Cek Tunggakan SPP Kelas X", date: "Hari ini" },
    { id: "h3", title: "Ekstraksi PDF Berkas Syarat", date: "Kemarin" },
    { id: "h4", title: "Format Cetak Laporan Keuangan", date: "18 Okt" },
  ];

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
            </div>

            <div className="space-y-1">
              {SAMPLE_HISTORY.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center justify-between group"
                >
                  <span className="truncate flex-1 pr-2">{item.title}</span>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium group-hover:text-slate-600">
                    {item.date}
                  </span>
                </button>
              ))}
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
