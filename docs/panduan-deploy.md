# 🚀 Panduan Deploy SmartSchool AI ke Production

> Dokumen ini berisi langkah-langkah **lengkap dan detail** untuk men-deploy project
> SmartSchool AI dari lokal ke production menggunakan **GitHub**, **Render.com** (backend),
> dan **Hostinger Shared Hosting** (frontend).

---

## 📋 Daftar Isi

1. [Arsitektur Deployment](#1-arsitektur-deployment)
2. [Prasyarat & Persiapan Akun](#2-prasyarat--persiapan-akun)
3. [Persiapan Kode untuk Production](#3-persiapan-kode-untuk-production)
4. [Push Kode ke GitHub (branch main)](#4-push-kode-ke-github-branch-main)
5. [Deploy Backend FastAPI ke Render.com](#5-deploy-backend-fastapi-ke-rendercom)
6. [Setup Subdomain untuk Backend (Opsional)](#6-setup-subdomain-untuk-backend-opsional)
7. [Build & Deploy Frontend ke Hostinger](#7-build--deploy-frontend-ke-hostinger)
8. [Integrasi Frontend ↔ Backend](#8-integrasi-frontend--backend)
9. [Pengujian Production](#9-pengujian-production)
10. [Catatan tentang n8n di Production](#10-catatan-tentang-n8n-di-production)
11. [Troubleshooting](#11-troubleshooting)
12. [Maintenance & Update](#12-maintenance--update)

---

## 1. Arsitektur Deployment

```
┌──────────────────────────────────────────────────────────────────────┐
│                    ARSITEKTUR PRODUCTION                            │
│                                                                      │
│   ┌──────────────────┐         ┌──────────────────────┐             │
│   │   PENGGUNA        │         │   GITHUB REPOSITORY   │             │
│   │   (Browser)       │         │   hamengkesue/         │             │
│   └────────┬─────────┘         │   SmartSchool          │             │
│            │                    └──────────┬───────────┘             │
│            │                               │                         │
│     ┌──────▼──────────────┐    ┌──────────▼───────────┐             │
│     │  FRONTEND (Next.js) │    │  BACKEND (FastAPI)    │             │
│     │  Static Export      │    │  Python + Uvicorn     │             │
│     │                     │    │                       │             │
│     │  Hostinger Shared   │    │  Render.com (Free)    │             │
│     │  Hosting            │    │  Auto-deploy dari     │             │
│     │                     │    │  GitHub                │             │
│     │  ai.jatimelati      │    │  api-smartschool       │             │
│     │  bulogtiga.com      │    │  .onrender.com         │             │
│     └─────────────────────┘    └───────────┬──────────┘             │
│                                            │                         │
│              ┌─────────────────────────────┤                         │
│              │                             │                         │
│     ┌────────▼──────────┐    ┌────────────▼────────────┐            │
│     │  SUPABASE          │    │  QDRANT CLOUD            │            │
│     │  (Database)        │    │  (Vector DB untuk RAG)   │            │
│     │  Cloud - Sudah ada │    │  Cloud - Sudah ada       │            │
│     └───────────────────┘    └─────────────────────────┘            │
└──────────────────────────────────────────────────────────────────────┘
```

### Kenapa Arsitektur Ini?

| Komponen | Platform | Alasan |
|----------|----------|--------|
| **Frontend** | Hostinger (sudah punya) | Next.js di-export jadi file statis (HTML/CSS/JS), bisa di-host di shared hosting |
| **Backend** | Render.com (gratis) | Shared hosting **tidak bisa** menjalankan Python/FastAPI. Render.com menyediakan server gratis yang bisa jalankan Python |
| **Database** | Supabase Cloud (sudah ada) | Sudah dikonfigurasi, tidak perlu setup ulang |
| **Vector DB** | Qdrant Cloud (sudah ada) | Sudah dikonfigurasi, tidak perlu setup ulang |

> ⚠️ **Penting:** Anda **tidak perlu subdomain terpisah** untuk backend jika menggunakan
> Render.com, karena Render otomatis memberikan URL publik gratis
> (contoh: `https://smartschool-api.onrender.com`). Namun jika ingin custom subdomain
> seperti `api.jatimelatibulogtiga.com`, lihat [Langkah 6](#6-setup-subdomain-untuk-backend-opsional).

---

## 2. Prasyarat & Persiapan Akun

### ✅ Yang Sudah Dimiliki

- [x] Repository GitHub: `https://github.com/hamengkesue/SmartSchool.git`
- [x] Domain frontend: `ai.jatimelatibulogtiga.com` (Hostinger)
- [x] Supabase Cloud (sudah konfigurasi)
- [x] Qdrant Cloud (sudah konfigurasi)
- [x] API Key OpenAI

### 📝 Yang Perlu Disiapkan

| No | Aksi | Link | Keterangan |
|----|------|------|------------|
| 1 | Buat akun **Render.com** | https://render.com | Gratis, daftar pakai GitHub |
| 2 | Pastikan akses ke **Hostinger CPanel** | https://hpanel.hostinger.com | Untuk upload file frontend |
| 3 | Pastikan **Git** terinstal di PC | `git --version` | Untuk push kode |

> 💡 **Tips:** Daftar Render.com **langsung dengan akun GitHub** agar integrasi lebih mudah.

---

## 3. Persiapan Kode untuk Production

Sebelum push ke GitHub, kita perlu mempersiapkan beberapa file konfigurasi untuk deployment.

### 3.1. Buat File `render.yaml` (Root Project)

File ini memberitahu Render.com cara men-deploy backend Anda.

**Buat file baru:** `render.yaml` di root project (`Project_Malay/render.yaml`)

```yaml
# render.yaml - Konfigurasi auto-deploy Render.com
services:
  - type: web
    name: smartschool-api
    runtime: python
    region: singapore  # Pilih region terdekat
    plan: free
    rootDir: backend
    buildCommand: pip install -r requirements.txt
    startCommand: cd app && uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: "3.10.0"
      - key: OPENAI_API_KEY
        sync: false  # Akan diisi manual di dashboard Render
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_KEY
        sync: false
      - key: QDRANT_URL
        sync: false
      - key: QDRANT_API_KEY
        sync: false
      - key: QDRANT_COLLECTION
        sync: false
```

### 3.2. Buat File `requirements.txt` untuk Production

Pastikan `backend/requirements.txt` mencakup semua dependensi. Edit jika perlu:

```
fastapi==0.115.0
uvicorn[standard]==0.31.0
pydantic>=2.9.0
langchain>=0.3.0
langchain-openai>=0.2.0
qdrant-client>=1.11.0
python-multipart>=0.0.12
python-dotenv>=1.0.1
pymysql>=1.1.0
sqlalchemy>=2.0.0
requests>=2.32.0
openai
supabase
fpdf2
pypdf
psycopg2-binary
```

> ⚠️ **Penting:** Gunakan `psycopg2-binary` (bukan `psycopg2`) karena Render.com
> tidak selalu punya library C yang dibutuhkan `psycopg2` murni.

### 3.3. Update CORS di Backend untuk Production

Edit file `backend/app/main.py` — ubah `allow_origins` agar lebih aman di production:

```python
# Ganti allow_origins=["*"] dengan daftar domain yang diizinkan
import os

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Nanti di Render.com, set environment variable:
```
ALLOWED_ORIGINS=https://ai.jatimelatibulogtiga.com,http://localhost:3000
```

> 💡 Untuk sementara bisa tetap pakai `["*"]` dulu sampai semuanya berjalan lancar,
> baru kemudian di-restrict.

### 3.4. Pastikan `.gitignore` Sudah Benar

File `.gitignore` di root project Anda sudah cukup baik. Pastikan file-file sensitif
**TIDAK** ter-push:

```gitignore
# Yang HARUS ada di .gitignore:
.env
.env*.local
backend/.env
node_modules/
.next/
__pycache__/
```

> ⚠️ **KRITIS:** Jangan pernah push file `.env` yang berisi API key asli ke GitHub!

### 3.5. Buat File `.env.example` untuk Frontend

Buat file `frontend/.env.example` sebagai referensi:

```env
# URL Backend FastAPI di Production (Render.com)
NEXT_PUBLIC_FASTAPI_URL=https://smartschool-api.onrender.com

# n8n Webhook (kosongkan jika tidak pakai n8n di production)
NEXT_PUBLIC_N8N_WEBHOOK_URL=

# Mode Aplikasi
NEXT_PUBLIC_USE_MOCK_FALLBACK=false
NEXT_PUBLIC_APP_NAME="SmartSchool AI"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

---

## 4. Push Kode ke GitHub (branch main)

### 4.1. Pindah ke Branch yang Benar

```powershell
# Pastikan Anda di root project
cd c:\laragon\www\Project_Malay

# Lihat branch aktif saat ini
git branch

# Pindah ke branch main
git checkout main

# Tarik perubahan terbaru dari remote (jika ada)
git pull origin main
```

### 4.2. Merge Perubahan dari Branch Development

Jika development Anda ada di branch lain (misal `dev` atau `abyan`):

```powershell
# Merge perubahan dari branch development ke main
git merge dev
```

> Jika ada **merge conflict**, selesaikan terlebih dahulu sebelum lanjut.

### 4.3. Tambahkan File Baru yang Dibuat

```powershell
# Tambahkan semua perubahan
git add .

# Lihat status — pastikan .env TIDAK ada dalam daftar
git status
```

**Verifikasi:** Pastikan output `git status` **TIDAK** menampilkan:
- `backend/.env`
- `frontend/.env.local`
- File apapun yang berisi API key/secret

### 4.4. Commit dan Push

```powershell
# Commit dengan pesan deskriptif
git commit -m "feat: prepare project for production deployment"

# Push ke remote branch main
git push origin main
```

### 4.5. Verifikasi di GitHub

1. Buka browser → https://github.com/hamengkesue/SmartSchool
2. Pastikan branch `main` sudah ter-update
3. Pastikan **tidak ada** file `.env` yang berisi secret/API key

---

## 5. Deploy Backend FastAPI ke Render.com

### 5.1. Buat Akun & Login Render.com

1. Buka https://render.com
2. Klik **"Get Started for Free"**
3. Pilih **"Sign up with GitHub"** (rekomendasi)
4. Authorize Render untuk akses repository GitHub Anda

### 5.2. Buat Web Service Baru

1. Di dashboard Render, klik **"+ New"** → **"Web Service"**
2. Pilih **"Build and deploy from a Git repository"** → **Next**
3. Cari dan pilih repository **`hamengkesue/SmartSchool`**
4. Klik **"Connect"**

### 5.3. Konfigurasi Web Service

Isi form dengan detail berikut:

| Field | Nilai |
|-------|-------|
| **Name** | `smartschool-api` |
| **Region** | `Singapore (Southeast Asia)` |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `cd app && uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free` |

> ⚠️ **Root Directory** harus diisi `backend` (tanpa `/` di depan) agar Render hanya
> membuild folder backend saja.

### 5.4. Set Environment Variables

Masih di halaman yang sama, scroll ke bawah ke bagian **"Environment Variables"**.
Klik **"Add Environment Variable"** untuk setiap variabel berikut:

| Key | Value | Keterangan |
|-----|-------|------------|
| `PYTHON_VERSION` | `3.10.0` | Versi Python |
| `OPENAI_API_KEY` | *(salin dari backend/.env lokal)* | API Key OpenAI Anda |
| `SUPABASE_URL` | *(salin dari backend/.env lokal)* | URL Supabase |
| `SUPABASE_KEY` | *(salin dari backend/.env lokal)* | Supabase Anon Key |
| `QDRANT_URL` | *(salin dari backend/.env lokal)* | Qdrant Cloud URL |
| `QDRANT_API_KEY` | *(salin dari backend/.env lokal)* | Qdrant API Key |
| `QDRANT_COLLECTION` | `testing_collection` | Nama collection Qdrant |
| `ALLOWED_ORIGINS` | `https://ai.jatimelatibulogtiga.com,http://localhost:3000` | Domain yang boleh akses API |

> ⚠️ **Salin nilai dari file `backend/.env` lokal Anda.** Jangan ketik ulang manual
> untuk menghindari typo.

### 5.5. Deploy!

1. Klik **"Create Web Service"**
2. Render akan mulai proses build (biasanya 3-5 menit pertama kali)
3. Pantau log build di dashboard — pastikan tidak ada error

### 5.6. Catat URL Backend

Setelah deploy berhasil, Render akan memberikan URL publik:

```
https://smartschool-api.onrender.com
```

**Verifikasi dengan membuka di browser:**

| URL | Expected |
|-----|----------|
| `https://smartschool-api.onrender.com/` | `{"message": "Server SmartSchool Aktif"}` |
| `https://smartschool-api.onrender.com/health` | `{"status": "healthy", ...}` |
| `https://smartschool-api.onrender.com/docs` | Swagger UI |

> ⚠️ **Catatan Free Tier Render.com:**
> - Server akan **sleep** setelah 15 menit tidak ada request (cold start ~30-60 detik)
> - Bandwidth terbatas 100 GB/bulan
> - Cukup untuk demo dan penggunaan ringan

---

## 6. Setup Subdomain untuk Backend (Opsional)

> Langkah ini **opsional**. URL dari Render.com (`smartschool-api.onrender.com`)
> sudah bisa langsung dipakai. Lakukan ini hanya jika ingin URL lebih rapi
> seperti `api.jatimelatibulogtiga.com`.

### 6.1. Tambahkan Custom Domain di Render

1. Di dashboard Render → pilih service `smartschool-api`
2. Klik tab **"Settings"**
3. Scroll ke **"Custom Domains"**
4. Klik **"Add Custom Domain"**
5. Masukkan: `api.jatimelatibulogtiga.com`
6. Render akan menampilkan **CNAME record** yang harus ditambahkan

### 6.2. Tambahkan DNS Record di Hostinger

1. Login ke https://hpanel.hostinger.com
2. Pilih domain `jatimelatibulogtiga.com`
3. Buka menu **"DNS / Nameservers"** atau **"DNS Zone Editor"**
4. Tambahkan record baru:

| Type | Name | Value/Target | TTL |
|------|------|-------------|-----|
| **CNAME** | `api` | `smartschool-api.onrender.com` | 14400 |

5. Klik **Save**
6. Tunggu propagasi DNS (biasanya 5-30 menit, bisa sampai 24 jam)

### 6.3. Verifikasi Custom Domain

```
https://api.jatimelatibulogtiga.com/health
```

Jika sudah bisa diakses, custom domain berhasil dikonfigurasi.

> 💡 Render.com otomatis menyediakan **SSL/HTTPS gratis** untuk custom domain.

---

## 7. Build & Deploy Frontend ke Hostinger

### 7.1. Konfigurasi Environment Production

Edit file `frontend/.env.local` dengan URL backend production:

```env
# Gunakan URL Render.com (atau custom domain jika sudah setup)
NEXT_PUBLIC_FASTAPI_URL=https://smartschool-api.onrender.com

# n8n - kosongkan jika tidak deploy n8n
NEXT_PUBLIC_N8N_WEBHOOK_URL=

# Konfigurasi Aplikasi
NEXT_PUBLIC_USE_MOCK_FALLBACK=false
NEXT_PUBLIC_APP_NAME="SmartSchool AI"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

> ⚠️ Jika Anda sudah setup custom domain di Langkah 6, gunakan:
> `NEXT_PUBLIC_FASTAPI_URL=https://api.jatimelatibulogtiga.com`

### 7.2. Build Static Export

Karena Hostinger adalah shared hosting, kita perlu export Next.js menjadi file statis:

```powershell
# Masuk ke folder frontend
cd c:\laragon\www\Project_Malay\frontend

# Set variabel environment untuk static export
$env:NEXT_EXPORT = "true"

# Build project
npm run build
```

**Apa yang terjadi:**
- Next.js akan membuild dan mengexport semua halaman menjadi file HTML/CSS/JS statis
- Hasilnya ada di folder `frontend/out/`

> ⚠️ Jika ada error saat build, lihat [bagian Troubleshooting](#11-troubleshooting).

### 7.3. Verifikasi Hasil Build

```powershell
# Cek folder out/ sudah terisi
dir frontend\out
```

Anda seharusnya melihat file-file seperti:
```
index.html
404.html
_next/
  static/
    css/
    chunks/
    media/
```

### 7.4. Upload ke Hostinger

Ada **2 cara** untuk upload ke Hostinger:

#### Cara A: Via File Manager Hostinger (Mudah)

1. Login ke https://hpanel.hostinger.com
2. Pilih website `ai.jatimelatibulogtiga.com`
3. Buka **"File Manager"**
4. Navigasi ke folder `public_html/` (atau folder root subdomain)
5. **Hapus semua file lama** di dalam folder tersebut (jika ada)
6. **Compress** (zip) seluruh isi folder `frontend/out/` menjadi satu file `.zip`
7. Upload file `.zip` tersebut ke `public_html/`
8. Klik kanan file `.zip` → **"Extract"**
9. Pastikan file ter-extract langsung di `public_html/` (bukan subfolder)
10. Hapus file `.zip` yang sudah di-extract

Struktur akhir di Hostinger harus seperti ini:
```
public_html/
├── .htaccess
├── index.html
├── 404.html
└── _next/
    └── static/
        ├── css/
        ├── chunks/
        └── media/
```

#### Cara B: Via FTP (Lebih Cepat untuk File Banyak)

1. Di Hostinger Dashboard → **"Files"** → **"FTP Accounts"**
2. Catat kredensial FTP:
   - **Host:** ftp.jatimelatibulogtiga.com (atau IP dari Hostinger)
   - **Username:** (dari dashboard)
   - **Password:** (dari dashboard)
   - **Port:** 21

3. Install FileZilla (https://filezilla-project.org/) atau gunakan FTP client lain

4. Connect ke FTP:
   ```
   Host: ftp.jatimelatibulogtiga.com
   Username: (dari dashboard Hostinger)
   Password: (dari dashboard Hostinger)
   Port: 21
   ```

5. Navigasi ke `public_html/` di sisi server
6. Upload semua isi folder `frontend/out/` ke `public_html/`

### 7.5. Konfigurasi `.htaccess` (Penting!)

Buat file `.htaccess` di `public_html/` agar routing Next.js berfungsi dengan benar:

```apache
# .htaccess untuk Next.js Static Export
RewriteEngine On

# Redirect HTTP ke HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Jika file/folder yang diminta ada, serve langsung
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Fallback ke index.html untuk client-side routing
RewriteRule ^(.*)$ /index.html [L]

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Disable directory listing
Options -Indexes

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

Upload file ini ke `public_html/.htaccess`.

### 7.6. Aktifkan SSL di Hostinger

1. Di Hostinger Dashboard → pilih website
2. Buka **"SSL"** atau **"Security"**
3. Aktifkan **Free SSL** (Let's Encrypt)
4. Tunggu beberapa menit sampai SSL aktif

---

## 8. Integrasi Frontend ↔ Backend

### 8.1. Alur Komunikasi

```
Browser (User)
    │
    ▼
ai.jatimelatibulogtiga.com (Hostinger)
    │  mengirim request API ke:
    ▼
https://smartschool-api.onrender.com/api/v1/chat
    │  backend memproses dengan:
    ▼
OpenAI API + Qdrant Cloud + Supabase
    │
    ▼
Response dikembalikan ke browser
```

### 8.2. Checklist Integrasi

| No | Komponen | Konfigurasi | Status |
|----|----------|-------------|--------|
| 1 | Frontend `.env` | `NEXT_PUBLIC_FASTAPI_URL` → URL Render | ☐ |
| 2 | Backend CORS | `ALLOWED_ORIGINS` mencakup domain frontend | ☐ |
| 3 | Backend env vars | Semua API key tersedia di Render | ☐ |
| 4 | HTTPS | Kedua sisi menggunakan HTTPS | ☐ |

### 8.3. Debugging Koneksi

Jika frontend tidak bisa terhubung ke backend, buka **Developer Tools (F12)** di browser
→ tab **Console** dan **Network** untuk melihat error.

**Error umum:**

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `CORS error` | Backend tidak mengizinkan domain frontend | Tambahkan domain frontend ke `ALLOWED_ORIGINS` di Render |
| `Mixed Content` | Frontend HTTPS, backend HTTP | Pastikan URL backend menggunakan `https://` |
| `Failed to fetch` | Backend belum aktif / URL salah | Cek URL backend di `.env.local` dan pastikan Render service aktif |
| `504 Gateway Timeout` | Render cold start (free tier) | Tunggu 30-60 detik, coba lagi. Request pertama setelah 15 menit idle memang lambat |

---

## 9. Pengujian Production

### 9.1. Test Backend

Buka browser atau gunakan `curl`:

```powershell
# Test root endpoint
curl https://smartschool-api.onrender.com/

# Test health check
curl https://smartschool-api.onrender.com/health

# Test API docs
# Buka di browser: https://smartschool-api.onrender.com/docs
```

### 9.2. Test Frontend

1. Buka `https://ai.jatimelatibulogtiga.com`
2. Pastikan halaman muncul dengan benar
3. Buka DevTools (F12) → Console → pastikan tidak ada error merah

### 9.3. Test Integrasi End-to-End

1. Buka `https://ai.jatimelatibulogtiga.com`
2. Pilih role **Admin Keuangan & TU**
3. Kirim pesan: _"Halo, apa saja layanan yang tersedia?"_
4. ✅ Jika AI merespons → **integrasi berhasil!**
5. ❌ Jika muncul error/mock response → cek [Troubleshooting](#11-troubleshooting)

### 9.4. Checklist Final

| No | Item | Status |
|----|------|--------|
| 1 | Backend Render.com aktif dan merespons `/health` | ☐ |
| 2 | Frontend Hostinger bisa diakses via HTTPS | ☐ |
| 3 | Chat AI berfungsi (frontend → backend → OpenAI) | ☐ |
| 4 | RAG Knowledge Base berfungsi (Qdrant) | ☐ |
| 5 | Data SPP bisa ditampilkan (Supabase/PostgreSQL) | ☐ |
| 6 | Generate PDF berfungsi | ☐ |
| 7 | Tidak ada API key yang ter-expose di GitHub | ☐ |

---

## 10. Catatan tentang n8n di Production

### Situasi Saat Ini

n8n berjalan **secara lokal** menggunakan Docker di PC Anda. Untuk production,
ada beberapa opsi:

| Opsi | Biaya | Keterangan |
|------|-------|------------|
| **Tidak deploy n8n** | Gratis | Frontend langsung hit backend FastAPI tanpa melalui n8n. Chat tetap berfungsi karena frontend sudah punya fallback ke FastAPI langsung |
| **n8n Cloud** | ~$20/bulan | Layanan managed n8n. Mudah, tidak perlu server sendiri |
| **n8n di VPS** | ~$5/bulan | Deploy Docker di VPS murah (Contabo, DigitalOcean) |

### Rekomendasi untuk Sekarang

**Tidak perlu deploy n8n dulu.** Aplikasi SmartSchool AI sudah bisa berfungsi penuh
dengan arsitektur **Frontend → Backend FastAPI → OpenAI/Qdrant** tanpa n8n.

Fitur yang menggunakan n8n (webhook chat) sudah memiliki fallback di frontend
yang mengarah langsung ke endpoint FastAPI:

```typescript
// Di apiClient.ts - jika N8N_WEBHOOK_URL kosong, fallback ke FastAPI
export const N8N_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "http://127.0.0.1:8000/api/v1/chat";
```

Pastikan `NEXT_PUBLIC_N8N_WEBHOOK_URL` dikosongkan di production `.env.local` agar
frontend langsung menggunakan backend FastAPI.

---

## 11. Troubleshooting

### ❌ Build Frontend Gagal (`next build` Error)

**Error:** `Error: Image Optimization is not compatible with 'output: export'`

**Solusi:** Sudah ditangani — file `next.config.mjs` sudah ada `images: { unoptimized: true }`.

---

### ❌ Build Frontend Gagal (API Route Error)

**Error:** `Error: API Routes cannot be used with "output: export"`

**Solusi:** Pastikan tidak ada file di `frontend/src/app/api/` yang menggunakan
API routes. Static export tidak mendukung API routes — semua API harus di backend FastAPI.

---

### ❌ Backend Render.com Gagal Build

**Error:** `No module named 'xxx'`

**Solusi:** Pastikan semua dependensi ada di `backend/requirements.txt`:
```powershell
# Tambahkan yang kurang
pip freeze > backend/requirements_full.txt
# Lalu salin yang diperlukan ke requirements.txt
```

---

### ❌ Backend Render.com: `ModuleNotFoundError: No module named 'psycopg2'`

**Solusi:** Gunakan `psycopg2-binary` di `requirements.txt`:
```
psycopg2-binary
```

---

### ❌ Frontend Halaman Kosong / 404

**Penyebab:** File tidak ter-upload dengan benar atau `.htaccess` belum dikonfigurasi.

**Solusi:**
1. Pastikan `index.html` ada di root `public_html/`
2. Pastikan `.htaccess` sudah di-upload
3. Clear cache browser (Ctrl+Shift+Delete)

---

### ❌ CORS Error di Browser Console

**Penyebab:** Backend belum mengizinkan domain frontend.

**Solusi:** Di dashboard Render → Environment Variables → pastikan:
```
ALLOWED_ORIGINS=https://ai.jatimelatibulogtiga.com,http://localhost:3000
```
Lalu redeploy backend (Render akan auto-deploy jika pakai `render.yaml`).

---

### ❌ Render Free Tier Lambat (Cold Start)

**Penjelasan:** Server free tier Render.com **sleep** setelah 15 menit tanpa request.
Request pertama setelah sleep membutuhkan 30-60 detik untuk "bangun".

**Solusi (sementara):**
- Gunakan layanan seperti https://uptimerobot.com (gratis) untuk ping endpoint
  `/health` setiap 14 menit agar server tidak tidur
- Atau upgrade ke Render Starter plan ($7/bulan) untuk always-on

---

## 12. Maintenance & Update

### 12.1. Cara Update Backend

Backend akan **auto-deploy** setiap ada push ke branch `main` di GitHub:

```powershell
# Edit kode backend
# ...

# Commit dan push
git add .
git commit -m "fix: perbaikan endpoint chat"
git push origin main

# Render.com akan otomatis detect perubahan dan redeploy (~2-3 menit)
```

### 12.2. Cara Update Frontend

Frontend perlu **build ulang** dan **upload manual**:

```powershell
# 1. Edit kode frontend

# 2. Update .env.local jika perlu

# 3. Build ulang
cd frontend
$env:NEXT_EXPORT = "true"
npm run build

# 4. Upload isi folder out/ ke Hostinger via File Manager atau FTP
```

> 💡 **Tips:** Untuk mempermudah update frontend, pertimbangkan untuk migrasi
> ke **Vercel** (gratis untuk project personal) yang bisa auto-deploy dari GitHub
> seperti Render.com. Cukup connect repository dan set root directory ke `frontend/`.

### 12.3. Monitoring

| Apa | Dimana |
|-----|--------|
| Log backend | Render Dashboard → Service → Logs |
| Status backend | `https://smartschool-api.onrender.com/health` |
| Uptime monitoring | https://uptimerobot.com (gratis) |
| Error frontend | Browser DevTools → Console (F12) |

---

## 📝 Ringkasan Langkah-Langkah

```
┌─────────────────────────────────────────────────────┐
│           RINGKASAN ALUR DEPLOYMENT                  │
│                                                       │
│  1. Siapkan akun Render.com (gratis, pakai GitHub)   │
│                     ↓                                 │
│  2. Siapkan file konfigurasi (render.yaml, dll)      │
│                     ↓                                 │
│  3. Push semua kode ke branch main di GitHub         │
│                     ↓                                 │
│  4. Buat Web Service di Render.com                   │
│     (connect repo → set env vars → deploy)           │
│                     ↓                                 │
│  5. Catat URL backend dari Render                    │
│     (https://smartschool-api.onrender.com)           │
│                     ↓                                 │
│  6. Update frontend .env.local dengan URL backend    │
│                     ↓                                 │
│  7. Build frontend: npm run build (NEXT_EXPORT=true) │
│                     ↓                                 │
│  8. Upload folder out/ ke Hostinger public_html/     │
│                     ↓                                 │
│  9. Upload .htaccess ke public_html/                 │
│                     ↓                                 │
│  10. Test semua endpoint dan integrasi               │
│                     ↓                                 │
│  ✅ SELESAI — Aplikasi live di production!           │
└─────────────────────────────────────────────────────┘
```

---

> **Dokumen ini terakhir diperbarui:** 28 Oktober 2026
>
> **Disusun oleh:** Tim SmartSchool AI
