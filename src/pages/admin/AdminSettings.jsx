import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Store, 
  Phone, 
  Calendar, 
  Sliders, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Trash2, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  Activity, 
  FileText,
  AlertTriangle,
  Database,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useDb } from '../../utils/useDb';
import { checkSupabaseHealth } from '../../utils/supabase';

export default function AdminSettings() {
  const db = useDb();
  const currentSettings = db.getSettings() || {};
  const auditLogs = db.getAuditLogs() || [];

  const [formData, setFormData] = useState({
    storeName: currentSettings.storeName || 'FREONIX - Kokurikuler Filipina',
    storeStatus: currentSettings.storeStatus || 'open',
    eventDate: currentSettings.eventDate || '2026-09-23',
    whatsappAdmin: currentSettings.whatsappAdmin || '6287856624994',
    lowStockThreshold: currentSettings.lowStockThreshold || 5,
    orderPrefix: currentSettings.orderPrefix || 'FRX'
  });

  const [toast, setToast] = useState(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [supabaseStatus, setSupabaseStatus] = useState({
    connected: false,
    loading: true,
    message: 'Memeriksa status koneksi Supabase...'
  });
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);

  useEffect(() => {
    let isMounted = true;
    checkSupabaseHealth().then(res => {
      if (isMounted) {
        setSupabaseStatus({
          connected: res.connected,
          schemaReady: res.schemaReady,
          status: res.status,
          loading: false,
          message: res.message
        });
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleSyncSupabase = async () => {
    setIsSyncingSupabase(true);
    try {
      await db.syncNow();
      const res = await checkSupabaseHealth();
      setSupabaseStatus({
        connected: res.connected,
        schemaReady: res.schemaReady,
        status: res.status,
        loading: false,
        message: res.message
      });
      showToast('Sinkronisasi database Supabase berhasil!');
    } catch (err) {
      showToast('Gagal sinkronisasi Supabase: ' + err.message, 'error');
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'lowStockThreshold' ? Math.max(1, parseInt(value) || 1) : value
    }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    db.updateSettings(formData);
    showToast('Pengaturan toko berhasil disimpan!');
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const backupData = localStorage.getItem('freonix_database_v1');
    if (!backupData) {
      showToast('Database kosong, tidak ada data untuk diekspor.', 'error');
      return;
    }
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freonix_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('File backup JSON berhasil diunduh!');
  };

  // Restore JSON Backup
  const handleRestoreBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.products || !parsed.orders || !parsed.settings) {
          throw new Error('Format file JSON tidak valid untuk database Freonix');
        }
        localStorage.setItem('freonix_database_v1', JSON.stringify(parsed));
        window.dispatchEvent(new CustomEvent('freonix_db_updated', { detail: { action: 'RESTORE_BACKUP' } }));
        showToast('Database berhasil dipulihkan dari file backup!');
      } catch (err) {
        showToast(`Gagal merestore: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset to initial default
  const handleResetDatabase = () => {
    if (confirmText !== 'RESET') {
      showToast('Ketik kata "RESET" dengan tepat untuk konfirmasi.', 'error');
      return;
    }
    db.resetToInitial();
    setResetConfirmOpen(false);
    setConfirmText('');
    showToast('Database berhasil direset ke pengaturan demo default!');
  };

  return (
    <AdminLayout title="Pengaturan Sistem">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 animate-slide-up ${
          toast.type === 'error' 
            ? 'bg-rose-900/90 text-white border-rose-700' 
            : 'bg-[#5D3A29]/95 text-white border-[#8B5742]/50'
        }`}>
          <Sparkles size={18} className="text-[#DDA15E]" />
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#5D3A29] flex items-center gap-2.5">
            <Settings size={26} className="text-[#8B5742]" />
            Pengaturan & Konfigurasi Toko
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Kelola identitas stan, nomor WhatsApp operasional, kuota stok, dan pemeliharaan database.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="p-6 rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(93,58,41,0.04)] space-y-5">
            <h2 className="text-base font-extrabold text-[#5D3A29] flex items-center gap-2 pb-3 border-b border-stone-200/60">
              <Store size={18} className="text-[#8B5742]" />
              Informasi & Status Toko
            </h2>

            {/* Store Status Toggle */}
            <div className="p-4 rounded-2xl bg-[#5D3A29]/5 border border-stone-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold text-[#5D3A29] block">Status Pre-Order Toko</span>
                <span className="text-[11px] text-stone-500">
                  {formData.storeStatus === 'open' 
                    ? 'Pre-order dibuka untuk seluruh pelanggan di website.' 
                    : 'Pre-order ditutup. Pelanggan tidak dapat melakukan checkout baru.'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, storeStatus: 'open' }))}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    formData.storeStatus === 'open'
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-white text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  ● Buka PO
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, storeStatus: 'closed' }))}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    formData.storeStatus === 'closed'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  ● Tutup PO
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">Nama Stan / Acara</label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B5742]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">Tanggal Pelaksanaan Event</label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B5742]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Nomor WhatsApp Admin (Format 62xxx)
                </label>
                <input
                  type="text"
                  name="whatsappAdmin"
                  value={formData.whatsappAdmin}
                  onChange={handleInputChange}
                  required
                  placeholder="6287856624994"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B5742]/30 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Batas Peringatan Stok Menipis (Threshold)
                </label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B5742]/30"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white text-xs font-extrabold hover:shadow-lg transition-all active:scale-95"
              >
                <Save size={15} />
                Simpan Perubahan
              </button>
            </div>
          </form>

          {/* Supabase Cloud Database Integration */}
          <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(93,58,41,0.04)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/60">
              <h2 className="text-base font-extrabold text-[#5D3A29] flex items-center gap-2">
                <Database size={18} className="text-[#8B5742]" />
                Integrasi Database Supabase
              </h2>
              <button
                type="button"
                onClick={handleSyncSupabase}
                disabled={isSyncingSupabase}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5D3A29] hover:bg-[#8B5742] text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                <RefreshCw size={13} className={isSyncingSupabase ? 'animate-spin' : ''} />
                {isSyncingSupabase ? 'Sinkronisasi...' : 'Sinkronkan Sekarang'}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700">Status Koneksi:</span>
                <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 ${
                  supabaseStatus.status === 'success'
                    ? 'bg-emerald-100 text-emerald-800'
                    : supabaseStatus.status === 'warning'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    supabaseStatus.status === 'success' ? 'bg-emerald-500 animate-pulse' :
                    supabaseStatus.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                  {supabaseStatus.status === 'success' ? 'Supabase Live' :
                   supabaseStatus.status === 'warning' ? 'Terkoneksi (Menunggu Schema SQL)' : 'Terputus / Periksa Config'}
                </span>
              </div>

              <div className="text-[11px] text-stone-500 space-y-1">
                <div><strong>Project URL:</strong> <code className="bg-stone-200/60 px-1.5 py-0.5 rounded text-stone-700 font-mono">https://wvsyzexwmhyckbemuced.supabase.co</code></div>
                <div><strong>Status:</strong> {supabaseStatus.message}</div>
                <div><strong>Tabel Supabase:</strong> <span className="font-mono text-stone-700">products, categories, orders, store_settings, notifications, audit_logs</span></div>
                <div><strong>Storage Bucket:</strong> <span className="font-mono text-stone-700">freonix-uploads</span> (Public)</div>
              </div>
            </div>
          </div>

          {/* Backup & Restore Section */}
          <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(93,58,41,0.04)] space-y-4">
            <h2 className="text-base font-extrabold text-[#5D3A29] flex items-center gap-2 pb-3 border-b border-stone-200/60">
              <Sliders size={18} className="text-[#8B5742]" />
              Pemeliharaan & Cadangan Database
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Backup */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-xs font-bold text-stone-800 block mb-1">Unduh Cadangan (Backup)</span>
                <p className="text-[11px] text-stone-500 mb-3">
                  Unduh seluruh database (produk, pesanan, riwayat) dalam satu file JSON.
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-[#5D3A29] hover:bg-stone-100 text-xs font-bold transition-all shadow-xs"
                >
                  <Download size={14} className="text-[#8B5742]" />
                  Download Backup JSON
                </button>
              </div>

              {/* Restore */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-xs font-bold text-stone-800 block mb-1">Pulihkan (Restore)</span>
                <p className="text-[11px] text-stone-500 mb-3">
                  Unggah file JSON backup yang sebelumnya diunduh untuk memulihkan data.
                </p>
                <label className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-[#5D3A29] hover:bg-stone-100 text-xs font-bold transition-all shadow-xs cursor-pointer">
                  <Upload size={14} className="text-[#8B5742]" />
                  Upload Backup JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Danger Zone: Reset Database */}
            <div className="pt-4 border-t border-stone-200">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-extrabold text-rose-800 flex items-center gap-1.5">
                    <ShieldAlert size={15} /> Zona Bahaya: Reset Database ke Demo
                  </span>
                  <p className="text-[11px] text-rose-600 mt-0.5">
                    Menghapus seluruh modifikasi dan mengembalikan data produk & pesanan default awal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setResetConfirmOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-extrabold hover:bg-rose-700 transition-all shadow-xs shrink-0"
                >
                  Reset Database
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Audit Log */}
        <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(93,58,41,0.04)] h-fit">
          <h2 className="text-base font-extrabold text-[#5D3A29] flex items-center gap-2 pb-3 border-b border-stone-200/60 mb-4">
            <Activity size={18} className="text-[#8B5742]" />
            Audit Log Aktivitas ({auditLogs.length})
          </h2>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-stone-400 py-8 text-center">Belum ada catatan log aktivitas.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-2xl bg-stone-50/80 border border-stone-200/70 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-[#5D3A29] text-[11px] font-mono uppercase">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-stone-400">{log.time}</span>
                  </div>
                  <p className="text-stone-600 text-[11px]">{log.details}</p>
                  <span className="text-[9px] text-stone-400 mt-1 block">Aktor: {log.actor || 'Admin'}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-center font-black text-[#5D3A29] text-base mb-2">
              Konfirmasi Reset Database
            </h3>
            <p className="text-center text-xs text-stone-600 mb-4">
              Apakah Anda yakin ingin menghapus seluruh transaksi, produk kustom, dan mengembalikan data demo default? Tindakan ini <strong>tidak dapat dibatalkan</strong>!
            </p>
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-stone-600 mb-1 text-center">
                Ketik <span className="font-mono text-rose-600 font-extrabold">RESET</span> di bawah ini untuk melanjutkan:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="RESET"
                className="w-full text-center px-4 py-2.5 rounded-xl border border-stone-300 font-mono text-sm font-bold uppercase focus:ring-2 focus:ring-rose-500/30"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setResetConfirmOpen(false); setConfirmText(''); }}
                className="flex-1 py-2.5 rounded-2xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetDatabase}
                disabled={confirmText !== 'RESET'}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 disabled:opacity-40 text-white text-xs font-bold hover:bg-rose-700 shadow-md transition-all"
              >
                Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
