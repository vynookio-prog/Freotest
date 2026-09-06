Tolong perbaiki masalah routing/deep-link pada website ini.

Masalah:
- Saat membuka website dari root `/`, website berjalan normal.
- Navigasi ke `/products` dari dalam website juga berjalan normal.
- Tetapi ketika URL `/products` di-refresh langsung, Vercel menampilkan `404: NOT_FOUND`.
- Hal yang sama kemungkinan terjadi pada route lain seperti `/about`, `/gallery`, dll.
- Jangan mengubah desain, UI, data, komponen, atau fitur yang sudah ada.

Tugas:
1. Periksa struktur project dan identifikasi framework/build tool yang digunakan (misalnya React + Vite).
2. Periksa konfigurasi routing yang digunakan.
3. Perbaiki konfigurasi deployment Vercel agar semua client-side routes dapat diakses langsung dan tetap bekerja setelah browser di-refresh.
4. Jika project menggunakan React/Vite SPA, gunakan konfigurasi rewrite Vercel yang sesuai agar request route seperti `/products` diarahkan ke `index.html`.
5. Jangan menggunakan solusi yang mengubah route menjadi hash (`#/products`).
6. Jangan membuat workaround di sisi UI.
7. Pastikan route `/products` tetap dapat diakses dengan URL:
   https://freotest.vercel.app/products
   baik melalui navigasi internal maupun dengan membuka URL tersebut langsung.
8. Setelah perubahan selesai, cek konfigurasi agar tidak menyebabkan asset seperti JS, CSS, image, atau file statis ikut diarahkan secara salah.
9. Tampilkan file yang diubah dan jelaskan secara singkat apa yang diperbaiki.

Prioritas utama: perbaiki 404 saat refresh/direct access pada route client-side tanpa mengubah tampilan website yang sudah ada.
