import React, { useState, useMemo } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Upload, 
  Check, 
  X, 
  Package, 
  AlertCircle, 
  Plus, 
  Minus, 
  ExternalLink,
  Loader2
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useDb } from '../../utils/useDb';
import { uploadToSupabaseStorage } from '../../utils/supabase';

export default function AdminProducts() {
  const db = useDb();
  const products = useMemo(() => db.getProducts(), [db]);
  const categories = useMemo(() => db.getCategories(), [db]);
  const settings = useMemo(() => db.getSettings(), [db]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formError, setFormError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    categoryId: '',
    price: '',
    discountPrice: '0',
    stock: '20',
    unit: 'porsi',
    status: 'active',
    desc: '',
    image: '',
    waLink: 'https://wa.link/ewddmf'
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormError('');
    setFormData({
      name: '',
      slug: '',
      categoryId: categories[0]?.id || '',
      price: '',
      discountPrice: '0',
      stock: '25',
      unit: 'porsi',
      status: 'active',
      desc: '',
      image: '',
      waLink: 'https://wa.link/ewddmf'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormError('');
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      categoryId: product.categoryId || '',
      price: String(product.price || 0),
      discountPrice: String(product.discountPrice || 0),
      stock: String(product.stock || 0),
      unit: product.unit || 'porsi',
      status: product.status || 'active',
      desc: product.desc || '',
      image: product.image || '',
      waLink: product.waLink || 'https://wa.link/ewddmf'
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      // 1. Coba unggah ke Supabase Storage
      try {
        const sbResult = await uploadToSupabaseStorage(file, 'products');
        if (sbResult.success && sbResult.url) {
          setFormData(prev => ({ ...prev, image: sbResult.url }));
          setIsUploadingImage(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase storage product upload fallback...', err);
      }

      // 2. Unggah ke CDN Litterbox
      const fd = new FormData();
      fd.append('reqtype', 'fileupload');
      fd.append('time', '72h');
      fd.append('fileToUpload', file);

      const res = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
        method: 'POST',
        body: fd
      });

      if (res.ok) {
        const textUrl = (await res.text()).trim();
        if (textUrl.startsWith('http')) {
          setFormData(prev => ({ ...prev, image: textUrl }));
          setIsUploadingImage(false);
          return;
        }
      }

      // 3. Fallback tmpfiles
      const tmpData = new FormData();
      tmpData.append('file', file);
      const tmpRes = await fetch('https://tmpfiles.org/api/v1/upload', { method: 'POST', body: tmpData });
      const json = await tmpRes.json();
      if (json?.data?.url) {
        setFormData(prev => ({ ...prev, image: json.data.url }));
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Gagal mengunggah foto. Anda tetap bisa memasukkan URL gambar secara manual.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Nama produk wajib diisi.');
      return;
    }
    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setFormError('Harga harus berupa angka lebih besar dari 0.');
      return;
    }
    if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      setFormError('Stok tidak boleh negatif.');
      return;
    }

    try {
      if (editingProduct) {
        db.updateProduct(editingProduct.id, {
          name: formData.name.trim(),
          slug: formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-'),
          categoryId: formData.categoryId,
          price: Number(formData.price),
          discountPrice: Number(formData.discountPrice) || 0,
          stock: Number(formData.stock),
          unit: formData.unit,
          status: formData.status,
          desc: formData.desc.trim(),
          image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
          waLink: formData.waLink
        });
      } else {
        db.addProduct({
          name: formData.name.trim(),
          slug: formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-'),
          categoryId: formData.categoryId,
          price: Number(formData.price),
          discountPrice: Number(formData.discountPrice) || 0,
          stock: Number(formData.stock),
          unit: formData.unit,
          status: formData.status,
          desc: formData.desc.trim(),
          image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
          waLink: formData.waLink
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Terjadi kesalahan saat menyimpan produk.');
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Hapus produk "${name}"? Perubahan akan langsung berdampak pada website pelanggan.`)) {
      try {
        db.deleteProduct(id);
      } catch (err) {
        alert(err.message || 'Gagal menghapus produk.');
      }
    }
  };

  const handleQuickStock = (id, delta) => {
    db.adjustStock(id, delta);
  };

  const handleToggleStatus = (product) => {
    const nextStatus = product.status === 'active' ? 'inactive' : 'active';
    db.updateProduct(product.id, { status: nextStatus });
  };

  // Filtered list
  const filteredProducts = useMemo(() => {
    const threshold = settings.lowStockThreshold || 5;

    return products.filter(p => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchDesc = (p.desc || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && p.status !== selectedStatus) {
        return false;
      }

      // Stock status filter
      if (selectedStockStatus === 'in_stock' && (p.stock || 0) <= threshold) return false;
      if (selectedStockStatus === 'low_stock' && ((p.stock || 0) <= 0 || (p.stock || 0) > threshold)) return false;
      if (selectedStockStatus === 'out_of_stock' && (p.stock || 0) > 0) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus, selectedStockStatus, settings]);

  return (
    <AdminLayout title="Manajemen Produk">
      <div className="space-y-6 animate-fade-in">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#5D3A29]">Daftar Produk Kuliner</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Kelola harga, foto, deskripsi, dan stok yang tayang di website FREONIX.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-[0_6px_20px_rgba(139,87,66,0.3)] hover:shadow-[0_8px_25px_rgba(139,87,66,0.45)] transition-all active:scale-95"
          >
            <PlusCircle size={16} /> Tambah Produk Baru
          </button>
        </div>

        {/* Filter Controls Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-4 border border-white/90 shadow-sm flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama produk atau deskripsi..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-white/90 bg-white/80 text-xs shadow-2xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 placeholder:text-stone-400"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-44 px-3 py-2.5 rounded-2xl border border-white/90 bg-white/80 text-xs shadow-2xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-[#5D3A29] font-medium"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-36 px-3 py-2.5 rounded-2xl border border-white/90 bg-white/80 text-xs shadow-2xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-[#5D3A29] font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>

          {/* Stock Filter */}
          <select
            value={selectedStockStatus}
            onChange={(e) => setSelectedStockStatus(e.target.value)}
            className="w-full md:w-40 px-3 py-2.5 rounded-2xl border border-white/90 bg-white/80 text-xs shadow-2xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-[#5D3A29] font-medium"
          >
            <option value="all">Semua Stok</option>
            <option value="in_stock">Tersedia</option>
            <option value="low_stock">Stok Menipis</option>
            <option value="out_of_stock">Stok Habis</option>
          </select>
        </div>

        {/* Products Table Card */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-100/40 text-stone-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-5">Produk</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Harga</th>
                  <th className="py-3.5 px-4">Stok</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/50">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-stone-400 text-xs">
                      Tidak ada produk yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => {
                    const threshold = settings.lowStockThreshold || 5;
                    const isOutOfStock = (prod.stock || 0) === 0;
                    const isLowStock = !isOutOfStock && (prod.stock || 0) <= threshold;

                    return (
                      <tr key={prod.id} className="hover:bg-white/60 transition-colors">
                        {/* Image & Name */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/90 shadow-xs bg-stone-100 shrink-0">
                              <img 
                                src={prod.image} 
                                alt={prod.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="font-black text-[#5D3A29] block text-sm">{prod.name}</span>
                              <span className="text-[11px] text-stone-400 block line-clamp-1 max-w-xs">{prod.desc}</span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span className="bg-[#DDA15E]/15 border border-[#DDA15E]/30 text-[#8B5742] px-2.5 py-1 rounded-full font-bold text-[10px]">
                            {prod.categoryName}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4">
                          <span className="font-black text-[#5D3A29] text-sm block">
                            Rp {prod.price.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[10px] text-stone-400">/ {prod.unit}</span>
                        </td>

                        {/* Stock & Quick Adjust */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuickStock(prod.id, -1)}
                              disabled={prod.stock <= 0}
                              className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#5D3A29] flex items-center justify-center font-bold active:scale-90 disabled:opacity-30"
                              title="Kurangi stok 1"
                            >
                              <Minus size={12} />
                            </button>
                            <span className={`font-black text-sm w-7 text-center ${
                              isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-700' : 'text-[#5D3A29]'
                            }`}>
                              {prod.stock}
                            </span>
                            <button
                              onClick={() => handleQuickStock(prod.id, 1)}
                              className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#5D3A29] flex items-center justify-center font-bold active:scale-90"
                              title="Tambah stok 1"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          {isOutOfStock && (
                            <span className="text-[10px] text-rose-600 font-bold block mt-0.5">Habis</span>
                          )}
                          {isLowStock && (
                            <span className="text-[10px] text-amber-700 font-bold block mt-0.5">Menipis</span>
                          )}
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleStatus(prod)}
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                              prod.status === 'active'
                                ? 'bg-green-100 text-green-800 border border-green-300/40 hover:bg-green-200'
                                : 'bg-stone-200 text-stone-600 border border-stone-300 hover:bg-stone-300'
                            }`}
                          >
                            {prod.status === 'active' ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(prod)}
                              className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-600 border border-stone-200/80 shadow-2xs transition-all"
                              title="Edit Produk"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(prod.id, prod.name)}
                              className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-stone-200/80 shadow-2xs transition-all"
                              title="Hapus Produk"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white/95 backdrop-blur-2xl border border-white/90 rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/60 mb-5">
              <h3 className="font-black text-base text-[#5D3A29]">
                {editingProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Nama & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5D3A29] mb-1">Nama Produk *</label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contoh: Turon"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5D3A29] mb-1">Kategori *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-xs"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Harga & Satuan */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#5D3A29] mb-1">Harga (Rp) *</label>
                  <input 
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="2000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5D3A29] mb-1">Stok Awal *</label>
                  <input 
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5D3A29] mb-1">Satuan</label>
                  <input 
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="porsi / pcs / cup"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-xs"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block font-bold text-[#5D3A29] mb-1">Deskripsi Produk</label>
                <textarea 
                  rows={2}
                  value={formData.desc}
                  onChange={(e) => setFormData(prev => ({ ...prev, desc: e.target.value }))}
                  placeholder="Ceritakan tentang hidangan atau keunikan rasanya..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-xs resize-none"
                />
              </div>

              {/* Gambar Produk */}
              <div>
                <label className="block font-bold text-[#5D3A29] mb-1">Foto Produk</label>
                <div className="flex items-center gap-2 mb-2">
                  <input 
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="URL gambar atau /produk-adobo.jpg"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs"
                  />
                  <label className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 cursor-pointer font-bold flex items-center gap-1.5 text-stone-700">
                    {isUploadingImage ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                    <span>Upload</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
                {formData.image && (
                  <div className="w-16 h-12 rounded-xl overflow-hidden border border-stone-200 shadow-xs bg-stone-100">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block font-bold text-[#5D3A29] mb-1">Status Publikasi</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-xs"
                >
                  <option value="active">Aktif (Tampil di Website)</option>
                  <option value="inactive">Nonaktif (Sembunyikan)</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white font-bold shadow-sm active:scale-95"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Buat Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
