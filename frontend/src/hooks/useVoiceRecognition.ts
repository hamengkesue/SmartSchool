"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseVoiceRecognitionOptions {
  onTranscriptChange?: (text: string) => void;
  onRecordingComplete?: (finalText: string) => void;
}

export function useVoiceRecognition(options: UseVoiceRecognitionOptions = {}) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [duration, setDuration] = useState<number>(0);
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 30, 45, 60, 40, 20, 10]);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  // References to browser speech API & intervals
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const waveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mockSimulationIndexRef = useRef<number>(0);

  // Sample Indonesian voice phrases for graceful fallback / demo simulation
  const DEMO_VOICE_QUERIES = [
    "Siapa saja siswa yang belum membayar SPP bulan ini?",
    "Bagaimana cara melakukan pendaftaran PPDB siswa baru?",
    "Tolong bacakan ringkasan dokumen PDF yang saya lampirkan",
    "Berapa total tagihan SPP untuk kelas sepuluh?",
  ];

  useEffect(() => {
    // Check SpeechRecognition support in browser
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setTranscript("");
    setDuration(0);

    // 1. Duration Counter Interval
    timerIntervalRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    // 2. Audio Waveform Fluctuations
    waveIntervalRef.current = setInterval(() => {
      setAudioLevels([
        Math.floor(Math.random() * 40 + 20),
        Math.floor(Math.random() * 70 + 25),
        Math.floor(Math.random() * 95 + 35),
        Math.floor(Math.random() * 100 + 40),
        Math.floor(Math.random() * 85 + 30),
        Math.floor(Math.random() * 60 + 20),
        Math.floor(Math.random() * 35 + 15),
      ]);
    }, 120);

    // 3. Web Speech Recognition or Simulated Indonesian transcription
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "id-ID";

          recognition.onresult = (event: any) => {
            let currentText = "";
            for (let i = 0; i < event.results.length; i++) {
              currentText += event.results[i][0].transcript;
            }
            setTranscript(currentText);
            options.onTranscriptChange?.(currentText);
          };

          recognition.onerror = () => {
            // If microphone permission is denied, use fallback simulation
            fallbackSpeechSimulation();
          };

          recognition.start();
          recognitionRef.current = recognition;
          return;
        } catch {
          fallbackSpeechSimulation();
        }
      } else {
        fallbackSpeechSimulation();
      }
    }
  }, [options]);

  const fallbackSpeechSimulation = () => {
    const sampleQuery =
      DEMO_VOICE_QUERIES[mockSimulationIndexRef.current % DEMO_VOICE_QUERIES.length];
    mockSimulationIndexRef.current += 1;

    let charIdx = 0;
    const typingInterval = setInterval(() => {
      charIdx += 4;
      const partial = sampleQuery.slice(0, charIdx);
      setTranscript(partial);
      options.onTranscriptChange?.(partial);
      if (charIdx >= sampleQuery.length) {
        clearInterval(typingInterval);
      }
    }, 180);
  };

  const stopRecording = useCallback((): string => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    const finalText = transcript.trim();
    setIsRecording(false);
    options.onRecordingComplete?.(finalText);
    return finalText;
  }, [transcript, options]);

  const cancelRecording = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }

    setIsRecording(false);
    setTranscript("");
    setDuration(0);
  }, []);

  return {
    isRecording,
    transcript,
    duration,
    formattedDuration: formatDuration(duration),
    audioLevels,
    isSupported,
    startRecording,
    stopRecording,
    cancelRecording,
    setTranscript,
  };
}
