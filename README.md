# FREONIX Website — ASEAN Culinary & Pre-Order Catalog

Aplikasi web modern katalog kuliner khas Filipina dan sistem pre-order bazar kokurikuler ASEAN untuk kelas **XII-F1 Sains ("FREONIX")**, ditenagai oleh **Next.js 15**, **InsForge BaaS**, dan **Asisten AI Google Gemini Multimodal**.

Slogan: *"Future Ready Twelve One and Only"*  
Tanggal Pelaksanaan: **22 September 2026**

---

## 🌟 Fitur Utama

- **Katalog Kuliner Interaktif**:
  - Menu khas Filipina: **Kwek Kwek**, **Turon**, dan **Buko Coklat**.
  - Informasi rincian gizi lengkap, komposisi bahan, dan wawasan sains di balik proses pengolahan makanan.
- **Sistem Pre-Order & Checkout Cepat**:
  - Pilihan metode pembayaran: **QRIS Resmi (a.n. Jezwu)** dengan upload bukti transfer otomatis atau **Tunai (Cash di Stand)**.
  - Integrasi konfirmasi pesanan via WhatsApp langsung ke admin.
- **🤖 Asisten AI Universal FREONIX**:
  - Ditenagai oleh **Google Gemini**.
  - **Universal & Serbabisa**: Menjawab pertanyaan seputar sains, matematika, pelajaran/tugas sekolah, coding, hingga obrolan umum.
  - **Multimodal Vision (Kamera & Galeri)**: Pengunjung dapat langsung memotret objek/makanan atau mengunggah gambar untuk dianalisis oleh AI.
  - **Ephemeral & Aman**: Pemrosesan gambar secara in-memory client-side tanpa menyimpan file ke database, hemat kuota dan menjaga privasi pengguna.
- **Admin Dashboard**:
  - Manajemen pesanan (Orders), verifikasi bukti pembayaran QRIS langsung dari database/storage.
  - Pengelolaan katalog produk, kategori, dan pengaturan toko.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Library UI**: React 19, Lucide Icons, Canvas Confetti
- **Styling**: Tailwind CSS 3.4
- **Backend & Database**: InsForge BaaS (PostgreSQL, Storage, Anon/API Key)
- **AI Engine**: Google Gemini Multimodal Vision API

---

## 🚀 Memulai Proyek (Development)

### Prasyarat
- Node.js (v18 atau lebih tinggi)
- Akun / Proyek InsForge & Google Gemini API Key

### Instalasi & Menjalankan

```bash
# 1. Clone repository
git clone https://github.com/vynookio-prog/Freotest.git
cd Freotest

# 2. Install dependencies
npm install

# 3. Konfigurasi Environment (.env.local)
# Salin dari .env.example dan isi kredensial InsForge & GEMINI_API_KEY
cp .env.example .env.local

# 4. Jalankan Development Server
npm run dev

# 5. Buka browser pada http://localhost:3000
```

---

## 📦 Build & Production

```bash
# Build aplikasi untuk production
npm run build

# Menjalankan server production
npm run start
```
