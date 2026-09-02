import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChefHat, Activity, Info, CheckCircle2, Sparkles, Droplets } from 'lucide-react';

const productDetails = {
  1: {
    name: 'Kwek Kwek',
    image: '/produk-kwek-kwek.jpg',
    desc: 'Jajanan kaki lima khas Filipina berupa telur puyuh rebus yang dibalut adonan tepung berwarna oranye dan digoreng hingga renyah.',
    price: 'Rp 2.000 / pcs',
    ingredients: ['Telur puyuh (direbus & dikupas)', 'Tepung terigu & maizena', 'Pewarna makanan oranye alami (Annatto)', 'Garam, kaldu bubuk, & merica', 'Air mineral', 'Minyak goreng'],
    tools: ['Mangkuk adonan', 'Pengaduk (Whisk)', 'Wajan penggorengan', 'Saringan minyak', 'Tusuk sate bambu', 'Spatula/Sutil'],
    nutrition: [
      { label: 'Kalori', value: '150 kkal' },
      { label: 'Protein', value: '6 g' },
      { label: 'Lemak', value: '10 g' },
      { label: 'Karbohidrat', value: '8 g' }
    ]
  },
  2: {
    name: 'Chicken Adobo',
    image: '/produk-chicken-adobo.jpg',
    desc: 'Hidangan nasional Filipina berupa potongan ayam yang dimasak perlahan dalam campuran kecap asin, cuka, bawang putih, dan merica hitam hingga meresap sempurna.',
    price: 'Rp 15.000 / porsi',
    ingredients: ['Daging ayam segar (potong sedang)', 'Kecap asin pekat', 'Cuka putih / cuka aren', 'Bawang putih (geprek kasar)', 'Biji lada hitam utuh', 'Daun salam kering (Bay leaves)', 'Sedikit gula pasir', 'Air & Minyak goreng'],
    tools: ['Pisau daging', 'Talenan tebal', 'Panci atau Wajan tertutup', 'Spatula kayu', 'Mangkuk marinasi'],
    nutrition: [
      { label: 'Kalori', value: '250 kkal' },
      { label: 'Protein', value: '25 g' },
      { label: 'Lemak', value: '12 g' },
      { label: 'Karbohidrat', value: '5 g' }
    ]
  },
  3: {
    name: 'Halo-Halo',
    image: '/produk-halo-halo.jpg',
    desc: 'Pencuci mulut es serut ikonik dari Filipina dengan campuran ube (ubi ungu), susu evaporasi, dan aneka isian menyegarkan.',
    price: 'Rp 5.000 / cup',
    ingredients: ['Es batu kristal', 'Susu evaporasi cair', 'Ube Halaya (selai ubi ungu)', 'Kacang merah manis', 'Nata de coco & jelly', 'Irisan pisang raja matang', 'Nangka manis', 'Es krim Ube (opsional)', 'Gula aren cair'],
    tools: ['Mesin penyerut es / blender es', 'Gelas cup plastik saji', 'Sendok panjang', 'Wadah penyimpanan isian'],
    nutrition: [
      { label: 'Kalori', value: '300 kkal' },
      { label: 'Protein', value: '8 g' },
      { label: 'Lemak', value: '6 g' },
      { label: 'Karbohidrat', value: '55 g' }
    ]
  }
};

export default function ProductDetail() {
  const { id } = useParams();
  const product = productDetails[id];

  // Scroll to top on mount for smooth experience
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!product) {
    return (
      <div className="pt-28 text-center min-h-[70vh]">
        <h2 className="text-2xl font-bold text-[#5D3A29]">Produk tidak ditemukan</h2>
        <Link to="/products" className="text-[#8B5742] hover:underline mt-4 inline-block font-medium">Kembali ke Menu Produk</Link>
      </div>
    );
  }

  return (
    <div className="pb-16 bg-[#FAFAF9] min-h-[80vh] relative overflow-hidden opacity-0 animate-fade-in">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#DDA15E]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#8B5742]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 pt-4">
        <Link 
          to="/products" 
          className="inline-flex items-center gap-2 text-[#8B5742] font-bold hover:text-white hover:bg-[#8B5742] transition-all duration-300 mb-8 bg-white shadow-sm border border-[#8B5742]/20 px-5 py-2.5 rounded-full text-sm hover:shadow-md opacity-0 animate-slide-right group"
          style={{ animationDelay: '0.1s' }}
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Kembali ke Menu
        </Link>
        
        <div className="bg-white/80 backdrop-blur-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/50 opacity-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* Gambar Produk */}
          <div className="md:w-5/12 relative min-h-[350px] group overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 opacity-0 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <Sparkles size={16} className="text-[#DDA15E]" />
                <span className="text-[#DDA15E] text-xs font-bold uppercase tracking-widest">Premium Taste</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-wide drop-shadow-lg">{product.name}</h1>
              <span className="inline-block bg-gradient-to-r from-[#DDA15E] to-[#8B5742] text-white px-5 py-2 rounded-full text-sm font-black shadow-lg animate-float">
                {product.price}
              </span>
            </div>
          </div>

          {/* Konten Detail */}
          <div className="md:w-7/12 p-6 md:p-10 relative">
            <Droplets className="absolute top-10 right-10 text-stone-100 w-32 h-32 -z-10 rotate-12 opacity-50" />
            
            {/* Deskripsi */}
            <div className="mb-10 opacity-0 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <h3 className="text-xl font-bold text-[#5D3A29] mb-4 flex items-center gap-2">
                <Info size={22} className="text-[#DDA15E]" /> Deskripsi Singkat
              </h3>
              <p className="text-stone-600 leading-relaxed bg-gradient-to-br from-stone-50 to-white p-5 rounded-2xl border border-stone-100 shadow-sm relative overflow-hidden">
                <span className="absolute left-0 top-0 w-1 h-full bg-[#DDA15E]"></span>
                {product.desc}
              </p>
            </div>

            {/* Nilai Gizi */}
            <div className="mb-10 opacity-0 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <h3 className="text-xl font-bold text-[#5D3A29] mb-4 flex items-center gap-2">
                <Activity size={22} className="text-[#DDA15E]" /> Estimasi Nilai Gizi
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {product.nutrition.map((item, i) => (
                  <div key={i} className="bg-white border border-stone-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md hover:border-[#DDA15E]/50 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="text-[10px] text-stone-400 font-bold mb-2 uppercase tracking-widest group-hover:text-[#8B5742] transition-colors">{item.label}</div>
                    <div className="text-xl font-black text-[#8B5742]">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alat dan Bahan */}
            <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.7s' }}>
              <h3 className="text-xl font-bold text-[#5D3A29] mb-4 flex items-center gap-2">
                <ChefHat size={22} className="text-[#DDA15E]" /> Alat & Bahan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-stone-50/50 p-6 rounded-2xl border border-stone-100">
                <div>
                  <h4 className="font-bold text-[#8B5742] mb-4 flex items-center gap-2 border-b-2 border-[#DDA15E]/30 pb-2 inline-block">
                    Bahan-bahan
                  </h4>
                  <ul className="space-y-3">
                    {product.ingredients.map((item, i) => (
                      <li key={i} className="text-sm text-stone-600 flex items-start gap-3 hover:translate-x-1 transition-transform">
                        <CheckCircle2 size={18} className="text-[#DDA15E] shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-[#8B5742] mb-4 flex items-center gap-2 border-b-2 border-[#DDA15E]/30 pb-2 inline-block">
                    Alat Produksi
                  </h4>
                  <ul className="space-y-3">
                    {product.tools.map((item, i) => (
                      <li key={i} className="text-sm text-stone-600 flex items-start gap-3 hover:translate-x-1 transition-transform">
                        <CheckCircle2 size={18} className="text-[#DDA15E] shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
