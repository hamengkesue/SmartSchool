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
supabase_url = os.getenv("SUPABASE_URL", "https://hqiyrfcgkoogheiwvbzm.supabase.co")
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
def get_spp_arrears(role: str = "guest"):
    allowed_roles = ["admin", "admin_keuangan_tu", "Admin Keuangan & TU"]
    if role.lower() not in [r.lower() for r in allowed_roles]:
        return json.dumps({
            "error": "Akses Ditolak. Role saat ini ('Tamu / Calon Wali') tidak memiliki wewenang untuk melihat data tunggakan SPP siswa. Data keuangan hanya dapat diakses oleh Admin Keuangan & TU."
        })
    if not supabase:
        return json.dumps({"error": "Supabase client belum terkonfigurasi. Periksa SUPABASE_URL dan SUPABASE_KEY di file .env."})
    try:
        response = supabase.table("data_spp").select("*").eq("status_pembayaran", "BELUM LUNAS").execute()
        return json.dumps(response.data)
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

# --- ENDPOINT UTAMA PENGGANTI N8N ---
@router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    if not openai_client:
        msg = "⚠️ OpenAI client belum siap. Pastikan OPENAI_API_KEY telah diisi di file .env."
        return {"content": msg, "answer": msg}

    role = request.role or "guest"
    is_admin = role.lower() in ["admin", "admin_keuangan_tu", "admin keuangan & tu"]

    # 1. Tool RAG Knowledge Base (Tersedia untuk semua role: Tamu, Orang Tua, Admin)
    rag_tool = {
        "type": "function",
        "function": {
            "name": "search_school_knowledge_base",
            "description": (
                "Cari informasi di dokumen pedoman resmi sekolah (Buku Panduan PPDB, Alur & Syarat Pendaftaran, "
                "Buku Saku Tata Tertib & Kode Etik Siswa, Sanksi Pelanggaran, dsb) di Qdrant Vector Cloud."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Kata kunci atau topik yang ingin dicari di dokumen pedoman sekolah."
                    }
                },
                "required": ["query"]
            }
        }
    }

    # 2. Tools Khusus Admin Keuangan
    admin_tools = [
        {
            "type": "function",
            "function": {
                "name": "get_spp_arrears",
                "description": "Ambil data siswa yang menunggak SPP bulan ini dari database Supabase."
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

    active_tools = [rag_tool]
    if is_admin:
        active_tools.extend(admin_tools)

    system_instruction = (
        f"Kamu adalah asisten akademik cerdas SmartSchool AI. Pengguna saat ini berinteraksi dengan role: '{role}'.\n\n"
        "FITUR RAG (RETRIEVAL AUGMENTED GENERATION):\n"
        "- Kamu terhubung ke basis pengetahuan dokumen resmi sekolah (Qdrant Vector Cloud) via fungsi 'search_school_knowledge_base'.\n"
        "- Jika pengguna menanyakan prosedur PPDB, syarat masuk, jadwal pendaftaran, tata tertib, hak & kewajiban siswa, atau kebijakan sekolah, "
        "SELALU panggil fungsi 'search_school_knowledge_base' terlebih dahulu untuk memperoleh kutipan resmi dokumen.\n"
        "- Berikan jawaban yang ramah, terstruktur, dan akurat sesuai konteks dokumen yang ditemukan.\n\n"
        "KEBIJAKAN HAK AKSES DATA & KEAMANAN (RBAC):\n"
        "- DATA TUNGGAKAN SPP SISWA BERSIFAT RAHASIA (CONFIDENTIAL).\n"
    )

    if is_admin:
        system_instruction += (
            "- PENGGUNA SAAT INI ADALAH ADMIN KEUANGAN & TU. Pengguna memiliki hak akses penuh untuk melihat daftar penunggak SPP dan mencetak PDF.\n"
            "- Sajikan data siswa menunggak dalam format TABEL MARKDOWN yang rapi dengan kolom: | No | Nama Siswa | Kelas | Nominal Tagihan | Status |.\n"
            "- Jika pengguna meminta membuatkan atau mencetak PDF, panggil fungsi generate_spp_pdf dan kembalikan URL PDF-nya dalam format markdown [Unduh PDF](url).\n"
        )
    else:
        system_instruction += (
            "- PENGGUNA SAAT INI BUKAN ADMIN (Role: Tamu Publik / Orang Tua). Pengguna DILARANG KERAS melihat daftar nama siswa yang menunggak SPP maupun membuat laporan PDF tunggakan SPP.\n"
            "- JANGAN panggil fungsi get_spp_arrears atau generate_spp_pdf.\n"
            "- Jelaskan dengan sopan bahwa informasi keuangan dan tunggakan SPP siswa bersifat rahasia dan hanya dapat diakses oleh Admin Keuangan & Tata Usaha (TU) sekolah. Arahkan pengguna untuk login sebagai Admin jika berwenang.\n"
        )

    # Inject konten PDF ke system prompt jika ada file yang dilampirkan
    if request.pdf_content and request.pdf_content.strip():
        pdf_name = request.pdf_filename or "dokumen.pdf"
        system_instruction += (
            f"\n\nDOKUMEN PDF YANG DILAMPIRKAN OLEH PENGGUNA:\n"
            f"Nama File: {pdf_name}\n"
            f"Isi Dokumen (diekstrak):\n"
            f"---\n{request.pdf_content[:12000]}\n---\n\n"
            "INSTRUKSI PENTING: Pengguna telah melampirkan dokumen PDF di atas. "
            "Baca dan pahami isi dokumen tersebut. "
            "Jika pengguna meminta rangkuman, buat rangkuman yang komprehensif dan terstruktur dalam Bahasa Indonesia. "
            "Jika pengguna mengajukan pertanyaan, jawab berdasarkan isi dokumen. "
            "JANGAN mengatakan kamu tidak bisa membaca PDF — kamu sudah menerimanya di atas."
        )

    messages = [
        {"role": "system", "content": system_instruction},
        {"role": "user", "content": request.message or f"Baca dan rangkum dokumen PDF '{request.pdf_filename}' yang saya lampirkan."}
    ]

    # Minta OpenAI merespons
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        tools=active_tools,
        tool_choice="auto"
    )
    
    response_message = response.choices[0].message

    # Jika OpenAI memutuskan harus memanggil fungsi
    if response_message.tool_calls:
        messages.append(response_message) # Simpan riwayat fungsi
        
        for tool_call in response_message.tool_calls:
            function_name = tool_call.function.name
            
            # 1. Eksekusi Pencarian RAG (Qdrant)
            if function_name == "search_school_knowledge_base":
                query_arg = request.message
                try:
                    if tool_call.function.arguments:
                        parsed_args = json.loads(tool_call.function.arguments)
                        query_arg = parsed_args.get("query", request.message)
                except Exception:
                    query_arg = request.message

                rag_results = search_knowledge_base(query_arg, limit=3)
                if rag_results:
                    snippets = []
                    for r in rag_results:
                        snippets.append(f"--- KUTIPAN DARI [{r['source']}] ---\n{r['content']}")
                    function_response = "\n\n".join(snippets)
                else:
                    function_response = "Tidak ditemukan kutipan yang cocok di dokumen pedoman Qdrant Cloud."

            # 2. Eksekusi Fungsi Admin SPP (Supabase)
            elif function_name == "get_spp_arrears" and is_admin:
                function_response = get_spp_arrears(role)
            elif function_name in ["generate_spp_pdf", "generate_pdf_and_upload"] and is_admin:
                function_response = generate_pdf_and_upload(role)
            else:
                function_response = json.dumps({"error": "Akses ditolak untuk fungsi ini."})
                
            messages.append({
                "tool_call_id": tool_call.id,
                "role": "tool",
                "name": function_name,
                "content": function_response,
            })
            
        # Kirim ulang hasil fungsi ke OpenAI untuk merangkai kata-kata akhir
        second_response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )
        final_answer = second_response.choices[0].message.content
        return {"content": final_answer, "answer": final_answer}
        
    final_answer = response_message.content
    return {"content": final_answer, "answer": final_answer}