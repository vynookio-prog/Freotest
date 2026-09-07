FIX BUG SINKRONISASI PORTAL ADMIN

Saya memiliki website checkout dan portal admin yang menggunakan Supabase sebagai database.

BUG YANG TERJADI

Saat saya melakukan checkout dari website:

1. Saya membuat pesanan baru.
2. Pesanan berhasil masuk dan langsung muncul di portal admin.
3. Namun ketika saya membuka portal admin tersebut menggunakan browser lain dan login menggunakan akun admin yang sama, data pesanan tidak muncul / database terlihat kosong.
4. Artinya, data atau tampilan portal admin kemungkinan masih bergantung pada browser/session tertentu dan belum benar-benar mengambil data secara konsisten dari Supabase.

TUGAS UTAMA

Audit dan perbaiki masalah ini secara langsung di project.

JANGAN membuat solusi dummy dan JANGAN menggunakan localStorage/sessionStorage sebagai sumber utama data pesanan.

Pastikan arsitektur akhirnya seperti ini:

Website Checkout
→ Supabase Database
→ Portal Admin
→ Semua browser/session admin dapat membaca data yang sama

YANG HARUS DIAUDIT

Periksa seluruh alur data orders, terutama:

- proses INSERT order dari website checkout
- tabel "orders"
- query SELECT orders di portal admin
- filter berdasarkan "user_id", "admin_id", email, atau session
- Supabase Auth
- Supabase RLS
- RLS SELECT policy
- konfigurasi Supabase client
- penggunaan "localStorage"
- penggunaan "sessionStorage"
- state management yang mungkin hanya tersimpan di browser
- caching
- realtime/subscription jika digunakan
- mekanisme refresh/fetch data ketika portal admin dibuka
- apakah ada data yang hanya disimpan di state frontend tanpa persist ke database

AUTHENTICATION

Perhatikan bahwa:

Browser A dan Browser B dapat memiliki Supabase session yang berbeda walaupun login menggunakan akun admin yang sama.

Jangan membuat sistem yang menganggap session/browser tertentu sebagai sumber identitas data orders.

Gunakan autentikasi dan authorization yang benar berdasarkan akun admin yang login.

RLS

Periksa RLS pada tabel orders.

Pastikan akun admin yang memiliki akses dapat melakukan SELECT terhadap order yang memang menjadi hak aksesnya.

Jika RLS menjadi penyebab data tidak muncul di browser kedua, perbaiki policy-nya secara aman.

JANGAN mematikan RLS secara sembarangan hanya untuk membuat data muncul.

Gunakan policy yang sesuai dengan struktur role/admin yang sudah ada di project.

DATA SOURCE

Pastikan portal admin mengambil data orders langsung dari Supabase.

Contoh pola yang diharapkan:

const { data, error } = await supabase
  .from('orders')
  .select('*')

Sesuaikan dengan struktur project yang sebenarnya.

Jangan mengganti query secara membabi buta. Pahami dahulu bagaimana authorization dan struktur tabel yang sudah digunakan.

LOCAL STORAGE

Cari apakah orders atau data database disimpan seperti:

localStorage.setItem(...)
sessionStorage.setItem(...)

atau hanya berada di state frontend.

Jika ditemukan, jangan menjadikan browser storage sebagai sumber utama data orders.

Browser storage hanya boleh digunakan untuk kebutuhan seperti preferensi UI, bukan sebagai database utama.

HASIL YANG DIHARAPKAN

Setelah diperbaiki:

Browser A

- Login sebagai admin
- Membuka portal
- Order muncul

Browser B

- Login menggunakan akun admin yang sama
- Membuka portal
- Order yang sama juga muncul

Setelah checkout baru

- Order tersimpan di Supabase
- Portal admin dapat mengambil order tersebut
- Tidak bergantung pada browser tempat checkout dilakukan
- Tidak bergantung pada localStorage/sessionStorage browser tertentu

PENTING

Sebelum mengubah kode:

1. Audit struktur project terlebih dahulu.
2. Temukan root cause sebenarnya.
3. Jelaskan secara singkat file mana yang bermasalah dan kenapa.
4. Kemudian implementasikan fix langsung.
5. Jangan merusak fitur checkout, authentication, atau fitur admin yang sudah berjalan.
6. Jangan membuat tabel/database baru jika tidak diperlukan.
7. Pertahankan struktur database yang sudah ada jika masih valid.

TESTING

Setelah implementasi, lakukan pengecekan terhadap:

- checkout → order masuk database
- admin browser A → order muncul
- admin browser B → order muncul
- logout/login kembali → order tetap muncul
- refresh halaman → order tetap muncul
- tidak ada ketergantungan terhadap localStorage/sessionStorage untuk data orders
- tidak ada error Supabase/RLS di console

Fokus utama: buat portal admin benar-benar membaca data orders dari Supabase secara konsisten di berbagai browser/session.
