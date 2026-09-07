# Supabase Integration

Saya ingin mengintegrasikan Supabase ke project website ini.

## Supabase Credentials

Project URL:
https://wvsyzexwmhyckbemuced.supabase.co

Publishable Key:
sb_publishable_XGpc9OI6OuD9hdRHAy_YnQ_1De0T12W

## Instructions

Analisis project terlebih dahulu sebelum melakukan perubahan.

- Jangan membuat ulang website.
- Jangan mengubah UI existing kecuali diperlukan.
- Jangan menghapus fitur existing.
- Jangan mengganti routing.
- Gunakan `@supabase/supabase-js`.
- Gunakan Supabase sebagai database utama.
- Ganti data dummy, mock data, JSON, atau data hardcoded dengan Supabase jika memang diperlukan.
- Gunakan environment variable untuk credential.
- Jangan gunakan service_role atau secret key di frontend.
- Aktifkan Row Level Security (RLS).
- Buat policy sesuai kebutuhan akses aplikasi.
- Implementasikan CRUD untuk fitur yang memang sudah tersedia.
- Gunakan Supabase Storage untuk upload gambar/file jika diperlukan.

## Environment Variables

Jika menggunakan Vite:

VITE_SUPABASE_URL=https://wvsyzexwmhyckbemuced.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_XGpc9OI6OuD9hdRHAy_YnQ_1De0T12W

Jika menggunakan Next.js:

NEXT_PUBLIC_SUPABASE_URL=https://wvsyzexwmhyckbemuced.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_XGpc9OI6OuD9hdRHAy_YnQ_1De0T12W

## Database

Buat schema berdasarkan struktur data yang sudah ada di project.

Jika ada produk, gunakan struktur yang sesuai dengan kebutuhan project, misalnya:

- id
- name
- description
- price
- image
- stock
- category
- created_at
- updated_at

Jangan membuat field atau tabel yang tidak diperlukan.

## Setelah Implementasi

- Jalankan build/type-check/lint yang tersedia.
- Perbaiki error.
- Pastikan koneksi Supabase berhasil.
- Pastikan data benar-benar berasal dari Supabase.
- Pastikan CRUD bekerja.
- Pastikan RLS dan policy bekerja dengan benar.
- Pastikan credential sensitif tidak terekspos.
- Tampilkan SQL schema/migration yang diperlukan.
- Berikan daftar environment variable untuk Vercel.
- Berikan ringkasan file yang diubah.

Implementasikan integrasi sampai website benar-benar menggunakan Supabase sebagai database utama.
