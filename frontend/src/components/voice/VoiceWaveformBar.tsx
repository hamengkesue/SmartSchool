"use client";

import React from "react";
import { Mic, X, Check, Radio } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface VoiceWaveformBarProps {
  durationFormatted: string;
  transcript: string;
  audioLevels: number[];
  onCancel: () => void;
  onFinish: () => void;
}

export function VoiceWaveformBar({
  durationFormatted,
  transcript,
  audioLevels,
  onCancel,
  onFinish,
}: VoiceWaveformBarProps) {
  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-[#1B365D] to-slate-900 text-white rounded-2xl p-3.5 shadow-xl border border-slate-700/60 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Section: Recording Indicator & Audio Waveform */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          {/* Pulsing Mic Badge */}
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-rose-500 text-white shrink-0 shadow-lg shadow-rose-500/40">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                Merekam Suara
              </span>
              <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                {durationFormatted}
              </span>
            </div>

            {/* Dynamic Waveform Bars */}
            <div className="flex items-center gap-1 h-5 mt-1.5">
              {audioLevels.map((level, idx) => (
                <div
                  key={idx}
                  className="w-1.5 bg-[#0D9488] rounded-full transition-all duration-150 ease-in-out"
                  style={{
                    height: `${Math.max(15, Math.min(100, level))}%`,
                    backgroundColor: idx % 2 === 0 ? "#14B8A6" : "#2DD4BF",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center: Live Transcript Preview */}
        <div className="flex-1 w-full sm:mx-3 text-center sm:text-left bg-slate-800/60 rounded-xl px-3.5 py-2 border border-slate-700/50 min-h-[38px] flex items-center">
          {transcript ? (
            <p className="text-xs sm:text-sm text-slate-100 font-medium italic truncate">
              &ldquo;{transcript}&rdquo;
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Silakan bicara dalam Bahasa Indonesia (contoh: &ldquo;Siapa saja siswa yang belum bayar SPP?&rdquo;)...
            </p>
          )}
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-xs text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Batal
          </Button>

          <Button
            type="button"
            variant="teal"
            size="sm"
            onClick={onFinish}
            className="text-xs font-semibold shadow-md shadow-teal-700/30"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            Selesai Bicara
          </Button>
        </div>
      </div>
    </div>
  );
}
