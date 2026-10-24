========================================================================
             SMART SCHOOL AI - FITUR CHATBOT & REKAPITULASI SPP
========================================================================

Deskripsi Proyek:
Proyek ini merupakan modul AI Chatbot Asisten Akademik & SPP untuk web 
SmartSchool Academy. Sistem membaca data tunggakan SPP secara real-time 
dari database PostgreSQL, memproses pertanyaan menggunakan n8n AI Agent, 
serta mencetak Laporan Resmi Rekapitulasi SPP dalam format biner PDF.

Branch Aktif: fitur-n8n-webhook

------------------------------------------------------------------------
1. PRASYARAT SISTEM (PREREQUISITES)
------------------------------------------------------------------------
- Node.js v18+ & npm
- Python 3.10+ (atau Anaconda Environment)
- PostgreSQL Server 14+
- Docker Desktop (untuk menjalankan n8n Automation Engine)

------------------------------------------------------------------------
2. PERSIAPAN DATABASE (POSTGRESQL)
------------------------------------------------------------------------
1. Buat database baru bernama 'smartschool_db' di PostgreSQL lokal.
2. Impor file cadangan data ('smartschool_backup.sql') ke database:
   createdb -U postgres smartschool_db
   psql -U postgres -d smartschool_db -f smartschool_backup.sql

------------------------------------------------------------------------
3. SETUP BACKEND (FASTAPI)
------------------------------------------------------------------------
1. Masuk ke direktori backend:
   cd backend

2. Salin file lingkungan '.env.example' menjadi '.env':
   cp .env.example .env
   (Sesuaikan password PostgreSQL pada DB_PASSWORD di dalam .env)

3. Pasang seluruh pustaka dependensi Python:
   pip install -r requirements.txt

4. Jalankan server FastAPI Uvicorn:
   uvicorn main:app --reload --port 8000

* Endpoint Utama Backend:
  - POST /api/v1/spp                : Mengambil data tunggakan live dari DB
  - POST /api/v1/generate-spp-pdf   : Generate berkas PDF biner dinamis
  - GET  /api/v1/download-pdf/{id}  : Download berkas PDF biner hasil generate

------------------------------------------------------------------------
4. SETUP WORKFLOW CHATBOT (n8N)
------------------------------------------------------------------------
1. Jalankan n8n via Docker atau instance lokal (port default: 5678).
2. Impor file 'n8n-chatbot/workflow-spp.json' ke dalam n8n.
3. Konfigurasi kredensial API Key (OpenAI / Gemini) pada node AI Agent.
4. Pastikan URL pada Node HTTP Request mengarah ke backend FastAPI Docker:
   - Node SPP Data : http://host.docker.internal:8000/api/v1/spp
   - Node PDF Gen  : http://host.docker.internal:8000/api/v1/generate-spp-pdf
5. Aktifkan Workflow (Toggle 'Active' ON) dan salin Webhook URL.

------------------------------------------------------------------------
5. SETUP FRONTEND (NEXT.JS)
------------------------------------------------------------------------
1. Masuk ke direktori frontend:
   cd frontend

2. Salin file lingkungan '.env.example' menjadi '.env.local':
   cp .env.example .env.local
   (Pastikan NEXT_PUBLIC_N8N_WEBHOOK_URL sesuai dengan URL Webhook n8n Anda)

3. Pasang paket node_modules:
   npm install

4. Jalankan server pengembang Next.js:
   npm run dev

------------------------------------------------------------------------
6. PANDUAN PENGUJIAN FITUR (TESTING)
------------------------------------------------------------------------
1. Buka peramban di http://localhost:3000
2. MATIKAN tombol toggle "PAKAI MOCK" di bilah navigasi atas (TopNavbar) 
   agar aplikasi terhubung langsung ke Live Webhook n8n & FastAPI.
3. Kirim pesan di obrolan: "Siapa saja siswa yang belum membayar SPP bulan ini?"
4. AI akan merespons dengan Tabel Markdown siswa yang menunggak secara real-time.
5. Ketik "buatkan pdf nya" atau klik tombol pencetakan.
6. Kartu 'PdfDownloadCard' akan muncul. Klik "Unduh PDF" untuk mengunduh 
   berkas biner PDF resmi ber-kop surat sekolah.

========================================================================
Disusun oleh: Taufikurrahman (Fitur Chatbot & Backend PDF Generator)
========================================================================