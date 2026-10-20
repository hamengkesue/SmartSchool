# 📘 Panduan Menjalankan Frontend – SmartSchool AI

Selamat datang di repositori bersama **SmartSchool AI – Sistem Chatbot Layanan Akademik & Keuangan Sekolah**. Dokumen ini berisi petunjuk lengkap untuk menginstal, mengonfigurasi, dan menjalankan aplikasi **Frontend (Next.js)** secara lokal maupun untuk keperluan *deployment* ke Shared Hosting.

---

## 📂 Struktur Repositori Bersama

```text
smartschool-ai-project/                 <-- ROOT REPOSITORY
│
├── frontend/                           <-- 🟢 WILAYAH KERJA FRONTEND (Next.js App Router)
│   ├── public/                         # Logo sekolah dan aset statis
│   ├── src/
│   │   ├── app/                        # Halaman aplikasi (Chat, Admin Knowledge Base, Login)
│   │   ├── components/                 # Komponen UI modular (Chat, Voice, PDF, Layout)
│   │   ├── hooks/                      # Custom hooks (Session, Voice, Upload PDF)
│   │   ├── services/                   # Layer pemanggilan API ke FastAPI & n8n via Ngrok
│   │   ├── types/                      # Kontrak TypeScript (sinkron dengan Pydantic Backend)
│   │   └── mocks/                      # Data simulasi cerdas (untuk demo offline)
│   ├── .env.local                      # Konfigurasi URL Ngrok & Toggle Demo
│   ├── next.config.mjs                 # Konfigurasi static export & unoptimized images
│   ├── package.json                    # Dependensi & skrip Next.js
│   └── tsconfig.json                   # Konfigurasi TypeScript & path alias @/*
│
├── backend/                            <-- 🔵 WILAYAH KERJA BACKEND (FastAPI, Python, n8n)
│   ├── app/
│   │   ├── main.py                     # Entry point FastAPI & CORS
│   │   └── schemas/chat_schema.py      # Kontrak Pydantic (sinkron 1:1 dengan frontend/src/types)
│   ├── requirements.txt
│   └── .env.example
│
└── docs/
    └── readme.md                       <-- File panduan ini
```

---

## ⚙️ 1. Prasyarat Sistem

Sebelum memulai, pastikan perangkat Anda telah terinstal:
- **Node.js:** Versi `18.x`, `20.x`, atau `22.x+` (Direkomendasikan Node LTS)
- **NPM:** Versi `9.x` ke atas
- Peramban web modern (*Google Chrome, Microsoft Edge, atau Mozilla Firefox*)

Periksa versi Node.js dan NPM Anda di terminal:
```bash
node -v
npm -v
```

---

## 🚀 2. Langkah-Langkah Menjalankan Frontend

### Langkah 1: Buka Terminal dan Masuk ke Direktori `frontend`
Buka terminal (Command Prompt / PowerShell / Git Bash) di folder project, lalu arahkan ke folder `frontend`:
```bash
cd frontend
```

### Langkah 2: Instal Seluruh Dependensi Proyek
Jalankan perintah berikut untuk menginstal seluruh pustaka yang dibutuhkan:
```bash
npm install
```
*(Paket utama mencakup Next.js 16, React 19, Tailwind CSS v4, Lucide React, clsx, dan canvas-confetti)*.

### Langkah 3: Konfigurasi File Environment (`.env.local`)
Pastikan file `.env.local` telah tersedia di dalam folder `frontend/`. 

```env
# Backend Services (FastAPI via Ngrok Tunnel dari Komputer Teman)
NEXT_PUBLIC_FASTAPI_URL=https://smartschool-api.ngrok-free.app

# Workflow Automation (n8n Webhook via Ngrok Tunnel)
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://smartschool-n8n.ngrok-free.app/webhook/chat

# Mode Simulasi / Demo Mode (Set "true" agar UI tetap dapat mendemokan 5 fitur saat Ngrok offline)
NEXT_PUBLIC_USE_MOCK_FALLBACK=true

# Metadata Aplikasi
NEXT_PUBLIC_APP_NAME="SmartSchool AI"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

> 💡 **Tips Pengujian:**
> Jika teman backend Anda belum menyalakan Ngrok tunnel, Anda **tetap dapat mendemokan 100% fitur** secara lancar karena frontend dilengkapi *Intelligent Mock Fallback*.

### Langkah 4: Jalankan Server Pengembang (Development Server)
Jalankan perintah berikut:
```bash
npm run dev
```

Tunggu hingga muncul pesan:
```text
▲ Next.js (Turbopack)
- Local:   http://localhost:3000
✓ Ready in ...ms
```

### Langkah 5: Buka Aplikasi di Browser
Buka peramban web dan akses URL:
```text
http://localhost:3000
```

---

## 🧪 3. Panduan Menguji 5 Kapabilitas Utama di Ruang Chat

### Fitur #1: Membaca PDF (PDF Ingestion & Parsing)
1. Di bagian bawah input bar, klik ikon **Klip Kertas (Paperclip)**.
2. Pilih file berekstensi `.pdf` (maksimal 20 MB).
3. Chip preview `PdfUploadChip` akan muncul melayang di atas kolom input dengan indikator progres unggah.
4. Ketik pertanyaan seperti *"Tolong rangkum isi dokumen ini"* lalu tekan **Enter**.
5. AI akan membaca dan mengekstrak poin penting berkas tersebut.

### Fitur #2: Memberikan Format PDF (Dynamic PDF Generation)
1. Tanyakan kepada AI: *"Buatkan rekap laporan dalam format dokumen PDF"* atau klik tombol **"Cetak Tabel ke PDF"** pada tabel SPP.
2. AI akan menghasilkan kartu **`PdfDownloadCard`** ber-kop sekolah.
3. Klik tombol **"Lihat Pratinjau"** untuk melihat kop surat dan stempel digital sekolah, atau klik **"Unduh PDF"** untuk mengunduh langsung ke komputer Anda.

### Fitur #3: Voice Recognition (Perintah Suara Bahasa Indonesia)
1. Klik tombol **Mikrofon (Mic)** di sebelah kanan kolom input.
2. Bar input akan bertransformasi menjadi **`VoiceWaveformBar`** dengan animasi gelombang suara dan penghitung waktu rekaman.
3. Bicaralah dalam Bahasa Indonesia (contoh: *"Siapa saja anak yang belum bayar SPP bulan ini?"*). Teks transkripsi akan tampil secara *real-time*.
4. Klik **"Selesai Bicara"** untuk memasukkan teks ke kolom chat, lalu kirim.

### Fitur #4: Penjelasan Akurat Berbasis RAG (Knowledge Base PPDB)
1. Klik kartu pintasan: **"Bagaimana alur & syarat pendaftaran siswa baru (PPDB)?"**.
2. AI memberikan langkah pendaftaran runtut berformat Markdown, kotak syarat berkas, serta **Citation Pill**:
   `📘 Sumber Resmi: Buku_Panduan_PPDB_2026.pdf (Halaman 4)`.
3. Klik badge sitasi tersebut untuk membuka **`PdfPreviewModal`** dengan kutipan yang otomatis di-*highlight*.

### Fitur #5: Membaca Database Sekolah & Role-Based Access Control (RBAC)
1. Buka dropdown **Role Switcher** di bagian bawah sidebar kiri.
2. Pilih peran **"Admin Keuangan & TU"**.
3. Tanyakan: *"Siapa saja siswa yang belum membayar SPP bulan ini?"*.
4. AI akan menampilkan **Kartu Ringkasan Eksekutif** (5 Siswa Menunggak, Total Rp 4.250.000) dan komponen tabel interaktif **`SppArrearsTable`** lengkap dengan badge merah **BELUM LUNAS**, nominal Rupiah (`Rp`), filter kelas, pencarian siswa, dan tombol **"Cetak Tabel ke PDF"**.

---

## 🛠️ 4. Halaman-Halaman Lain yang Tersedia

- **Ruang Chat AI:** `http://localhost:3000/`
- **Admin Knowledge Base (Upload PDF ke Qdrant Cloud via n8n):** `http://localhost:3000/admin/knowledge-base/`
  *(Dilengkapi area Drag & Drop file PDF, validasi ukuran 20MB, dan tabel jumlah chunk vektor Qdrant)*.
- **Portal Login & Simulasi Role:** `http://localhost:3000/login/`

---

## 📦 5. Panduan Build & Deploy ke Shared Hosting (cPanel / Apache)

Aplikasi ini telah dirancang kompatibel 100% dengan **Shared Hosting (Static HTML Export)**:

1. Di dalam folder `frontend`, jalankan proses build:
   ```bash
   npm run build
   ```
2. Hasil build akan teroptimasi bebas dari dependensi file system server Node.js.
3. Anda dapat mengunggah file hasil build ke folder `public_html` pada cPanel hosting Anda.

---

## 🤝 6. Alur Kolaborasi dengan Teman Backend (FastAPI / n8n)

1. **Header Bypass Ngrok:**
   Semua fungsi pemanggilan API pada `src/services/apiClient.ts` telah otomatis menyematkan header:
   ```json
   "ngrok-skip-browser-warning": "true"
   ```
   sehingga API tidak akan terblokir oleh halaman peringatan gratis Ngrok.
2. **Sinkronisasi Skema:**
   Jika teman Anda memperbarui struktur field JSON di FastAPI/Pydantic, cukup sesuaikan tipe TypeScript di `frontend/src/types/chat.types.ts` dan `api.types.ts`.
3. **Mengganti URL Ngrok:**
   Saat teman Anda me-restart Ngrok dan mendapatkan URL baru, perbarui nilai `NEXT_PUBLIC_FASTAPI_URL` di `frontend/.env.local` lalu restart dev server (`npm run dev`).
