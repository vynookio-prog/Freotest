'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShoppingBag, 
  DollarSign, 
  Phone, 
  Eye, 
  X,
  MessageSquare
} from 'lucide-react';
import { useDb } from '../../../lib/useDb';

export default function AdminCustomersPage() {
  const db = useDb();
  const [customers, setCustomers] = useState(db.getCustomers() || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    let mounted = true;
    const update = () => {
      if (mounted) setCustomers(db.getCustomers() || []);
    };
    db.fetchOrders()
      .then(update)
      .catch(update);

    window.addEventListener('freonix_db_updated', update);
    return () => {
      mounted = false;
      window.removeEventListener('freonix_db_updated', update);
    };
  }, [db]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        c.name?.toLowerCase().includes(q) ||
        c.kelas?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
      );
    });
  }, [customers, searchQuery]);

  // Aggregate metrics
  const totalCustomers = customers.length;
  const totalSpentAll = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
  const avgOrderPerCustomer = totalCustomers > 0 
    ? (customers.reduce((acc, c) => acc + (c.totalOrders || 0), 0) / totalCustomers).toFixed(1)
    : 0;

  const getWhatsAppLink = (phone, name) => {
    let clean = (phone || '').replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    if (!clean.startsWith('62')) clean = '62' + clean;
    const msg = `Halo kak ${name}, ini dari Tim Admin FREONIX terkait pesanan kuliner kamu.`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#5D3A29] flex items-center gap-2.5">
            <Users size={26} className="text-[#8B5742]" />
            Database Pelanggan ({totalCustomers})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Daftar otomatis siswa dan guru yang pernah melakukan pre-order di FREONIX.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(93,58,41,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-extrabold text-stone-400">Total Pelanggan Unik</span>
            <div className="w-8 h-8 rounded-xl bg-[#8B5742]/10 text-[#8B5742] flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#5D3A29]">{totalCustomers} Siswa/Guru</div>
          <span className="text-[11px] text-stone-400">Tercatat dalam sistem</span>
        </div>

        <div className="p-4 rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(93,58,41,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-extrabold text-stone-400">Total Nilai Pembelian</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800">
            Rp {Number(totalSpentAll).toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-stone-400">Akumulasi seluruh transaksi</span>
        </div>

        <div className="p-4 rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(93,58,41,0.04)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-extrabold text-stone-400">Rata-rata Order</span>
            <div className="w-8 h-8 rounded-xl bg-[#DDA15E]/20 text-[#8B5742] flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#5D3A29]">
            {avgOrderPerCustomer} Pesanan
          </div>
          <span className="text-[11px] text-stone-400">Per satu pelanggan</span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="p-4 rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(93,58,41,0.04)]">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Cari nama pelanggan, kelas, atau nomor telepon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/80 border border-stone-200/70 text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B5742]/30 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(93,58,41,0.04)] overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={40} className="mx-auto text-stone-300 mb-3" />
            <h3 className="text-sm font-bold text-[#5D3A29]">Belum ada data pelanggan</h3>
            <p className="text-xs text-stone-400 mt-1">Pelanggan akan otomatis dicatat setiap ada pesanan baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#5D3A29]/5 border-b border-stone-200/70 text-[#5D3A29] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Nama Pelanggan</th>
                  <th className="py-3.5 px-4">Kelas</th>
                  <th className="py-3.5 px-4">Kontak WhatsApp</th>
                  <th className="py-3.5 px-4 text-center">Total Pesanan</th>
                  <th className="py-3.5 px-4">Total Pengeluaran</th>
                  <th className="py-3.5 px-4">Pesanan Terakhir</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/50">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-white/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B5742] to-[#DDA15E] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="block text-stone-900 font-bold">{c.name}</span>
                          <span className="text-[10px] text-stone-400">ID: {c.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-700">
                      <span className="bg-stone-100 px-2 py-0.5 rounded-md text-[11px] font-bold text-stone-700">
                        {c.kelas}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-mono text-[11px]">
                      {c.phone && c.phone !== '-' ? (
                        <a 
                          href={getWhatsAppLink(c.phone, c.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-green-700 hover:text-green-800 font-semibold cursor-pointer"
                        >
                          <Phone size={12} />
                          {c.phone}
                        </a>
                      ) : (
                        <span className="text-stone-300">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block bg-[#8B5742]/10 text-[#8B5742] font-black px-2.5 py-0.5 rounded-full text-xs">
                        {c.totalOrders}x
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-[#5D3A29]">
                      Rp {Number(c.totalSpent || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-stone-400 text-[11px]">
                      {c.lastOrder || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-[#5D3A29] hover:bg-stone-50 font-bold text-[11px] shadow-xs transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        Lihat Riwayat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Order History Modal */}
      {selectedCustomer && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedCustomer(null)}
        >
          <div 
            className="relative max-w-lg w-full bg-white/95 backdrop-blur-2xl rounded-3xl border border-white shadow-2xl p-6 animate-scale-up my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#8B5742] to-[#DDA15E] text-white flex items-center justify-center font-black text-sm shadow-md">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-black text-[#5D3A29]">
                    {selectedCustomer.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                    <span>{selectedCustomer.kelas}</span>
                    {selectedCustomer.phone && selectedCustomer.phone !== '-' && (
                      <>
                        <span>•</span>
                        <span className="font-mono">{selectedCustomer.phone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Pesanan</span>
                <span className="text-lg font-black text-[#5D3A29]">{selectedCustomer.totalOrders} Kali</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Belanja</span>
                <span className="text-lg font-black text-emerald-800">
                  Rp {Number(selectedCustomer.totalSpent || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Orders list */}
            <div className="mb-4">
              <h4 className="text-xs font-extrabold text-[#5D3A29] uppercase tracking-wider mb-2.5">
                Riwayat Transaksi Pelanggan ({selectedCustomer.orders?.length || 0})
              </h4>
              <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
                {(selectedCustomer.orders || []).map((ord) => (
                  <div key={ord.orderId} className="p-3.5 rounded-2xl bg-stone-50/70 border border-stone-200/80 hover:bg-stone-50 transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-[#5D3A29]">#{ord.orderId}</span>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          ord.paymentStatus === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.paymentStatus}
                        </span>
                        <span className="text-[10px] font-semibold text-stone-500">
                          ({ord.orderStatus})
                        </span>
                      </div>
                      <span className="font-black text-xs text-[#8B5742]">
                        Rp {Number(ord.totalHarga || 0).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-600 mb-1">
                      {(ord.items || []).map(i => `${i.name} (x${i.qty})`).join(', ')}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-200/50">
                      <span>Metode: {ord.paymentMethod?.toUpperCase()}</span>
                      <span>{ord.orderTime || '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal actions */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
              {selectedCustomer.phone && selectedCustomer.phone !== '-' ? (
                <a
                  href={getWhatsAppLink(selectedCustomer.phone, selectedCustomer.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-all shadow-md cursor-pointer"
                >
                  <MessageSquare size={15} />
                  Kirim Pesan WhatsApp
                </a>
              ) : <div />}

              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2.5 rounded-2xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
