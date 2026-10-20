import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartSchool AI – Sistem Chatbot Layanan Akademik & Keuangan Sekolah",
  description:
    "Asisten cerdas sekolah dengan kapabilitas RAG Knowledge Base, Parsing PDF, Voice Recognition, dan Query Database Tunggakan SPP.",
  icons: {
    icon: "/images/logo-sekolah.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-teal-100 selection:text-teal-900">
        {children}
      </body>
    </html>
  );
}
