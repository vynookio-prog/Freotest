'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  CheckCircle2, 
  Package, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useDb } from '../../lib/useDb';

export default function AdminDashboardPage() {
  const db = useDb();
  const products = useMemo(() => db.getProducts(), [db]);
  const settings = useMemo(() => db.getSettings(), [db]);

  const [orders, setOrders] = useState(db.getOrders() || []);

  useEffect(() => {
    let mounted = true;
    const update = () => {
      if (mounted) setOrders([...(db.getOrders() || [])]);
    };
    db.fetchOrders()
      .then(fetched => { if (mounted) setOrders(fetched || []); })
      .catch(update);

    window.addEventListener('freonix_db_updated', update);
    return () => {
      mounted = false;
      window.removeEventListener('freonix_db_updated', update);
    };
  }, [db]);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, o) => acc + (o.totalHarga || 0), 0);
    const completedOrders = orders.filter(o => o.orderStatus === 'Completed').length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'Pending' || o.paymentStatus === 'PENDING').length;
    const cancelledOrders = orders.filter(o => o.orderStatus === 'Cancelled').length;
    const threshold = settings.lowStockThreshold || 5;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const outOfStockProducts = products.filter(p => (p.stock || 0) === 0).length;
    const lowStockProducts = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= threshold).length;
    return {
      totalRevenue,
      totalOrders: orders.length,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      totalProducts: products.length,
      activeProducts,
      outOfStockProducts,
      lowStockProducts
    };
  }, [orders, products, settings]);

  const recentOrders = orders.slice(0, 5);

  const lowStockProducts = useMemo(() => {
    const threshold = settings.lowStockThreshold || 5;
    return products.filter(p => (p.stock || 0) <= threshold);
  }, [products, settings]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#5D3A29] to-[#8B5742] rounded-[2.5rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-[0_16px_40px_rgba(93,58,41,0.15)]">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-3xl -skew-x-12 pointer-events-none" />
        <div className="relative z-10 max-w-xl">
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full inline-block mb-3">
            InsForge BaaS Connected
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mb-2">
            Pusat Kontrol Website FREONIX
          </h2>
          <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
            Setiap perubahan produk, stok, atau status pesanan yang Anda lakukan di dashboard ini langsung terhubung ke database InsForge dan website pelanggan.
          </p>
        </div>
      </div>

      {/* 1. SALES OVERVIEW METRICS */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-[#8B5742] mb-3 flex items-center gap-1.5">
          <TrendingUp size={14} /> Ringkasan Penjualan
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 border border-white/90 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">Total Pendapatan</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-800">
              Rp {stats.totalRevenue.toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-stone-500 mt-1 block">Akumulasi seluruh transaksi</span>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 border border-white/90 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">Total Pesanan</span>
            <div className="text-2xl font-black text-[#5D3A29]">{stats.totalOrders}</div>
            <span className="text-[10px] text-stone-500 mt-1 block">Pesanan masuk</span>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 border border-white/90 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-green-700 block mb-1">Pesanan Selesai</span>
            <div className="text-2xl font-black text-green-700">{stats.completedOrders}</div>
            <span className="text-[10px] text-stone-500 mt-1 block">Telah diambil/selesai</span>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 border border-white/90 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-amber-700 block mb-1">Perlu Diproses</span>
            <div className="text-2xl font-black text-amber-800">{stats.pendingOrders}</div>
            <span className="text-[10px] text-stone-500 mt-1 block">Pending / Sedang dicek</span>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 border border-white/90 shadow-xs col-span-2 lg:col-span-1">
            <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">Dibatalkan</span>
            <div className="text-2xl font-black text-stone-500">{stats.cancelledOrders}</div>
            <span className="text-[10px] text-stone-500 mt-1 block">Pesanan batal</span>
          </div>
        </div>
      </div>

      {/* 2. PRODUCT & INVENTORY OVERVIEW */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-[#8B5742] mb-3 flex items-center gap-1.5">
          <Package size={14} /> Inventaris & Katalog Produk
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 border border-white/90 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">Total Produk</span>
            <div className="text-2xl font-black text-[#5D3A29]">{stats.totalProducts}</div>
            <span className="text-[10px] text-stone-500 mt-1 block">Dalam database</span>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 border border-white/90 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">Produk Aktif</span>
            <div className="text-2xl font-black text-emerald-700">{stats.activeProducts}</div>
            <span className="text-[10px] text-stone-500 mt-1 block">Tayang di katalog web</span>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 border border-white/90 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-amber-700 block mb-1">Stok Menipis (≤ {settings.lowStockThreshold})</span>
            <div className="text-2xl font-black text-amber-800">{stats.lowStockProducts}</div>
            <span className="text-[10px] text-stone-500 mt-1 block">Perlu ditambah segera</span>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 border border-white/90 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-rose-700 block mb-1">Stok Habis</span>
            <div className="text-2xl font-black text-rose-700">{stats.outOfStockProducts}</div>
            <span className="text-[10px] text-stone-500 mt-1 block">Tidak dapat diorder</span>
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTIONS */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 bg-[#5D3A29] hover:bg-[#8B5742] text-white px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95"
        >
          <PlusCircle size={15} /> Tambah / Kelola Produk
        </Link>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 bg-white/80 hover:bg-white text-[#5D3A29] px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider border border-white/90 shadow-xs transition-all active:scale-95"
        >
          <ShoppingBag size={15} /> Semua Pesanan ({orders.length})
        </Link>
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 bg-white/80 hover:bg-white text-[#5D3A29] px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider border border-white/90 shadow-xs transition-all active:scale-95"
        >
          Kelola Kategori
        </Link>
      </div>

      {/* 4. RECENT ORDERS & LOW STOCK ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-6 border border-white/90 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200/60 mb-4">
            <div>
              <h3 className="text-base font-black text-[#5D3A29]">Pesanan Terbaru</h3>
              <p className="text-[11px] text-stone-400">5 transaksi terakhir yang masuk dari pelanggan</p>
            </div>
            <Link 
              href="/admin/orders" 
              className="text-xs font-bold text-[#8B5742] hover:text-[#5D3A29] inline-flex items-center gap-1"
            >
              Lihat Semua <ArrowRight size={13} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-8">Belum ada pesanan masuk.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div 
                  key={order.orderId}
                  className="p-3.5 rounded-2xl bg-white/60 border border-white/80 hover:bg-white transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-black text-[#8B5742]">{order.orderId}</span>
                      <span className="text-[11px] text-stone-400">{order.orderTime}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.paymentStatus === 'SUCCESS' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.paymentStatus === 'SUCCESS' ? 'Lunas' : 'Pending'}
                      </span>
                    </div>
                    <span className="font-bold text-[#5D3A29]">{order.name}</span>
                    <span className="text-stone-400 ml-1">({order.kelas})</span>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-[#8B5742] block">
                      Rp {(order.totalHarga || 0).toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {order.paymentMethod === 'qris' ? 'QRIS' : 'Tunai di Stand'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Watchlist */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-6 border border-white/90 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200/60 mb-4">
            <h3 className="text-base font-black text-[#5D3A29] flex items-center gap-1.5">
              <AlertTriangle size={16} className="text-amber-600" /> Pantauan Stok
            </h3>
            <Link 
              href="/admin/products" 
              className="text-xs font-bold text-[#8B5742] hover:text-[#5D3A29]"
            >
              Kelola Stok
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8 text-stone-400">
              <CheckCircle2 size={24} className="mx-auto text-green-500 mb-2" />
              <p className="text-xs font-semibold text-stone-600">Semua stok produk aman</p>
              <p className="text-[11px] mt-0.5">Tidak ada produk yang stoknya di bawah {settings.lowStockThreshold}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map(p => (
                <div 
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-[#5D3A29]">{p.name}</h4>
                    <span className="text-[11px] text-stone-500">{p.categoryName}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-black text-sm block ${p.stock === 0 ? 'text-rose-600' : 'text-amber-800'}`}>
                      {p.stock} {p.unit}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {p.stock === 0 ? 'Habis (Out of Stock)' : 'Menipis'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
