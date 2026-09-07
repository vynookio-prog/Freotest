Perbaikan & Sinkronisasi Supabase — Freonix

Tujuan

Perbaiki integrasi backend Supabase pada project Freonix agar website customer dan portal admin menggunakan database Supabase yang sama dan data dapat tersinkronisasi dengan benar.

JANGAN migrasikan project ke Firebase, Appwrite, PocketBase, atau backend lainnya.

JANGAN mengganti stack yang sudah ada tanpa alasan yang benar-benar diperlukan.

---

Masalah Utama

Saat customer membuat pesanan melalui website checkout, pesanan harus tersimpan ke Supabase dan dapat langsung terlihat di portal admin.

Portal admin harus membaca data dari Supabase yang sama, sehingga ketika:

1. Customer membuat pesanan dari browser A.
2. Pesanan berhasil dibuat.
3. Admin membuka portal dari browser B.
4. Admin login menggunakan akun yang sesuai.

Maka pesanan tersebut harus tetap muncul.

Jangan menggunakan localStorage, sessionStorage, state React, mock data, atau data sementara sebagai sumber utama database pesanan.

---

Yang Harus Dilakukan

1. Audit Supabase yang Sudah Ada

Periksa seluruh project terlebih dahulu:

- konfigurasi Supabase
- Supabase URL
- Supabase publishable/anon key
- client initialization
- authentication
- tabel database
- query INSERT
- query SELECT
- query UPDATE
- query DELETE
- Row Level Security (RLS)
- policy database
- realtime subscription jika memang digunakan

Jangan membuat struktur baru sebelum memahami struktur yang sudah ada.

---

2. Perbaiki Database Connection

Pastikan frontend menggunakan satu Supabase project yang benar.

Gunakan environment variable yang sesuai dengan project.

Jangan hardcode secret key atau service role key di frontend.

Frontend hanya boleh menggunakan publishable/anon key.

---

3. Perbaiki Proses Checkout

Ketika customer melakukan checkout:

Customer
   ↓
Checkout
   ↓
Validation
   ↓
Supabase INSERT
   ↓
Order berhasil tersimpan
   ↓
Tampilkan status berhasil

Pastikan INSERT benar-benar berhasil sebelum menampilkan pesan bahwa pesanan berhasil dibuat.

Jika INSERT gagal:

- tampilkan error yang jelas
- jangan menganggap order berhasil
- jangan membuat data palsu di localStorage

Pastikan field yang dikirim sesuai dengan schema tabel Supabase yang sebenarnya.

---

4. Perbaiki Portal Admin

Portal admin harus mengambil data langsung dari Supabase.

Contoh alurnya:

Admin Login
    ↓
Supabase Auth
    ↓
Fetch Orders
    ↓
Supabase Database
    ↓
Tampilkan Orders

Jangan mengambil order dari:

- localStorage
- sessionStorage
- hardcoded JSON
- mock data
- state dari halaman customer

---

5. Pastikan Data Bisa Diakses dari Browser Berbeda

Simulasikan skenario:

Browser A:

Customer checkout
↓
Order masuk Supabase

Browser B:

Admin login
↓
Fetch Supabase
↓
Order muncul

Jika data hanya muncul di browser yang sama tetapi tidak muncul di browser lain, cari penyebabnya.

Prioritaskan pemeriksaan:

1. Apakah INSERT benar-benar masuk ke Supabase?
2. Apakah browser B menggunakan Supabase project yang sama?
3. Apakah query SELECT berjalan?
4. Apakah RLS memblokir SELECT?
5. Apakah policy SELECT sudah benar?
6. Apakah auth user memiliki permission yang benar?
7. Apakah frontend mengalami error saat fetch?

Jangan menyelesaikan masalah dengan mematikan security secara sembarangan.

---

6. Periksa RLS dan Policies

Periksa RLS pada tabel yang digunakan untuk orders.

Pastikan customer/admin mendapatkan akses sesuai kebutuhan aplikasi.

Untuk portal admin, hanya user yang memiliki hak admin yang boleh membaca atau mengubah data admin.

Jangan menggunakan policy:

USING (true)

atau membuka seluruh database secara publik hanya agar error hilang.

Gunakan policy yang aman dan sesuai dengan authentication yang sudah ada.

---

7. Realtime

Jika portal admin memang membutuhkan update order secara realtime, gunakan Supabase Realtime.

Alurnya:

Customer membuat order
        ↓
Supabase Database
        ↓
Realtime event
        ↓
Admin Dashboard
        ↓
Order baru muncul

Jika realtime belum diperlukan atau implementasinya bermasalah, pastikan minimal dashboard melakukan fetch data terbaru dengan benar.

Jangan menambahkan kompleksitas realtime jika belum dibutuhkan.

---

Perbaikan UX

Pastikan:

- loading state saat mengambil order
- empty state jika belum ada order
- error state jika Supabase gagal
- success state setelah checkout berhasil
- tombol tidak bisa diklik berkali-kali saat submit
- tidak terjadi duplicate order akibat double click
- order terbaru muncul paling atas

---

Keamanan

Jangan:

- memasukkan service role key ke frontend
- memasukkan password/database credentials ke repository
- mematikan RLS hanya untuk menghilangkan error
- membuat database publik tanpa policy
- menyimpan source of truth order di localStorage

Gunakan Supabase Auth dan RLS sesuai kebutuhan.

---

Optimasi

Karena Freonix harus tetap ringan, jangan melakukan refactor besar yang tidak diperlukan.

Hindari:

- request Supabase berulang tanpa alasan
- polling terlalu sering
- fetch seluruh database jika hanya membutuhkan data tertentu
- dependency tambahan yang tidak diperlukan

Gunakan query yang efisien dan hanya ambil kolom/data yang memang diperlukan.

---

Aturan Penting

Sebelum mengubah kode:

1. Audit project.
2. Identifikasi file yang berkaitan dengan Supabase.
3. Identifikasi tabel dan schema yang digunakan.
4. Identifikasi penyebab masalah.
5. Baru lakukan perubahan.

Jangan membuat asumsi tentang nama tabel atau kolom jika bisa diperiksa langsung dari project.

Jangan mengganti arsitektur hanya karena menemukan error kecil.

---

Hasil Akhir yang Harus Dicapai

Setelah perbaikan, sistem harus bekerja seperti ini:

                 SUPABASE
              ┌─────────────┐
              │ Auth        │
              │ Database    │
              │ RLS         │
              └──────┬──────┘
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
   CUSTOMER WEBSITE       ADMIN DASHBOARD
          │                     │
          ↓                     ↓
       CHECKOUT              ORDERS
          │                     │
          └──────→ ORDERS ←─────┘

Test minimal:

Test 1

Customer checkout dari browser A.

Expected:

Order berhasil dibuat
↓
Data tersimpan di Supabase

Test 2

Buka portal admin dari browser B.

Expected:

Admin login
↓
Order yang dibuat browser A muncul

Test 3

Buat order kedua.

Expected:

Order kedua muncul di database
↓
Admin dapat melihat order terbaru

Test 4

Refresh admin dashboard.

Expected:

Data tetap ada

Test 5

Logout dan login kembali.

Expected:

Data order tetap dapat diakses sesuai permission admin

---

Output Setelah Selesai

Setelah melakukan perubahan, berikan laporan singkat:

1. File yang diubah
2. Masalah utama yang ditemukan
3. Perubahan yang dilakukan
4. Perubahan pada Supabase/RLS jika ada
5. Cara testing
6. Hasil testing
7. Jika masih ada error, tampilkan error sebenarnya dan jelaskan penyebabnya

Jangan mengklaim selesai jika belum benar-benar melakukan testing.

Batasan

- Tetap gunakan Supabase.
- Jangan migrasi ke Firebase.
- Jangan migrasi ke backend lain.
- Jangan hapus fitur existing yang tidak berkaitan.
- Jangan melakukan rewrite project secara keseluruhan.
- Prioritaskan perbaikan yang paling kecil, aman, dan terukur.
