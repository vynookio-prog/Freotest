import React, { useState, useMemo } from 'react';
import { 
  PlusCircle, 
  Layers, 
  Edit3, 
  Trash2, 
  X, 
  AlertCircle,
  Package
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useDb } from '../../utils/useDb';

export default function AdminCategories() {
  const db = useDb();
  const categories = useMemo(() => db.getCategories(), [db]);
  const products = useMemo(() => db.getProducts(), [db]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'active'
  });

  const openAddModal = () => {
    setEditingCategory(null);
    setFormError('');
    setFormData({
      name: '',
      slug: '',
      description: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormError('');
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      status: cat.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Nama kategori wajib diisi.');
      return;
    }

    try {
      if (editingCategory) {
        db.updateCategory(editingCategory.id, {
          name: formData.name.trim(),
          slug: formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-'),
          description: formData.description.trim(),
          status: formData.status
        });
      } else {
        db.addCategory({
          name: formData.name.trim(),
          slug: formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-'),
          description: formData.description.trim(),
          status: formData.status
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Terjadi kesalahan saat menyimpan kategori.');
    }
  };

  const handleDelete = (id, name) => {
    // Integrity check
    const inUse = products.some(p => p.categoryId === id);
    if (inUse) {
      alert(`Kategori "${name}" tidak dapat dihapus karena masih digunakan oleh produk di katalog. Silakan pindahkan atau ubah kategori produk terlebih dahulu.`);
      return;
    }

    if (window.confirm(`Hapus kategori "${name}"?`)) {
      try {
        db.deleteCategory(id);
      } catch (err) {
        alert(err.message || 'Gagal menghapus kategori.');
      }
    }
  };

  return (
    <AdminLayout title="Manajemen Kategori">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#5D3A29]">Kategori Menu</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Atur pengelompokan menu kuliner yang tampil pada filter katalog website.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-[0_6px_20px_rgba(139,87,66,0.3)] hover:shadow-[0_8px_25px_rgba(139,87,66,0.45)] transition-all active:scale-95"
          >
            <PlusCircle size={16} /> Tambah Kategori
          </button>
        </div>

        {/* Categories Table Card */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200/60 bg-stone-100/40 text-stone-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-5">Nama Kategori</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Deskripsi</th>
                  <th className="py-3.5 px-4">Jumlah Produk</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/50">
                {categories.map((cat) => {
                  const productCount = products.filter(p => p.categoryId === cat.id).length;

                  return (
                    <tr key={cat.id} className="hover:bg-white/60 transition-colors">
                      <td className="py-4 px-5 font-bold text-[#5D3A29]">
                        <div className="flex items-center gap-2">
                          <Layers size={15} className="text-[#8B5742]" />
                          <span className="text-sm font-black">{cat.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-stone-500 text-[11px]">
                        {cat.slug}
                      </td>
                      <td className="py-4 px-4 text-stone-600 max-w-sm truncate">
                        {cat.description || '-'}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-bold text-[10px]">
                          <Package size={11} /> {productCount} produk
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          cat.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-stone-200 text-stone-600'
                        }`}>
                          {cat.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-600 border border-stone-200/80 shadow-2xs transition-all"
                            title="Edit Kategori"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-stone-200/80 shadow-2xs transition-all"
                            title="Hapus Kategori"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL ADD/EDIT */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white/95 backdrop-blur-2xl border border-white/90 rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/60 mb-5">
              <h3 className="font-black text-base text-[#5D3A29]">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
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
              <div>
                <label className="block font-bold text-[#5D3A29] mb-1">Nama Kategori *</label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: Aneka Minuman"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5D3A29] mb-1">Slug URL</label>
                <input 
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="aneka-minuman (otomatis jika kosong)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5D3A29] mb-1">Deskripsi</label>
                <textarea 
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Keterangan singkat..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-xs resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5D3A29] mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-xs"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>

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
                  {editingCategory ? 'Simpan Perubahan' : 'Buat Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
