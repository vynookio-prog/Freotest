'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  ExternalLink, 
  Menu, 
  X, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  Star
} from 'lucide-react';
import { useDb } from '../../lib/useDb';
import { logoutAdmin } from '../../lib/insforge';

export default function AdminLayout({ children, title = 'Admin Dashboard' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const db = useDb();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auth Guard
  const isAuthenticated = isClient && (
    sessionStorage.getItem('freonix_admin_auth') === 'true' || 
    localStorage.getItem('freonix_admin_auth') === 'true'
  );

  useEffect(() => {
    if (isClient && !isAuthenticated && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [isClient, isAuthenticated, pathname, router]);

  // Jika di halaman login, tampilkan langsung tanpa layout admin
  if (pathname === '/admin/login') {
    return children;
  }

  if (!isClient || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5742]" />
      </div>
    );
  }

  const notifications = db.getNotifications() || [];
  const unreadCount = notifications.filter(n => !n.read).length;
  const settings = db.getSettings() || {};

  const handleLogout = async () => {
    await logoutAdmin();
    router.replace('/admin/login');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/admin/products', label: 'Produk', icon: Package },
    { path: '/admin/categories', label: 'Kategori', icon: Layers },
    { path: '/admin/orders', label: 'Pesanan', icon: ShoppingCart },
    { path: '/admin/reviews', label: 'Ulasan', icon: Star },
    { path: '/admin/customers', label: 'Pelanggan', icon: Users },
    { path: '/admin/settings', label: 'Pengaturan', icon: Settings },
  ];

  const isNavActive = (item) => {
    if (item.exact) return pathname === item.path;
    return pathname.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#2C1810] flex relative selection:bg-[#DDA15E] selection:text-white antialiased">
      {/* Background Ambient Mesh Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#DDA15E]/15 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#8B5742]/10 blur-[140px] pointer-events-none -z-10" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/80 bg-white/60 backdrop-blur-2xl p-5 sticky top-0 h-screen z-30 shadow-[4px_0_24px_rgba(93,58,41,0.03)]">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 pb-6 border-b border-stone-200/60 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8B5742] to-[#DDA15E] p-1.5 flex items-center justify-center text-white shadow-md">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span className="font-black text-base tracking-wider text-[#5D3A29] block">FREONIX</span>
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest block">Admin Control</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const active = isNavActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white shadow-[0_4px_16px_rgba(139,87,66,0.25)]'
                    : 'text-stone-600 hover:text-[#5D3A29] hover:bg-white/70'
                }`}
              >
                <Icon size={17} className={active ? 'text-white' : 'text-[#8B5742]'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Store Status Indicator */}
        <div className="p-3.5 rounded-2xl bg-white/50 border border-white/80 mb-4 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-stone-400">Status Toko</span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
              settings.storeStatus === 'open' 
                ? 'bg-green-500/20 text-green-800' 
                : 'bg-rose-500/20 text-rose-800'
            }`}>
              ● {settings.storeStatus === 'open' ? 'Buka PO' : 'Tutup'}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 truncate">{settings.storeName}</p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold text-rose-700 hover:bg-rose-500/10 border border-transparent hover:border-rose-300/40 transition-all"
        >
          <LogOut size={16} />
          <span>Keluar (Logout)</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/60 backdrop-blur-xl border-b border-white/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-stone-600 hover:bg-white/80 active:scale-95"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-base sm:text-lg font-black text-[#5D3A29] truncate">{title}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/70 hover:bg-white text-stone-600 hover:text-[#5D3A29] border border-white/90 text-xs font-semibold shadow-xs transition-all"
            >
              <ExternalLink size={13} />
              <span>Lihat Website</span>
            </Link>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2.5 rounded-xl bg-white/70 hover:bg-white text-stone-600 hover:text-[#5D3A29] border border-white/90 shadow-xs transition-all active:scale-95"
                title="Notifikasi"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white/90 backdrop-blur-2xl border border-white/90 p-4 shadow-2xl z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200/60 mb-3">
                    <span className="font-black text-xs uppercase tracking-wider text-[#5D3A29]">
                      Notifikasi Toko ({unreadCount} baru)
                    </span>
                    <button
                      onClick={() => {
                        db.clearNotifications();
                        setNotifDropdownOpen(false);
                      }}
                      className="text-[10px] text-stone-400 hover:text-stone-600 font-bold"
                    >
                      Bersihkan Semua
                    </button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-stone-400 text-center py-4">Belum ada notifikasi.</p>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => db.markNotificationRead(n.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            n.read 
                              ? 'bg-stone-50/50 border-stone-200/50 text-stone-500' 
                              : 'bg-[#DDA15E]/10 border-[#DDA15E]/30 text-[#5D3A29] font-medium'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-[11px] mb-0.5">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-stone-400 font-normal">{n.time}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-stone-200/60">
              <div className="w-8 h-8 rounded-full bg-[#8B5742] text-white flex items-center justify-center font-black text-xs shadow-xs">
                FX
              </div>
              <span className="hidden md:inline text-xs font-bold text-[#5D3A29]">freonix</span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="p-4 sm:p-8 flex-1">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex">
          <div className="w-72 bg-white/95 backdrop-blur-2xl h-full p-6 flex flex-col justify-between shadow-2xl animate-slide-right">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#8B5742] text-white flex items-center justify-center font-black text-xs">
                    FX
                  </div>
                  <span className="font-black text-base text-[#5D3A29]">FREONIX Admin</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const active = isNavActive(item);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? 'bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white shadow-md'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <Icon size={17} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200/50"
            >
              <LogOut size={16} />
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
