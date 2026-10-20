export type SppStatus = 'BELUM LUNAS' | 'LUNAS' | 'MENUNGGU VERIFIKASI';

export interface SppStudentRecord {
  no: number;
  nisn: string;
  nama: string;
  kelas: string;
  periodeBulan: string;
  nominalTagihan: number;
  status: SppStatus;
  tenggatWaktu: string;
  nomorHpWali?: string;
}

export interface SppSummaryData {
  totalSiswaMenunggak: number;
  totalNominal: number;
  periodeAktif: string;
  tingkatKelas?: string;
  records: SppStudentRecord[];
}

export interface SppFilterOptions {
  kelas?: string;
  search?: string;
  status?: SppStatus | 'ALL';
}
