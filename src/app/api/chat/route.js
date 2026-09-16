import { NextResponse } from 'next/server';
import { insforge, isInsforgeConfigured } from '../../../lib/insforge';
import { INITIAL_DB } from '../../../lib/db';

// Candidate models in order of priority (Gemini 3.8 Flash via gemini-flash-latest, with resilient fallbacks)
const CANDIDATE_MODELS = [
  'gemini-flash-latest',
  'gemini-3.1-flash-lite-preview',
  'gemini-flash-lite-latest'
];

async function getProductsContext() {
  try {
    if (isInsforgeConfigured) {
      const { data, error } = await insforge
        .database
        .from('products')
        .select('*')
        .eq('status', 'active');
      
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(p => ({
          name: p.name,
          price: Number(p.price) || 0,
          unit: p.unit || 'porsi',
          stock: p.stock ?? 0,
          description: p.description || p.desc || '',
          nutrition: Array.isArray(p.nutrition) ? p.nutrition : [],
          ingredients: Array.isArray(p.ingredients) ? p.ingredients : []
        }));
      }
    }
  } catch (err) {
    console.warn('API Chat: Gagal ambil produk dari InsForge, menggunakan INITIAL_DB:', err.message);
  }

  // Fallback ke data template
  return (INITIAL_DB.products || []).filter(p => p.status === 'active').map(p => ({
    name: p.name,
    price: p.price,
    unit: p.unit || 'porsi',
    stock: p.stock,
    description: p.desc || p.description,
    nutrition: p.nutrition || [],
    ingredients: p.ingredients || []
  }));
}

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'GEMINI_API_KEY belum dikonfigurasi di server (.env.local).' 
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const userMessage = (body.message || '').trim();
    const clientHistory = Array.isArray(body.history) ? body.history : [];

    if (!userMessage) {
      return NextResponse.json(
        { success: false, error: 'Pesan tidak boleh kosong.' },
        { status: 400 }
      );
    }

    // Ambil data menu dan toko terkini
    const products = await getProductsContext();
    const storeName = INITIAL_DB.settings?.storeName || 'FREONIX XII-F1';
    const eventDate = INITIAL_DB.settings?.eventDateDisplay || '22 September 2026';

    const productsSummary = products.map(p => {
      const nut = (p.nutrition || []).map(n => `${n.label}: ${n.value}`).join(', ');
      const ing = (p.ingredients || []).slice(0, 5).join(', ');
      return `- **${p.name}** (Rp ${p.price.toLocaleString('id-ID')} / ${p.unit})
  *Deskripsi*: ${p.description}
  *Nutrisi*: ${nut || 'Belum tercatat'}
  *Bahan Utama*: ${ing || 'Bahan segar'}
  *Stok Tersedia*: ${p.stock > 0 ? `${p.stock} ${p.unit}` : 'Habis'}`;
    }).join('\n\n');

    const systemInstruction = `Kamu adalah "Asisten AI FREONIX", chatbot pemandu kuliner dan asisten sains resmi untuk proyek kokurikuler kelas XII-F1 Sains ("FREONIX").
Slogan kelas: "Future Ready Twelve One and Only".

TUGAS UTAMA:
1. Menyapa dan membantu pengunjung memahami menu sajian kuliner khas Filipina yang dijual oleh kelas XII-F1 Sains.
2. Memberikan rekomendasi menu berdasarkan preferensi pengunjung (misalnya: menu favorit, menu tinggi protein, camilan ringan, atau yang ramah di kantong).
3. Menjelaskan nilai gizi, kalori, dan sains di balik masakan (contoh: proses karamelisasi gula dan kalium pisang kepok pada Turon; asam laurat dan elektrolit kelapa muda berpadu flavonoid kakao pada Buko Coklat; kandungan protein telur puyuh dan pigmen alami annatto pada Kwek Kwek).
4. Menjelaskan tata cara pemesanan / pre-order:
   - Hari H Acara: ${eventDate}.
   - Tempat: Stan FREONIX Kelas XII-F1 Sains.
   - Cara Pesan: Klik menu "Pesan Sekarang" atau kunjungi halaman /checkout pada website ini.
   - Pembayaran: Menerima QRIS (upload bukti transfer) atau Tunai (Cash di stan).

DATA MENU TERKINI DI DATABASE:
${productsSummary}

PANDUAN GAYA JAWABAN:
- Bahasa: 100% Bahasa Indonesia yang santun, alami, ramah, dan edukatif khas pelajar sains XII-F1.
- FORMAT TEKS & TIPOGRAFI:
  1. DILARANG menggunakan istilah campur bahasa Inggris aneh seperti "(times)", "x times", atau simbol LaTeX "\\times".
  2. Untuk menyebutkan jumlah atau porsi, gunakan kata bahasa Indonesia yang wajar seperti "1 porsi", "2 buah", "1 cup", atau "3 kali".
  3. Untuk penomoran urutan/langkah, SELALU gunakan format angka standar seperti "1. ", "2. ", "3. " (JANGAN pernah gunakan format "1/", "2/" atau sejenisnya).
  4. Gunakan cetak tebal markdown secara benar (**nama menu**, **harga**, **poin penting**) dan pastikan selalu tertutup berpasangan (**...**).
- Format: Buat jawaban terstruktur, rapi, dan mudah dibaca (gunakan bullet points, bold untuk nama menu/harga). Jangan membuat teks terlalu panjang atau membosankan.
- Sisipkan sedikit wawasan sains yang relevan bila ditanya soal nutrisi atau cara pembuatan.
- Jika pengguna ingin memesan, sarankan mereka untuk menekan tombol "Pesan Sekarang" atau menu Checkout di navigasi atas.
- Jika ada pertanyaan di luar topik kuliner FREONIX, kelas XII-F1, gizi, atau sains makanan, arahkan kembali dengan sopan ke topik FREONIX.`;

    // Format riwayat chat untuk Gemini API
    const formattedContents = [];
    
    // Sertakan maksimal 6 pesan terakhir untuk menjaga efisiensi konteks
    const recentHistory = clientHistory.slice(-6);
    for (const h of recentHistory) {
      if (h.role === 'user' || h.role === 'model') {
        formattedContents.push({
          role: h.role,
          parts: [{ text: h.text || '' }]
        });
      }
    }

    // Tambahkan pesan pengguna saat ini
    formattedContents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    // Panggil model Gemini dengan fallback otomatis
    let lastError = null;
    let replyText = null;
    let usedModel = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            contents: formattedContents,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          }),
        });

        const data = await response.json();

        if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          replyText = data.candidates[0].content.parts[0].text;
          usedModel = model;
          break;
        } else {
          lastError = data?.error?.message || `Model ${model} tidak mengembalikan teks`;
          console.warn(`Gagal memanggil model ${model}:`, data?.error || data);
        }
      } catch (err) {
        lastError = err.message;
        console.warn(`Exception saat memanggil model ${model}:`, err);
      }
    }

    if (!replyText) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Gagal mendapatkan respon dari AI: ${lastError || 'Layanan sedang sibuk'}. Silakan coba beberapa saat lagi.` 
        },
        { status: 502 }
      );
    }

    // Sanitasi otomatis dari sisa relic teks LaTeX atau typo
    const cleanedReply = replyText
      .replace(/(\d+)\s*\/\s*\(times\)/gi, '$1x')
      .replace(/\\times/gi, 'x')
      .replace(/\(times\)/gi, 'kali')
      .replace(/^(\d+)\s*\/\s+/gm, '$1. ');

    return NextResponse.json({
      success: true,
      reply: cleanedReply,
      model: usedModel
    });

  } catch (err) {
    console.error('Server error di /api/chat:', err);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal server.' },
      { status: 500 }
    );
  }
}
