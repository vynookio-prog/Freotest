FREONIX CHECKOUT BUG — SUPABASE RLS

Supabase database sudah dikonfigurasi dan diverifikasi.

Table:
public.orders

RLS policy yang aktif:
- orders_checkout_insert → INSERT → public → WITH CHECK (true)
- orders_admin_select → SELECT → authenticated
- orders_admin_update → UPDATE → authenticated
- orders_admin_delete → DELETE → authenticated

GRANT INSERT untuk anon dan authenticated juga sudah aktif.

Masalah:
Saat customer melakukan checkout dari website, muncul:
"new row violates row-level security policy for table orders"

Tolong audit dan perbaiki SELURUH FLOW INSERT ORDER di frontend.

PENTING:
1. Jangan mengubah atau menghapus tabel Supabase.
2. Jangan mengubah RLS policy lagi.
3. Jangan menggunakan service_role key di frontend.
4. Pastikan Supabase client menggunakan project URL dan publishable/anon key yang benar.
5. Pastikan proses checkout melakukan:
   supabase.from('orders').insert(...)
6. Pastikan tidak ada kode yang memaksa user harus authenticated sebelum INSERT.
7. Pastikan payload INSERT sesuai dengan kolom tabel orders:
   id
   name
   kelas
   phone
   items
   total_harga
   payment_method
   payment_status
   order_status
   payment_proof
   payment_proof_url
   notes
   order_time
   history
   verified_at
8. Cari semua file yang menangani checkout/order creation dan identifikasi penyebab RLS error.
9. Perbaiki langsung implementasinya.
10. Setelah diperbaiki, jalankan build/test dan pastikan tidak ada error TypeScript/runtime.

Jangan membuat sistem baru. Pertahankan UI dan flow checkout yang sudah ada.
