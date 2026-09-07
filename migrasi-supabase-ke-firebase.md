# MIGRASI BACKEND SUPABASE → FIREBASE

## TUJUAN

Migrasikan seluruh backend/database project dari Supabase ke Firebase tanpa mengubah tampilan, UI/UX, routing, maupun fitur frontend yang sudah berjalan.

Gunakan Firebase Spark Plan (Free) dan jangan menambahkan layanan berbayar atau konfigurasi yang berpotensi menyebabkan billing tanpa persetujuan.

---

## ATURAN UTAMA

1. Jangan mengubah desain atau UI website.
2. Jangan menghapus fitur yang sudah ada.
3. Jangan membuat ulang frontend dari nol.
4. Pertahankan semua routing dan halaman yang sudah tersedia.
5. Migrasikan fungsi Supabase ke Firebase secara bertahap dan aman.
6. Jangan meninggalkan dependency Supabase yang sudah tidak digunakan.
7. Jangan membuat database dummy.
8. Gunakan data Firebase yang sebenarnya.
9. Semua konfigurasi Firebase harus menggunakan environment variables.
10. Jangan hardcode credential, service account, atau secret ke source code.
11. Pastikan website customer dan portal admin menggunakan Firebase project/database yang sama.
12. Jangan menghapus kode Supabase sebelum seluruh fungsi yang bergantung padanya berhasil dipindahkan.

---

# 1. AUDIT PROJECT TERLEBIH DAHULU

Sebelum melakukan perubahan:

- Scan seluruh repository.
- Identifikasi semua penggunaan Supabase.
- Cari Supabase client.
- Cari Supabase Auth.
- Cari database queries.
- Cari select, insert, update, delete.
- Cari realtime/subscription.
- Cari storage.
- Cari RPC/function.
- Cari environment variables Supabase.
- Cari middleware/auth guard.
- Cari admin authentication.
- Cari customer authentication.
- Identifikasi seluruh tabel/database schema yang digunakan.
- Identifikasi hubungan antar tabel.
- Identifikasi semua halaman/komponen yang membaca atau menulis data Supabase.

Buat mapping berdasarkan schema project yang sebenarnya:

SUPABASE → FIREBASE

products → products
categories → categories
orders → orders
order_items → order_items
customers → customers
payments → payments

Jangan menebak schema.

Gunakan schema dan query yang benar-benar ditemukan di repository.

---

# 2. PILIH FIREBASE

Gunakan:

- Firebase Authentication
- Cloud Firestore
- Firebase Storage jika project menggunakan file/image storage
- Firebase Realtime Database hanya jika benar-benar diperlukan

Gunakan Cloud Firestore sebagai database utama.

Jangan menggunakan layanan Firebase berbayar.

---

# 3. SETUP FIREBASE

Gunakan Firebase Web SDK.

Gunakan environment variables, misalnya:

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

Sesuaikan prefix environment variable dengan framework project yang sebenarnya.

Jangan memasukkan service-account JSON ke frontend.

Buat Firebase initialization yang terpusat dan rapi.

Contoh struktur:

src/
└── lib/
    └── firebase/
        ├── config
        ├── auth
        └── firestore

Sesuaikan struktur dengan project yang sudah ada.

---

# 4. MIGRASI DATABASE

Migrasikan seluruh data yang sebelumnya berada di Supabase ke Firestore.

Pertahankan struktur data dan relasi semirip mungkin.

Contoh:

products/
  productId
    name
    description
    price
    image
    categoryId
    stock
    active
    createdAt

categories/
  categoryId
    name
    slug
    image

orders/
  orderId
    customerId
    customerName
    total
    status
    paymentStatus
    createdAt

order_items/
  itemId
    orderId
    productId
    productName
    quantity
    price

Jangan menggunakan struktur contoh ini secara membabi buta.

Gunakan struktur sesuai schema aktual project.

Jika data Supabase perlu diekspor terlebih dahulu, buat proses migrasi yang aman dan dapat diulang.

---

# 5. AUTHENTICATION

Ganti Supabase Auth dengan Firebase Authentication.

Pertahankan flow login/register yang sudah ada.

Pastikan:

- Login tetap berfungsi.
- Register tetap berfungsi.
- Logout tetap berfungsi.
- Session tetap tersimpan.
- User tetap bisa mengakses halaman yang sesuai.
- Admin tetap memiliki akses admin.
- Customer tidak bisa mengakses halaman admin.

Jika project menggunakan role:

admin
customer

Pertahankan konsep tersebut.

Gunakan mekanisme role Firebase yang aman.

Jangan hanya mengandalkan hide/show tombol atau halaman di frontend untuk keamanan.

---

# 6. ADMIN PORTAL

Admin portal harus menggunakan Firebase project yang sama dengan website customer.

Arsitektur:

CUSTOMER WEBSITE
       |
       v
    FIREBASE
       ^
       |
  ADMIN PORTAL

Ketika customer membuat order:

Customer
   ↓
Checkout
   ↓
Firebase Firestore
   ↓
orders
   ↓
Admin Portal

Admin harus dapat melihat order yang dibuat dari website customer.

Pastikan tidak ada database terpisah antara website customer dan admin portal.

---

# 7. PRODUCTS

Migrasikan seluruh operasi produk dari Supabase ke Firestore:

- Get products
- Get product by ID
- Create product
- Update product
- Delete product
- Update stock
- Activate/deactivate product
- Category relation
- Product image jika ada

Pastikan perubahan produk dari admin dapat terlihat di website customer.

---

# 8. ORDERS

Migrasikan seluruh sistem order.

Customer harus dapat:

Create Order
↓
Save Order
↓
Save Order Items
↓
Admin melihat order

Admin harus dapat:

View Orders
View Order Detail
Update Order Status
Update Payment Status

Pertahankan status order yang digunakan project saat ini.

Jangan mengubah business logic tanpa alasan.

---

# 9. REALTIME

Jika project menggunakan Supabase Realtime, implementasikan padanan Firebase yang sesuai.

Contoh:

Customer membuat order
        ↓
Firestore berubah
        ↓
Admin Portal menerima perubahan
        ↓
Order muncul tanpa refresh manual

Pastikan realtime listener tidak dibuat berulang-ulang sehingga menyebabkan memory leak atau request berlebihan.

Cleanup listener ketika component unmount.

---

# 10. STORAGE

Jika Supabase Storage digunakan:

Migrasikan image/file storage ke Firebase Storage.

Pertahankan:

- Upload
- Delete
- URL/reference
- Preview
- Product image

Jangan menyimpan file binary langsung di Firestore.

---

# 11. SECURITY RULES

Buat Firestore Security Rules berdasarkan role dan kebutuhan aktual aplikasi.

Minimal:

Customer:
- dapat membaca data public yang memang diperlukan
- dapat membuat order
- tidak dapat mengubah order milik customer lain
- tidak dapat mengakses data admin

Admin:
- dapat membaca order
- dapat mengubah status order
- dapat mengelola products
- dapat mengelola categories

JANGAN gunakan:

allow read, write: if true;

Jangan membuat database terbuka ke publik hanya agar development lebih mudah.

---

# 12. HAPUS SUPABASE SETELAH MIGRASI BERHASIL

Setelah seluruh fitur Firebase berjalan:

- Hapus import Supabase yang tidak digunakan.
- Hapus Supabase client.
- Hapus dependency Supabase jika sudah tidak digunakan.
- Hapus environment variable Supabase yang tidak diperlukan.
- Hapus helper/query Supabase yang sudah digantikan Firebase.

Kemudian lakukan pencarian ulang:

supabase
createClient
@supabase
SUPABASE_URL
SUPABASE_ANON_KEY

Pastikan tidak ada dependency aktif yang tertinggal.

---

# 13. TESTING

Setelah migrasi selesai, lakukan testing menyeluruh.

## CUSTOMER

Test:

Register
Login
Logout
Browse products
View product
Checkout
Create order

## ADMIN

Test:

Login
View products
Create product
Edit product
Delete product
View orders
View order detail
Update order status
Update payment status
Logout

## SINKRONISASI

Test:

Browser A
Customer creates order
        ↓
Firebase
        ↓
Browser B
Admin opens portal
        ↓
Order harus terlihat

Test juga menggunakan browser/device berbeda dengan akun yang sama.

---

# 14. PERFORMANCE

Jangan mengambil seluruh collection Firestore jika hanya membutuhkan sebagian data.

Gunakan:

- Query terfilter
- Pagination jika diperlukan
- Listener realtime hanya pada data yang diperlukan
- Hindari listener global
- Hindari request berulang
- Cache data yang aman untuk dicache

Pastikan migrasi Firebase tidak membuat website menjadi lebih berat.

---

# 15. ERROR HANDLING

Tambahkan error handling yang jelas untuk:

- Firebase connection error
- Authentication error
- Firestore permission denied
- Failed query
- Failed create order
- Failed update order
- Failed upload
- Invalid data

Jangan menampilkan error teknis Firebase secara mentah kepada customer jika tidak diperlukan.

---

# 16. ENVIRONMENT

Pastikan konfigurasi lokal dan production dapat berjalan.

Buat/update:

.env
.env.example

Jangan commit credential atau secret yang seharusnya privat.

Jika project menggunakan Vercel, pastikan environment variables Firebase dapat dikonfigurasi untuk deployment production.

---

# 17. FINAL CHECK

Sebelum menyatakan migrasi selesai:

[ ] Firebase sudah terhubung
[ ] Firestore berjalan
[ ] Authentication berjalan
[ ] Customer login berjalan
[ ] Admin login berjalan
[ ] Products berjalan
[ ] Categories berjalan
[ ] Checkout berjalan
[ ] Orders tersimpan
[ ] Order items tersimpan
[ ] Admin dapat melihat orders
[ ] Admin dapat mengubah status
[ ] Realtime berjalan jika diperlukan
[ ] Storage berjalan jika diperlukan
[ ] Security Rules sudah diterapkan
[ ] Tidak ada Supabase aktif
[ ] Tidak ada error build
[ ] Tidak ada error console yang kritis
[ ] Production build berhasil
[ ] Website customer dan admin menggunakan Firebase project yang sama

---

# HASIL AKHIR YANG DIINGINKAN

             CUSTOMER WEBSITE
                    |
                    v
              +-----------+
              | FIREBASE  |
              +-----------+
              | Auth      |
              | Firestore |
              | Storage   |
              | Realtime  |
              +-----+-----+
                    |
                    v
              ADMIN PORTAL

PRIORITAS UTAMA:

1. Jangan merusak website yang sudah ada.
2. Migrasi fungsi Supabase secara lengkap.
3. Gunakan Firebase Spark Plan / Free.
4. Pastikan customer dan admin menggunakan database yang sama.
5. Pastikan data order benar-benar tersimpan dan dapat dilihat dari browser/device berbeda.
6. Jangan membuat workaround atau mock data untuk menutupi masalah backend.
7. Setelah semuanya terverifikasi, baru bersihkan kode Supabase.
8. Setelah selesai, tampilkan ringkasan file yang diubah.
9. Tampilkan struktur Firebase yang dibuat.
10. Tampilkan Security Rules yang digunakan.
11. Tampilkan environment variables yang diperlukan.
12. Tampilkan hasil testing.
EOF
