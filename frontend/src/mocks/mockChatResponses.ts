import { ApiChatResponse, KnowledgeDocument } from "../types/api.types";
import { SppSummaryData } from "../types/spp.types";
import { UserRole } from "../types/chat.types";

export const MOCK_SPP_SUMMARY: SppSummaryData = {
  totalSiswaMenunggak: 5,
  totalNominal: 4250000,
  periodeAktif: "Oktober 2026",
  tingkatKelas: "Semua Tingkat (Kelas X, XI, XII)",
  records: [
    {
      no: 1,
      nisn: "0078129301",
      nama: "Ahmad Rizky Pratama",
      kelas: "X MIPA 1",
      periodeBulan: "September - Oktober 2026",
      nominalTagihan: 850000,
      status: "BELUM LUNAS",
      tenggatWaktu: "10 Okt 2026",
      nomorHpWali: "0812-3456-7890",
    },
    {
      no: 2,
      nisn: "0079348122",
      nama: "Bunga Citra Lestari",
      kelas: "X IPS 2",
      periodeBulan: "Oktober 2026",
      nominalTagihan: 450000,
      status: "BELUM LUNAS",
      tenggatWaktu: "10 Okt 2026",
      nomorHpWali: "0813-9876-5432",
    },
    {
      no: 3,
      nisn: "0067123904",
      nama: "Dimas Aditya Nugraha",
      kelas: "XI MIPA 3",
      periodeBulan: "Agustus - Oktober 2026",
      nominalTagihan: 1350000,
      status: "BELUM LUNAS",
      tenggatWaktu: "10 Okt 2026",
      nomorHpWali: "0852-1122-3344",
    },
    {
      no: 4,
      nisn: "0068940125",
      nama: "Fitria Nur Azzahra",
      kelas: "XI IPS 1",
      periodeBulan: "Oktober 2026",
      nominalTagihan: 450000,
      status: "BELUM LUNAS",
      tenggatWaktu: "10 Okt 2026",
      nomorHpWali: "0878-5566-7788",
    },
    {
      no: 5,
      nisn: "0059128371",
      nama: "Muhammad Kevin Al-Farabi",
      kelas: "XII MIPA 2",
      periodeBulan: "September - Oktober 2026",
      nominalTagihan: 1150000,
      status: "BELUM LUNAS",
      tenggatWaktu: "10 Okt 2026",
      nomorHpWali: "0811-2233-4455",
    },
  ],
};

export const MOCK_KNOWLEDGE_DOCS: KnowledgeDocument[] = [
  {
    id: "doc-ppdb-2026",
    filename: "Buku_Panduan_PPDB_2026.pdf",
    title: "Buku Pedoman Penerimaan Peserta Didik Baru (PPDB) T.A 2026/2027",
    category: "ppdb",
    fileSizeBytes: 2450000,
    totalPages: 28,
    uploadedAt: "12 Okt 2026",
    status: "terindeks",
    qdrantPointsCount: 142,
    description: "Pedoman resmi jalur zonasi, prestasi, afirmasi, jadwal tes, dan syarat berkas pendaftaran.",
  },
  {
    id: "doc-spp-keuangan-2026",
    filename: "SK_Tarif_SPP_dan_Ketentuan_Keuangan_2026.pdf",
    title: "Surat Keputusan Kepala Sekolah tentang Tarif SPP & Beasiswa 2026",
    category: "keuangan",
    fileSizeBytes: 1820000,
    totalPages: 16,
    uploadedAt: "01 Okt 2026",
    status: "terindeks",
    qdrantPointsCount: 96,
    description: "Struktur biaya pendidikan per jenjang, mekanisme dispensasi cicilan, dan beasiswa prestasi.",
  },
  {
    id: "doc-tata-tertib-2026",
    filename: "Buku_Saku_Tata_Tertib_Siswa_2026.pdf",
    title: "Buku Saku Tata Tertib & Kode Etik Siswa 2026",
    category: "tata_tertib",
    fileSizeBytes: 1250000,
    totalPages: 20,
    uploadedAt: "15 Sep 2026",
    status: "terindeks",
    qdrantPointsCount: 78,
    description: "Aturan seragam, absensi, poin pelanggaran, serta prosedur izin meninggalkan sekolah.",
  },
];

export function getMockResponse(
  message: string,
  role: UserRole,
  hasAttachment?: boolean,
  attachmentName?: string
): ApiChatResponse {
  const lowerMsg = message.toLowerCase();

  // CASE 1: Fitur #1 - Analisis File PDF yang Diunggah Pengguna
  if (hasAttachment || lowerMsg.includes("rangkum") || lowerMsg.includes("baca") && lowerMsg.includes("pdf")) {
    const fileName = attachmentName || "Dokumen_Lampiran.pdf";
    return {
      answer: `### 📄 Hasil Rangkuman & Ekstraksi Dokumen: \`${fileName}\`

Saya telah menganalisis dokumen yang Anda unggah secara menyeluruh melalui parser **FastAPI + LangChain**:

1. **Topik Utama:** Dokumen ini memuat regulasi administrasi dan kelengkapan berkas akademik untuk periode tahun ajaran 2026/2027.
2. **Poin-Poin Kunci:**
   - **Batas Waktu Penyerahan:** Berkas fisik wajib diserahkan ke sekretariat paling lambat **25 November 2026**.
   - **Kelengkapan Dokumen:** Fotokopi Akta Kelahiran (2 lembar legalisir), Kartu Keluarga, dan Surat Keterangan Lulus (SKL) asli.
   - **Ketentuan Format:** Berkas digital pendukung harus dipindai dalam resolusi minimal 300 DPI dan diunggah dalam format \`.pdf\`.
3. **Catatan Penting:** Terdapat stempel verifikasi pada halaman 3 yang menandakan dokumen telah memenuhi prasyarat verifikasi internal sekolah.`,
      type: "rag_explanation",
      citations: [
        {
          documentId: "upload-session-user",
          documentTitle: fileName,
          pageNumber: 2,
          snippet: "Seluruh berkas fisik harus diserahkan secara langsung ke panitia penerimaan...",
          url: "#preview-modal",
        },
      ],
      tokensUsed: { prompt: 820, completion: 245, total: 1065 },
      latencyMs: 780,
    };
  }

  // CASE 2: Fitur #5 - Query Database SPP (Role-Based Access)
  if (
    lowerMsg.includes("spp") ||
    lowerMsg.includes("tunggakan") ||
    lowerMsg.includes("belum bayar") ||
    lowerMsg.includes("bayar spp")
  ) {
    if (role === "admin") {
      return {
        answer: `Berikut adalah **Laporan Rekapitulasi Tunggakan SPP Siswa** yang ditarik langsung secara *real-time* dari Database Keuangan Sekolah per **Oktober 2026**. 

Tercatat ada **5 siswa** yang belum menyelesaikan pembayaran dengan akumulasi total tunggakan sebesar **Rp 4.250.000**. Silakan gunakan tabel di bawah untuk filter per kelas atau ekspor ke format PDF resmi.`,
        type: "spp_table",
        sppData: MOCK_SPP_SUMMARY,
        generatedPdf: {
          title: "Laporan Resmi Rekapitulasi Tunggakan SPP",
          filename: "Laporan_Tunggakan_SPP_Okt2026.pdf",
          description: "Dokumen resmi ber-kop surat sekolah lengkap dengan tanda tangan Kepala Bagian Keuangan dan tabel rincian per kelas.",
          downloadUrl: "#download-spp-pdf",
          size: "420 KB",
          createdAt: "20 Okt 2026, 14:30 WIB",
          pagesCount: 2,
          documentRefNumber: "421.3/KEU-SMART/X/2026",
        },
        tokensUsed: { prompt: 540, completion: 180, total: 720 },
        latencyMs: 620,
      };
    } else if (role === "parent") {
      return {
        answer: `### 💳 Informasi Tagihan SPP Ananda

Halo Bapak/Ibu Wali Murid dari **Ahmad Rizky Pratama** (Kelas X MIPA 1, NISN: \`0078129301\`):

- **Status Pembayaran:** <span class="text-rose-600 font-semibold">BELUM LUNAS</span>
- **Periode Menunggak:** September – Oktober 2026 (2 Bulan)
- **Total Tagihan:** **Rp 850.000**
- **Jatuh Tempo:** **10 Oktober 2026** *(Telah melewati batas tanggal)*

> 💡 **Panduan Pembayaran:** Pembayaran dapat dilakukan melalui *Virtual Account BNI / Mandiri* sekolah atau loket kasir TU sekolah setiap hari kerja pukul 07.30 - 15.00 WIB. Bukti transfer dapat otomatis terkonfirmasi dalam 10 menit.`,
        type: "text",
        generatedPdf: {
          title: "Invoice & Tagihan SPP Siswa",
          filename: "Invoice_SPP_Ahmad_Rizky_Okt2026.pdf",
          description: "Surat tagihan resmi beserta rincian nomor Virtual Account pembayaran sekolah.",
          downloadUrl: "#download-invoice-pdf",
          size: "285 KB",
          createdAt: "20 Okt 2026",
          pagesCount: 1,
        },
        tokensUsed: { prompt: 410, completion: 160, total: 570 },
        latencyMs: 510,
      };
    } else {
      // Role Guest / Publik
      return {
        answer: `🔒 **Akses Terbatas: Kebijakan Privasi Data Siswa**

Data rincian nama siswa dan riwayat pembayaran SPP bersifat rahasia dan hanya dapat diakses oleh:
1. **Admin TU / Bendahara Sekolah** (untuk melihat rekapitulasi seluruh siswa).
2. **Wali Murid Terdaftar** (hanya untuk melihat tagihan putra/putri yang bersangkutan).

Untuk keperluan demo atau simulasi, silakan gunakan **Role Switcher** di sidebar sebelah kiri dan pilih peran **Admin Keuangan / TU**.`,
        type: "text",
        tokensUsed: { prompt: 210, completion: 95, total: 305 },
        latencyMs: 320,
      };
    }
  }

  // CASE 3: Fitur #4 - Penjelasan Prosedur PPDB (RAG Knowledge Base)
  if (
    lowerMsg.includes("ppdb") ||
    lowerMsg.includes("daftar") ||
    lowerMsg.includes("syarat") ||
    lowerMsg.includes("pendaftaran")
  ) {
    return {
      answer: `### 🎓 Prosedur & Persyaratan Pendaftaran Peserta Didik Baru (PPDB) 2026/2027

Berdasarkan pedoman resmi penerimaan sekolah, berikut adalah tahapan pendaftaran yang wajib diikuti calon siswa:

#### 1. Tahapan Alur Pendaftaran
- **Pendaftaran Daring (Online):** Mengisi formulir biodata lengkap melalui portal resmi \`https://ppdb.smartschool.sch.id\` pada tanggal **02 – 18 Mei 2026**.
- **Unggah Dokumen Syarat:** Mengunggah pindaian (*scan*) dokumen asli ke sistem dalam format PDF.
- **Tes Pemetaan Akademik & Psikotes:** Dilaksanakan secara serentak di kampus sekolah pada tanggal **23 Mei 2026**.
- **Pengumuman Kelulusan:** Diumumkan secara transparan di website dan papan pengumuman sekolah pada **30 Mei 2026**.
- **Daftar Ulang:** Bagi calon siswa yang dinyatakan diterima wajib melakukan registrasi ulang paling lambat **05 Juni 2026**.

#### 2. Berkas Persyaratan Wajib (Checklist)
- Fotokopi Ijazah / Surat Keterangan Lulus (SKL) berlegalisir (2 lembar).
- Fotokopi Akta Kelahiran dan Kartu Keluarga (KK).
- Pas foto terbaru ukuran 3x4 berwarna dengan latar belakang merah (4 lembar).
- Surat Keterangan Berkelakuan Baik (SKBB) dari sekolah asal.
- Sertifikat/Piagam Prestasi Minimal Tingkat Kabupaten/Kota *(Khusus Jalur Prestasi)*.

> ℹ️ **Catatan Jalur Afirmasi:** Bagi pendaftar jalur afirmasi/KIP, wajib melampirkan fotokopi Kartu Indonesia Pintar atau surat keterangan tidak mampu dari kelurahan setempat.`,
      type: "rag_explanation",
      citations: [
        {
          documentId: "doc-ppdb-2026",
          documentTitle: "Buku_Panduan_PPDB_2026.pdf",
          pageNumber: 4,
          snippet: "Bab II: Persyaratan Administrasi dan Jadwal Pelaksanaan PPDB Terpadu Tahun Ajaran 2026/2027, halaman 4 pasal 3.",
          url: "#preview-modal",
          relevanceScore: 0.94,
        },
      ],
      generatedPdf: {
        title: "Brosur & Panduan Lengkap PPDB 2026",
        filename: "Panduan_Lengkap_PPDB_2026.pdf",
        description: "Buku panduan resmi PPDB format cetak ber-kop sekolah dilengkapi jadwal kalender akademik dan peta lokasi tes.",
        downloadUrl: "#download-ppdb-guide",
        size: "1.4 MB",
        createdAt: "20 Okt 2026",
        pagesCount: 6,
        documentRefNumber: "SMART/PPDB/BRO-2026",
      },
      tokensUsed: { prompt: 780, completion: 390, total: 1170 },
      latencyMs: 740,
    };
  }

  // CASE 4: Fitur #2 - Permintaan Khusus Cetak Dokumen / Format PDF
  if (
    lowerMsg.includes("cetak") ||
    lowerMsg.includes("download") ||
    lowerMsg.includes("unduh") ||
    lowerMsg.includes("format pdf") ||
    lowerMsg.includes("buatkan pdf")
  ) {
    return {
      answer: `### 📄 Dokumen PDF Siap Diunduh

Permintaan Anda untuk membuat dokumen PDF resmi telah selesai diproses oleh generator backend:

- Dokumen telah diberi format kop surat standar instansi sekolah.
- Dilengkapi dengan *QR Code* autentikasi dan nomor registrasi dokumen terverifikasi.
- Siap dicetak langsung atau disimpan ke perangkat Anda.`,
      type: "pdf_download",
      generatedPdf: {
        title: "Dokumen Resmi Informasi Sekolah & Regulasi Akademik",
        filename: "Dokumen_Resmi_SmartSchool_2026.pdf",
        description: "Salinan dokumen resmi ber-kop surat sekolah, dilengkapi tanda tangan elektronik dan verifikasi n8n.",
        downloadUrl: "#download-generated-pdf",
        size: "540 KB",
        createdAt: "20 Okt 2026, 15:10 WIB",
        pagesCount: 3,
        documentRefNumber: "800/TATA-USAHA/PDF/2026",
      },
      tokensUsed: { prompt: 350, completion: 120, total: 470 },
      latencyMs: 490,
    };
  }

  // DEFAULT CONVERSATIONAL RESPONSE
  return {
    answer: `Halo! Saya adalah **SmartSchool AI**, asisten cerdas layanan akademik dan administrasi sekolah.

Saya dapat membantu Anda dengan berbagai hal:
1. **Penerimaan Siswa Baru (PPDB):** Menjelaskan syarat, jadwal, dan alur pendaftaran berdasarkan buku panduan resmi.
2. **Pengecekan Tagihan & Status SPP:** Memeriksa data tunggakan secara real-time (*sesuai hak akses Anda*).
3. **Analisis Berkas PDF:** Anda dapat melampirkan berkas PDF untuk saya baca dan rangkum.
4. **Pencetakan Dokumen Resmi:** Mengekspor rangkuman atau laporan ke format PDF siap cetak.
5. **Perintah Suara:** Tekan ikon mikrofon untuk berbicara langsung dalam Bahasa Indonesia.

Apa yang ingin Anda tanyakan hari ini?`,
    type: "text",
    tokensUsed: { prompt: 190, completion: 130, total: 320 },
    latencyMs: 280,
  };
}
