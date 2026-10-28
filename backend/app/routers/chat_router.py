import os
import json
import uuid
from fastapi import APIRouter
from pydantic import BaseModel
from openai import OpenAI
from supabase import create_client, Client
from pathlib import Path
from dotenv import load_dotenv
from fpdf import FPDF

# Cari file .env di folder backend/ atau root
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
load_dotenv()

router = APIRouter(prefix="/api/v1", tags=["AI Chatbot"])

# Inisialisasi OpenAI & Supabase
openai_key = os.getenv("OPENAI_API_KEY")
supabase_url = os.getenv("SUPABASE_URL", "  ")
supabase_key = os.getenv("SUPABASE_KEY", "")

openai_client = OpenAI(api_key=openai_key) if openai_key else None
supabase: Client = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

class ChatRequest(BaseModel):
    message: str
    role: str = "guest"
    session_id: str = ""
    pdf_content: str = ""  # Konten teks PDF yang diekstrak dari file yang dilampirkan
    pdf_filename: str = ""  # Nama file PDF yang dilampirkan

# --- FUNGSI 1: AMBIL DATA DARI SUPABASE DENGAN CEK RBAC ---
import json

def get_spp_arrears(role: str = "guest"):
    # 1. Sanitasi parameter role jika bernilai None/null dari frontend
    current_role = role if role else "guest"
    
    # 2. Daftar role yang diizinkan (ditambah variasi string tanpa simbol &)
    allowed_roles = [
        "admin", 
        "admin_keuangan_tu", 
        "admin keuangan & tu", 
        "admin keuangan tu"
    ]
    
    # 3. Cek RBAC dengan pesan error dinamis
    if current_role.lower() not in [r.lower() for r in allowed_roles]:
        return json.dumps({
            "error": f"Akses Ditolak. Role saat ini ('{current_role}') tidak memiliki wewenang untuk melihat data tunggakan SPP siswa. Data keuangan hanya dapat diakses oleh Admin Keuangan & TU."
        })
    
    # 4. Cek ketersediaan client Supabase
    if not supabase:
        return json.dumps({
            "error": "Supabase client belum terkonfigurasi. Periksa SUPABASE_URL dan SUPABASE_KEY di file .env."
        })
        
    # 5. Eksekusi query dengan penanganan serialisasi tipe data
    try:
        response = supabase.table("data_spp").select("*").eq("status_pembayaran", "BELUM LUNAS").execute()
        return json.dumps(response.data, default=str)
    except Exception as e:
        return json.dumps({"error": f"Gagal mengambil data SPP: {str(e)}"})

# --- FUNGSI 2: GENERATE PDF DENGAN RESILIENCE & LOCAL FALLBACK ---
def generate_pdf_and_upload(role: str = "guest"):
    allowed_roles = ["admin", "admin_keuangan_tu", "Admin Keuangan & TU"]
    if role.lower() not in [r.lower() for r in allowed_roles]:
        return json.dumps({
            "error": "Akses Ditolak. Role saat ini ('Tamu / Calon Wali') tidak berhak membuat atau mencetak dokumen rekapitulasi SPP."
        })
    
    # 1. Ambil data siswa
    data = []
    if supabase:
        try:
            data = supabase.table("data_spp").select("*").eq("status_pembayaran", "BELUM LUNAS").execute().data or []
        except Exception:
            data = []

    # 2. Buat PDF (FPDF)
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(0, 10, "Laporan Resmi Rekapitulasi Tunggakan SPP", ln=True, align='C')
    pdf.set_font("Arial", 'I', 10)
    pdf.cell(0, 8, "SmartSchool Academy - Terakreditasi A", ln=True, align='C')
    pdf.ln(5)

    pdf.set_font("Arial", 'B', 10)
    pdf.cell(10, 8, "No", 1, 0, 'C')
    pdf.cell(60, 8, "Nama Siswa", 1, 0, 'L')
    pdf.cell(30, 8, "Kelas", 1, 0, 'C')
    pdf.cell(45, 8, "Nominal Tagihan", 1, 0, 'R')
    pdf.cell(45, 8, "Status", 1, 1, 'C')

    pdf.set_font("Arial", '', 10)
    for idx, row in enumerate(data, 1):
        nama = str(row.get("nama", "-"))
        kelas = str(row.get("kelas", "-"))
        nominal = f"Rp {int(row.get('nominal_tagihan', 0)):,}".replace(",", ".")
        status = str(row.get("status_pembayaran", "BELUM LUNAS"))
        pdf.cell(10, 8, str(idx), 1, 0, 'C')
        pdf.cell(60, 8, nama, 1, 0, 'L')
        pdf.cell(30, 8, kelas, 1, 0, 'C')
        pdf.cell(45, 8, nominal, 1, 0, 'R')
        pdf.cell(45, 8, status, 1, 1, 'C')

    file_id = f"laporan_spp_{str(uuid.uuid4())[:8]}"
    local_dir = Path(__file__).resolve().parent.parent / "generated_pdfs"
    local_dir.mkdir(parents=True, exist_ok=True)
    local_path = str(local_dir / f"{file_id}.pdf")
    pdf.output(local_path)

    # 3. Coba upload ke Supabase Storage jika bucket tersedia
    download_url = f"http://127.0.0.1:8000/api/v1/download-pdf/{file_id}"
    if supabase:
        try:
            with open(local_path, "rb") as f:
                supabase.storage.from_("pdfs").upload(f"{file_id}.pdf", f)
            download_url = supabase.storage.from_("pdfs").get_public_url(f"{file_id}.pdf")
        except Exception:
            # Fallback otomatis ke local endpoint FastAPI jika Storage Supabase RLS belum diset
            pass

    return json.dumps({"status": "success", "download_url": download_url})

from services.rag_service import search_knowledge_base

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Any
import json

router = APIRouter(prefix="/api/v1", tags=["AI Chatbot"])

# =====================================================================
# 1. DEKLARASI TOOLS SECARA GLOBAL
# =====================================================================
PUBLIC_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_school_knowledge_base",
            "description": "Cari informasi di dokumen pedoman resmi sekolah (PPDB, Syarat, Tata Tertib, dsb) di Qdrant Vector Cloud.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Kata kunci atau topik pencarian."}
                },
                "required": ["query"]
            }
        }
    }
]

ADMIN_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_spp_arrears",
            "description": "Ambil data siswa yang menunggak SPP dari database Supabase."
        }
    },
    {
        "type": "function",
        "function": {
            "name": "generate_spp_pdf",
            "description": "Buat dokumen file PDF resmi laporan rekapitulasi tunggakan SPP."
        }
    }
]

# =====================================================================
# 2. ENDPOINT CHAT UTAMA
# =====================================================================
@router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    if not openai_client:
        msg = "⚠️ OpenAI client belum siap. Pastikan OPENAI_API_KEY telah diisi di file .env."
        return {"content": msg, "answer": msg}

    try:
        role = request.role or "guest"
        is_admin = role.lower() in ["admin", "admin_keuangan_tu", "admin keuangan & tu"]

        # Filter Hard RBAC untuk Tools
        active_tools = list(PUBLIC_TOOLS)
        if is_admin:
            active_tools.extend(ADMIN_TOOLS)

        # System Instruction (Nama tool disamakan: generate_spp_pdf)
        system_instruction = f"""Kamu adalah SmartSchool AI, asisten akademik dan keuangan resmi SMA Smart School Academy.
Pengguna saat ini terverifikasi berinteraksi dengan Role: '{role}'.

====================================================================
1. PENCEGAHAN HALUSINASI & UTAMAKAN FAKTA (STRICT GROUNDING)
====================================================================
- Jawab HANYA berdasarkan data fakta dari hasil pemanggilan fungsi (database / Qdrant RAG).
- DILARANG MEMBUAT ATAU MENGARANG fakta seperti biaya, tanggal PPDB, nama siswa, atau aturan sekolah.
- Jika data tidak ditemukan, katakan sopan: "Maaf, saya tidak dapat menjawab pertanyaan di luar topik sekolah. Anda dapat menanyakan hal-hal seperti:

"Apa saja syarat pendaftaran PPDB?"

"Bagaimana aturan tata tertib sekolah?"

"Berapa besaran biaya SPP bulan ini?"

====================================================================
2. ATURAN HAK AKSES DATA & KEAMANAN (RBAC)
====================================================================
- Data tunggakan SPP bersifat CONFIDENTIAL. Jika role BUKAN 'Admin Keuangan & TU', TOLAK akses data SPP.

====================================================================
3. ALUR PENGGUNAAN FUNGSI (TOOL CALLING ROUTING)
====================================================================
- Pertanyaan umum (PPDB, Tata Tertib, Kebijakan) -> Panggil `search_school_knowledge_base`.
- Kueri Tunggakan SPP -> Panggil `get_spp_arrears` (Khusus Admin).
- Permintaan Laporan PDF -> Panggil `generate_spp_pdf`. Format tautan akhir: `[Unduh PDF Laporan SPP](URL_PUBLIK)`.
"""

        if is_admin:
            system_instruction += "\n- PENGGUNA ADALAH ADMIN. Sajikan data penunggak dalam TABEL MARKDOWN: | No | Nama Siswa | Kelas | Nominal Tagihan | Status |."
        else:
            system_instruction += "\n- PENGGUNA BUKAN ADMIN. DILARANG KERAS memanggil get_spp_arrears atau generate_spp_pdf."

        # Inject Dokumen PDF Lampiran jika ada
        if request.pdf_content and request.pdf_content.strip():
            pdf_name = request.pdf_filename or "dokumen.pdf"
            system_instruction += f"\n\nDOKUMEN PDF DILAMPIRKAN ({pdf_name}):\n---\n{request.pdf_content[:12000]}\n---\n"

        # Susun Pesan & Riwayat Percakapan (Multi-turn Context)
        messages = [{"role": "system", "content": system_instruction}]

        if hasattr(request, 'history') and request.history:
            for item in request.history:
                r = item.get("role") if isinstance(item, dict) else getattr(item, "role", None)
                c = item.get("content") if isinstance(item, dict) else getattr(item, "content", None)
                if r in ["user", "assistant"] and c:
                    messages.append({"role": r, "content": str(c)})

        user_message_text = request.message or f"Baca dan rangkum dokumen PDF '{request.pdf_filename}' yang saya lampirkan."
        messages.append({"role": "user", "content": user_message_text})

        # Panggil OpenAI API Pertama
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            tools=active_tools if active_tools else None,
            tool_choice="auto" if active_tools else None
        )
        
        response_message = response.choices[0].message

        # Penanganan Function / Tool Calling
        if response_message.tool_calls:
            messages.append(response_message)
            
            for tool_call in response_message.tool_calls:
                function_name = tool_call.function.name
                function_response = ""
                
                if function_name == "search_school_knowledge_base":
                    query_arg = user_message_text
                    try:
                        if tool_call.function.arguments:
                            parsed_args = json.loads(tool_call.function.arguments)
                            query_arg = parsed_args.get("query", user_message_text)
                    except Exception:
                        pass

                    rag_results = search_knowledge_base(query_arg, limit=3)
                    if rag_results:
                        snippets = [f"--- KUTIPAN [{r['source']}] ---\n{r['content']}" for r in rag_results]
                        function_response = "\n\n".join(snippets)
                    else:
                        function_response = "Tidak ditemukan kutipan yang cocok di Qdrant Cloud."

                elif function_name == "get_spp_arrears" and is_admin:
                    function_response = get_spp_arrears(role)
                elif function_name == "generate_spp_pdf" and is_admin:
                    function_response = generate_pdf_and_upload(role)
                else:
                    function_response = json.dumps({"error": "Akses ditolak untuk fungsi ini."})
                
                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": str(function_response),
                })
                
            # Pemanggilan Kedua ke OpenAI untuk Menyusun Balasan Teks Akhir
            second_response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages
            )
            final_answer = second_response.choices[0].message.content or "Proses selesai."
        else:
            final_answer = response_message.content or "Maaf, tidak dapat memproses permintaan."

        return {"content": final_answer, "answer": final_answer}

    except Exception as e:
        print(f"[ERROR FASTAPI LOG]: {str(e)}")
        err_msg = f"Terjadi kendala pada server backend: {str(e)}"
        return {"content": err_msg, "answer": err_msg}