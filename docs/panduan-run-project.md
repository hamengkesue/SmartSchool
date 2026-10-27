# 📘 Panduan Menjalankan Project SmartSchool AI

> Dokumen ini berisi langkah-langkah **lengkap** untuk menjalankan seluruh stack project
> SmartSchool AI di lingkungan pengembangan lokal (Windows).

---

## 📋 Daftar Isi

1. [Prasyarat Sistem](#1-prasyarat-sistem)
2. [Clone & Setup Repository](#2-clone--setup-repository)
3. [Setup Database PostgreSQL](#3-setup-database-postgresql)
4. [Setup & Jalankan n8n via Docker](#4-setup--jalankan-n8n-via-docker)
5. [Setup & Jalankan Backend (FastAPI)](#5-setup--jalankan-backend-fastapi)
6. [Setup & Jalankan Frontend (Next.js)](#6-setup--jalankan-frontend-nextjs)
7. [Pengujian & Verifikasi](#7-pengujian--verifikasi)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Prasyarat Sistem

Pastikan software berikut sudah terinstal di komputer Anda:

| Software            | Versi Minimum | Cara Cek                  | Link Download                                      |
| ------------------- | ------------- | ------------------------- | -------------------------------------------------- |
| **Node.js & npm**   | v18+          | `node -v` dan `npm -v`   | https://nodejs.org/                                |
| **Python**          | 3.10+         | `python --version`        | https://www.python.org/downloads/                  |
| **PostgreSQL**      | 14+           | `psql --version`          | https://www.postgresql.org/download/               |
| **Docker Desktop**  | Terbaru       | `docker --version`        | https://www.docker.com/products/docker-desktop/    |
| **Git**             | Terbaru       | `git --version`           | https://git-scm.com/downloads                      |

> **💡 Tips:** Jika menggunakan Laragon, PostgreSQL dan Node.js mungkin sudah terinstal.

---

## 2. Clone & Setup Repository

```powershell
# Clone repository
git clone https://github.com/hamengkesue/SmartSchool.git
cd SmartSchool

# Pindah ke branch yang diinginkan (contoh: dev)
git checkout dev
git pull origin dev
```

---

## 3. Setup Database PostgreSQL

### 3.1. Buat Database Baru

Buka terminal / PowerShell dan jalankan:

```powershell
# Buat database baru (gunakan password PostgreSQL Anda saat diminta)
createdb -U postgres smartschool_db
```

**Atau** melalui `psql`:

```powershell
psql -U postgres
```

```sql
CREATE DATABASE smartschool_db;
\q
```

### 3.2. Import Data dari Backup

```powershell
# Dari root directory project
psql -U postgres -d smartschool_db -f smartschool_backup.sql
```

### 3.3. Verifikasi Data

```powershell
psql -U postgres -d smartschool_db
```

```sql
-- Pastikan tabel sudah ada
\dt

-- Cek data SPP
SELECT COUNT(*) FROM data_spp;
\q
```

> ⚠️ **Penting:** Catat password PostgreSQL Anda. Default biasanya `postgres` atau
> password yang Anda set saat instalasi. Password ini akan digunakan di file `.env` backend.

---

## 4. Setup & Jalankan n8n via Docker

### 4.1. Pastikan Docker Desktop Berjalan

Buka Docker Desktop dan pastikan statusnya **Running** (ikon hijau di system tray).

### 4.2. Buat Docker Volume (Sekali Saja)

```powershell
docker volume create project-root_n8n_data
```

### 4.3. Jalankan n8n

```powershell
# Masuk ke direktori n8n-chatbot dan jalankan docker compose
cd n8n-chatbot
docker compose up -d
```

### 4.4. Verifikasi n8n Berjalan

```powershell
docker ps
```

Pastikan container `n8n` muncul dengan status **Up**. Akses n8n di browser:

```
http://localhost:5678
```

### 4.5. Import Workflow (Jika Ada)

1. Buka `http://localhost:5678` di browser
2. Buat akun/login jika pertama kali
3. Import file workflow dari `n8n-chatbot/` (jika tersedia file JSON workflow)
4. Konfigurasi kredensial API Key (OpenAI / Gemini) di node AI Agent
5. Pastikan URL HTTP Request mengarah ke:
   - **Node SPP Data**: `http://host.docker.internal:8000/api/v1/spp`
   - **Node PDF Gen**: `http://host.docker.internal:8000/api/v1/generate-spp-pdf`
6. Aktifkan workflow (toggle **Active** → ON)

### 4.6. Menghentikan n8n

```powershell
cd n8n-chatbot
docker compose down
```

---

## 5. Setup & Jalankan Backend (FastAPI)

### 5.1. Masuk ke Direktori Backend

```powershell
cd backend
```

### 5.2. Buat & Konfigurasi File `.env`

```powershell
# Salin template environment
copy .env.example .env
```

Buka file `backend/.env` dan isi dengan konfigurasi yang sesuai:

```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-isi-api-key-openai-anda
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Qdrant Cloud Vector Database
QDRANT_URL=https://your-cluster-id.aws.cloud.qdrant.io:6333
QDRANT_API_KEY=isi-qdrant-api-key-anda
QDRANT_COLLECTION_NAME=smartschool_knowledge_base

# Database (disesuaikan dengan konfigurasi PostgreSQL lokal Anda)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smartschool_db
DB_USER=postgres
DB_PASSWORD=password_postgresql_anda

# n8n Automation Webhook (opsional)
N8N_WEBHOOK_URL=http://localhost:5678/webhook/chat
```

> ⚠️ **Penting:** Jika Anda belum punya API Key OpenAI atau Qdrant, fitur AI Chat dan
> RAG Knowledge Base tidak akan berfungsi, tetapi backend tetap bisa dijalankan.

### 5.3. Install Dependensi Python

```powershell
# Dari direktori backend/
pip install -r requirements.txt
```

Selain itu, code terbaru juga membutuhkan pustaka tambahan berikut yang **belum tercantum**
di `requirements.txt`:

```powershell
pip install openai supabase fpdf2 pypdf
```

> 💡 Jika Anda menggunakan virtual environment (direkomendasikan):
>
> ```powershell
> python -m venv venv
> venv\Scripts\activate
> pip install -r requirements.txt
> pip install openai supabase fpdf2 pypdf
> ```

### 5.4. Jalankan Server FastAPI

> ⚠️ **PERHATIAN — Perintah di `Readme.txt` Salah!**
>
> Readme lama menulis perintah dijalankan dari folder `backend/`, tetapi semua import
> Python di `main.py` (seperti `from routers.xxx` dan `from services.xxx`) relatif
> terhadap folder `backend/app/`. Oleh karena itu, Anda **harus masuk ke folder
> `backend/app/`** terlebih dahulu:

```powershell
# Masuk ke direktori backend/app/ (BUKAN backend/)
cd backend/app

# Jalankan uvicorn
uvicorn main:app --reload --port 8000
```

Jika berhasil, Anda akan melihat output:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using StatReload
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 5.5. Verifikasi Backend

Buka browser dan akses:

| URL                                    | Expected Response                              |
| ------------------------------------ | ---------------------------------------------- |
| `http://127.0.0.1:8000/`            | `{"message": "Server SmartSchool Aktif"}`      |
| `http://127.0.0.1:8000/health`      | `{"status": "healthy", ...}`                   |
| `http://127.0.0.1:8000/docs`        | Swagger UI (dokumentasi API interaktif)         |

### 5.6. Endpoint API yang Tersedia

| Method | Endpoint                           | Deskripsi                                |
| ------ | ---------------------------------- | ---------------------------------------- |
| POST   | `/api/spp`                         | Ambil data tunggakan SPP (PostgreSQL)    |
| POST   | `/api/v1/chat`                     | AI Chatbot (OpenAI + RAG)               |
| POST   | `/api/v1/upload-pdf`               | Upload PDF ke Knowledge Base (Qdrant)    |
| POST   | `/api/v1/extract-pdf-text`         | Ekstrak teks dari PDF                    |
| GET    | `/api/v1/qdrant/stats`             | Status vektor di Qdrant Cloud            |
| POST   | `/api/v1/generate-spp-pdf`         | Generate PDF laporan SPP                 |
| GET    | `/api/v1/download-pdf/{id}`        | Download PDF hasil generate              |

---

## 6. Setup & Jalankan Frontend (Next.js)

### 6.1. Masuk ke Direktori Frontend

```powershell
cd frontend
```

### 6.2. Konfigurasi Environment

File `.env.local` seharusnya sudah ada. Jika belum, buat manual:

```powershell
# Buat file .env.local di frontend/
```

Isi `frontend/.env.local`:

```env
# Backend Services (FastAPI Local)
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000

# Workflow Automation (n8n Webhook Local)
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/chat

# Demo & Mock Mode (set true jika backend belum siap)
NEXT_PUBLIC_USE_MOCK_FALLBACK=false

# Application Environment
NEXT_PUBLIC_APP_NAME="SmartSchool AI"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### 6.3. Install Dependensi Node

```powershell
# Dari direktori frontend/
npm install
```

### 6.4. Jalankan Server Pengembang

```powershell
npm run dev
```

Jika berhasil, Anda akan melihat:

```
  ▲ Next.js (v16.x.x)
  - Local:   http://localhost:3000
```

### 6.5. Akses Aplikasi

Buka browser dan kunjungi:

```
http://localhost:3000
```

---

## 7. Pengujian & Verifikasi

### ✅ Checklist Semua Servis Berjalan

| No | Servis             | URL                          | Status |
| -- | ------------------ | ---------------------------- | ------ |
| 1  | PostgreSQL         | `localhost:5432`             | ☐      |
| 2  | Docker (n8n)       | `http://localhost:5678`      | ☐      |
| 3  | FastAPI Backend    | `http://localhost:8000`      | ☐      |
| 4  | Next.js Frontend   | `http://localhost:3000`      | ☐      |

### Cara Menguji Fitur Chatbot

1. Buka `http://localhost:3000`
2. Pilih role **Admin Keuangan & TU** (untuk akses data SPP)
3. Kirim pesan: _"Siapa saja siswa yang belum membayar SPP bulan ini?"_
4. AI akan merespons dengan tabel markdown siswa yang menunggak
5. Ketik _"buatkan PDF nya"_ atau klik tombol pencetakan
6. Klik **Unduh PDF** pada kartu yang muncul

---

## 8. Troubleshooting

### ❌ Error: `Could not import module "main"` atau `No module named 'routers'`

**Penyebab:** Anda menjalankan `uvicorn` dari folder `backend/` padahal file `main.py`
dan seluruh import-nya (`from routers.xxx`, `from services.xxx`) relatif terhadap
folder `backend/app/`.

**Solusi:** Masuk ke folder `backend/app/` terlebih dahulu:

```powershell
cd backend/app
uvicorn main:app --reload --port 8000
```

---

### ❌ Error: `ModuleNotFoundError: No module named 'xxx'`

**Penyebab:** Pustaka Python belum terinstal.

**Solusi:**

```powershell
pip install -r requirements.txt
pip install openai supabase fpdf2 pypdf
```

---

### ❌ Error: `psycopg2` — `OperationalError: could not connect to server`

**Penyebab:** PostgreSQL belum berjalan atau password salah.

**Solusi:**
1. Pastikan PostgreSQL service berjalan
2. Cek password di `backend/app/main.py` (line 32) — sesuaikan dengan password PostgreSQL Anda

---

### ❌ Error: `docker: command not found` atau Docker errors

**Penyebab:** Docker Desktop belum diinstal atau belum berjalan.

**Solusi:**
1. Install Docker Desktop
2. Buka Docker Desktop dan tunggu sampai statusnya **Running**
3. Coba lagi perintah `docker compose up -d`

---

### ❌ Frontend: `ENOENT` atau `Module not found`

**Penyebab:** Dependensi belum terinstal.

**Solusi:**

```powershell
cd frontend
rm -rf node_modules
npm install
npm run dev
```

---

### ❌ AI Chatbot merespons dengan Mock/Simulasi

**Penyebab:** Backend FastAPI tidak terjangkau atau API Key belum dikonfigurasi.

**Solusi:**
1. Pastikan backend berjalan di `http://localhost:8000`
2. Pastikan `OPENAI_API_KEY` sudah diisi di `backend/.env`
3. Pastikan `NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000` di `frontend/.env.local`

---

## 📝 Ringkasan Urutan Perintah (Quick Start)

Buka **4 terminal** terpisah dan jalankan secara berurutan:

**Terminal 1 — PostgreSQL** (pastikan sudah berjalan sebagai service)

```powershell
# Verifikasi saja
psql -U postgres -d smartschool_db -c "SELECT COUNT(*) FROM data_spp;"
```

**Terminal 2 — Docker n8n**

```powershell
cd n8n-chatbot
docker compose up -d
```

**Terminal 3 — Backend FastAPI**

```powershell
cd backend
pip install -r requirements.txt
cd app
uvicorn main:app --reload --port 8000
```

**Terminal 4 — Frontend Next.js**

```powershell
cd frontend
npm install
npm run dev
```

Lalu buka `http://localhost:3000` di browser. 🚀

---

> **Dokumen ini terakhir diperbarui:** 27 Oktober 2026
>
> **Disusun oleh:** Tim SmartSchool AI
