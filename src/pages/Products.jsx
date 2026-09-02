import React from 'react';
import { ShoppingBag, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Products() {
  const products = [
    {
      id: 1,
      name: 'Kwek Kwek',
      price: 'Rp 2.000 / pcs',
      status: 'PO Buka',
      desc: 'Jajanan kaki lima khas Filipina berupa telur puyuh rebus yang dibalut adonan tepung berwarna oranye dan digoreng hingga renyah.',
      image: '/produk-kwek-kwek.jpg',
      waLink: 'https://wa.link/kdmsu4'
    },
    {
      id: 2,
      name: 'Chicken Adobo',
      price: 'Rp 15.000 / porsi',
      status: 'PO Buka',
      desc: 'Hidangan nasional Filipina berupa potongan ayam yang dimasak perlahan dalam campuran kecap asin, cuka, bawang putih, dan merica hitam hingga meresap sempurna.',
      image: '/produk-chicken-adobo.jpg',
      waLink: 'https://wa.link/y1k3hz'
    },
    {
      id: 3,
      name: 'Halo-Halo',
      price: 'Rp 5.000 / cup',
      status: 'PO Buka',
      desc: 'Pencuci mulut es serut ikonik dari Filipina dengan campuran ube (ubi ungu), susu evaporasi, dan aneka isian menyegarkan.',
      image: '/produk-halo-halo.jpg',
      waLink: 'https://wa.link/ukep08'
    }
  ];

  const getWhatsAppLink = (waLink, productName) => {
    const message = encodeURIComponent(`Halo, saya ingin memesan produk kuliner FREONIX: ${productName}. Apakah masih bisa di-order?`);
    return `${waLink}?text=${message}`;
  };

  return (
    <section className="py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[#8B5742] font-bold text-xs uppercase tracking-widest block mb-2">
            Katalog Makanan & Minuman
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#5D3A29] mb-4">
            Produk Kokurikuler Khas Filipina
          </h2>
          <p className="text-[#4B5563] text-sm sm:text-base">
            Pilihan hidangan tradisional Filipina yang diolah higienis dan lezat oleh siswa-siswi FREONIX. Pesan sekarang melalui WhatsApp sebelum kuota PO penuh!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((item, index) => (
            <div 
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col group opacity-0 animate-slide-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="relative h-56 w-full overflow-hidden bg-stone-100">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-[#DDA15E] text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                  {item.status}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="text-xl font-bold text-[#5D3A29]">
                      {item.name}
                    </h3>
                    <span className="text-sm font-extrabold text-[#8B5742]">
                      {item.price}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Link 
                    to={`/product/${item.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-stone-100 hover:bg-[#DDA15E]/20 text-[#8B5742] py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-sm border border-[#DDA15E]/30"
                  >
                    <FileText size={16} />
                    Detail & Gizi
                  </Link>
                  <a 
                    href={getWhatsAppLink(item.waLink, item.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#8B5742] hover:bg-[#5D3A29] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-sm"
                  >
                    <ShoppingBag size={16} />
                    Pesan via WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-[#4B5563]">
            * Sistem pemesanan bersifat Pre-Order (PO). Pengiriman atau pengambilan dilakukan sesuai jadwal kegiatan sekolah.
          </p>
        </div>
      </div>
    </section>
  );
}
