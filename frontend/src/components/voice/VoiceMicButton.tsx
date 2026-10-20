"use client";

import React from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceMicButtonProps {
  isRecording: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function VoiceMicButton({ isRecording, onClick, disabled }: VoiceMicButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isRecording ? "Hentikan rekaman suara" : "Bicara dengan suara"}
      title={isRecording ? "Hentikan rekaman suara" : "Bicara menggunakan mikrofon (Bahasa Indonesia)"}
      className={cn(
        "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2",
        isRecording
          ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 ring-2 ring-rose-400 focus:ring-rose-500 animate-pulse"
          : "bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-[#0D9488] focus:ring-[#0D9488]",
        disabled && "opacity-40 pointer-events-none"
      )}
    >
      {isRecording ? (
        <>
          <span className="absolute -inset-1 rounded-xl bg-rose-400/40 animate-ping pointer-events-none" />
          <Mic className="w-5 h-5 relative z-10 animate-bounce" />
        </>
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </button>
  );
}
