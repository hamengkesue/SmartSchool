"use client";

import React, { useState, useMemo } from "react";
import { SppSummaryData } from "@/types/spp.types"; // Pastikan path ini sesuai
import { formatRupiah } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  FileSpreadsheet,
  Printer,
  Search,
  Users,
  AlertOctagon,
  Copy,
  Check,
  FileText,
  Eye,
  Download,
  Loader2
} from "lucide-react";

interface SppArrearsTableProps {
  data: SppSummaryData;
  onExportPdf?: () => Promise<void> | void; // Disesuaikan agar mendukung fungsi async
  isExporting?: boolean; // Prop baru untuk status loading
  downloadUrl?: string | null; // Prop baru untuk menerima link PDF dari backend
}

export function SppArrearsTable({ 
  data, 
  onExportPdf, 
  isExporting = false, 
  downloadUrl = null 
}: SppArrearsTableProps) {
  const [selectedKelas, setSelectedKelas] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedNisn, setCopiedNisn] = useState<string | null>(null);

  const uniqueClasses = useMemo(() => {
    const set = new Set(data.records.map((r) => r.kelas));
    return Array.from(set);
  }, [data.records]);

  const filteredRecords = useMemo(() => {
    return data.records.filter((record) => {
      const matchKelas = selectedKelas === "ALL" || record.kelas === selectedKelas;
      const matchSearch =
        searchQuery === "" ||
        record.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.nisn.includes(searchQuery);
      return matchKelas && matchSearch;
    });
  }, [data.records, selectedKelas, searchQuery]);

  const filteredSubtotal = useMemo(() => {
    return filteredRecords.reduce((sum, item) => sum + item.nominalTagihan, 0);
  }, [filteredRecords]);

  const handleCopyNisn = (nisn: string) => {
    navigator.clipboard.writeText(nisn);
    setCopiedNisn(nisn);
    setTimeout(() => setCopiedNisn(null), 2000);
  };

  return (
    <div className="my-3.5 space-y-3.5 animate-in fade-in duration-200">
      {/* 1. Executive Summary Cards (Ringkasan Eksekutif) - TETAP SAMA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* ... (Kode Card Users, AlertOctagon, FileSpreadsheet tidak ada perubahan) ... */}
        <div className="p-3.5 rounded-xl bg-white border border-rose-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Siswa Menunggak</div>
            <div className="text-lg font-black text-rose-600">{data.totalSiswaMenunggak} Siswa</div>
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Akumulasi Tunggakan</div>
            <div className="text-lg font-black text-slate-900">{formatRupiah(data.totalNominal)}</div>
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#0D9488] flex items-center justify-center shrink-0 border border-teal-100">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Periode Data Aktif</div>
            <div className="text-sm font-bold text-slate-800">{data.periodeAktif}</div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Filter & Export Bar */}
      <div className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama atau NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D9488] focus:bg-white text-slate-800 placeholder-slate-400"
            />
          </div>
          <div className="relative shrink-0">
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="py-1.5 pl-2.5 pr-7 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D9488] text-slate-700 font-medium cursor-pointer"
            >
              <option value="ALL">Semua Kelas</option>
              {uniqueClasses.map((kls) => (
                <option key={kls} value={kls}>Kelas {kls}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tombol dengan Status Loading */}
        {onExportPdf && (
          <Button
            type="button"
            variant="teal"
            size="sm"
            disabled={isExporting}
            onClick={onExportPdf}
            className="text-xs font-semibold shrink-0 disabled:opacity-70"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <Printer className="w-3.5 h-3.5 mr-1.5" />
            )}
            {isExporting ? "Menyiapkan PDF..." : "Cetak Tabel ke PDF"}
          </Button>
        )}
      </div>

      {/* 3. The Interactive Data Table - TETAP SAMA */}
      <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-2xs">
        {/* ... (Isi tabel tidak ada yang perlu diubah) ... */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3">NISN</th>
                <th className="py-2.5 px-3">Nama Siswa</th>
                <th className="py-2.5 px-3">Kelas</th>
                <th className="py-2.5 px-3">Periode Bulan</th>
                <th className="py-2.5 px-3 text-right">Nominal Tagihan</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.nisn} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-center font-medium text-slate-400">{record.no}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-600">{record.nisn}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{record.nama}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">{record.kelas}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">{record.periodeBulan}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatRupiah(record.nominalTagihan)}</td>
                    <td className="py-2.5 px-3 text-center"><Badge variant="danger" size="sm">{record.status}</Badge></td>
                    <td className="py-2.5 px-3 text-center">
                      <button onClick={() => handleCopyNisn(record.nisn)} className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
                        {copiedNisn === record.nisn ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400 italic">Tidak ditemukan data siswa yang cocok dengan filter.</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-800">
                <td colSpan={5} className="py-2.5 px-3 text-right">Subtotal Tagihan Terpilih:</td>
                <td className="py-2.5 px-3 text-right text-rose-600 font-mono text-sm">{formatRupiah(filteredSubtotal)}</td>
                <td colSpan={2} className="py-2.5 px-3 text-center text-xs text-slate-500 font-normal">{filteredRecords.length} Siswa</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 4. PENAMBAHAN BARU: Download Card (Tampil jika downloadUrl tersedia) */}
      {downloadUrl && (
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-bold text-slate-900">Laporan Resmi Rekapitulasi Tunggakan SPP</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 tracking-wider">PDF DOKUMEN</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Dokumen resmi ber-kop surat sekolah • Terverifikasi</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Tombol Pratinjau (Membuka di tab baru) */}
            <button
              onClick={() => window.open(downloadUrl, "_blank")}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Eye className="w-4 h-4" /> Pratinjau
            </button>
            
            {/* Tombol Unduh (Menggunakan Tag <a> sesuai perbaikan sebelumnya) */}
            <a
              href={`${downloadUrl}?ngrok-skip-browser-warning=true`}
              download="Laporan_Tunggakan_SPP.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Unduh PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}