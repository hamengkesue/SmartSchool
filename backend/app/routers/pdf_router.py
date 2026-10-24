import os
import uuid
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

# Inisialisasi router dengan prefix dasar
router = APIRouter(prefix="/api/v1", tags=["PDF Generation"])

PDF_DIR = "generated_pdfs"
os.makedirs(PDF_DIR, exist_ok=True)

# 1. Fungsi Koneksi PostgreSQL Live
def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="smartschool_db",
        user="postgres",
        password="1234",  # Password database Anda
        port="5432"
    )

def generate_dynamic_pdf(file_path: str, daftar_siswa: list):
    pdf = SimpleDocTemplate(file_path, pagesize=A4)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("ReportTitle", parent=styles["Title"], fontSize=13, alignment=TA_CENTER)
    subtitle_style = ParagraphStyle("ReportSubtitle", parent=styles["Normal"], fontSize=9, alignment=TA_CENTER)
    right_style = ParagraphStyle("Right", parent=styles["Normal"], alignment=TA_RIGHT)

    total_siswa = len(daftar_siswa)
    total_nominal = sum(int(s.get("tunggakan", 0)) for s in daftar_siswa)

    story = [
        Paragraph("SMART SCHOOL ACADEMY - TERAKREDITASI A", title_style),
        Paragraph("Jl. Pendidikan No. 123, Kota Bandung - Jawa Barat", subtitle_style),
        Paragraph("Laporan Resmi Rekapitulasi Tunggakan SPP Siswa", subtitle_style),
        Spacer(1, 14),
        Paragraph(f"<b>TOTAL SISWA MENUNGGAK:</b> {total_siswa} Siswa", styles["Normal"]),
        Paragraph(f"<b>AKUMULASI TUNGGAKAN:</b> Rp {total_nominal:,}".replace(",", "."), styles["Normal"]),
        Spacer(1, 8),
    ]

    table_data = [["NO", "NISN", "NAMA SISWA", "KELAS", "NOMINAL TAGIHAN", "STATUS"]]
    for idx, siswa in enumerate(daftar_siswa, 1):
        nominal_fmt = f"{int(siswa.get('tunggakan', 0)):,}".replace(",", ".")
        table_data.append([
            str(idx), str(siswa.get("nisn", "-")), str(siswa.get("nama", "-")),
            str(siswa.get("kelas", "-")), f"Rp {nominal_fmt}",
            str(siswa.get("status", "BELUM LUNAS")),
        ])
    table_data.append([
        "", "", "", "Subtotal Tagihan Terpilih:",
        f"Rp {total_nominal:,}".replace(",", "."), f"{total_siswa} Siswa",
    ])

    table = Table(table_data, colWidths=[28, 52, 150, 55, 105, 92], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1B365D")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("ALIGN", (0, 0), (1, -1), "CENTER"),
        ("ALIGN", (3, 0), (3, -1), "CENTER"),
        ("ALIGN", (4, 1), (4, -1), "RIGHT"),
        ("ALIGN", (5, 0), (5, -1), "CENTER"),
        ("FONTSIZE", (0, 0), (-1, -1), 7),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.extend([
        table,
        Spacer(1, 12),
        Paragraph("Dokumen ini diverifikasi dan dicetak secara otomatis oleh SmartSchool AI Assistant.", styles["Italic"]),
    ])
    pdf.build(story)

def generate_pdf_binary(file_path: str):
    # Membuat dokumen PDF biner yang sah
    c = canvas.Canvas(file_path, pagesize=A4)

    # Header Dokumen
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, 800, "SMART SCHOOL ACADEMY - TERAKREDITASI A")

    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, 780, "Laporan Resmi Rekapitulasi Tunggakan SPP")

    c.setFont("Helvetica", 10)
    c.drawString(50, 760, "Ref Number: 421.3/KEU-SMART/X/2026")
    c.drawString(50, 745, "Status: DIVERIFIKASI RESMI")
    c.drawString(50, 730, "--------------------------------------------------------------------------------")

    c.drawString(50, 700, "Dicetak secara otomatis melalui SmartSchool AI Assistant.")

    # Simpan dan tutup stream biner PDF
    c.save()

@router.post("/generate-spp-pdf")
async def generate_spp_pdf(payload: dict = None):
    try:
        # 2. Ambil Data Langsung dari Tabel PostgreSQL
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query_sql = """
            SELECT nisn, nama, kelas, nominal_tagihan AS tunggakan, status_pembayaran AS status 
            FROM data_spp 
            WHERE status_pembayaran = 'BELUM LUNAS';
        """
        cursor.execute(query_sql)
        records = cursor.fetchall()
        cursor.close()
        conn.close()

        # 3. Render PDF berdasarkan hasil query live
        file_id = str(uuid.uuid4())
        file_path = os.path.join(PDF_DIR, f"laporan_spp_{file_id}.pdf")
        generate_dynamic_pdf(file_path, records)

        download_url = f"http://localhost:8000/api/v1/download-pdf/{file_id}"
        return {"status": "success", "download_url": download_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil data dari database: {str(e)}")

@router.get("/download-pdf/{file_id}")
async def download_pdf(file_id: str):
    file_path = os.path.join(PDF_DIR, f"laporan_spp_{file_id}.pdf")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File PDF tidak ditemukan.")
    return FileResponse(file_path, media_type="application/pdf", filename=f"Laporan_Tunggakan_SPP_{file_id}.pdf")