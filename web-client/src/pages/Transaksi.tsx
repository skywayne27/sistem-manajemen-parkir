import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReceiptText,
  Search,
  RotateCw,
  Plus,
  Info,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
} from 'lucide-react';
import { apiTransaksi, apiAreaParkir, apiKendaraan } from '../services/api';
import type { TransaksiParkir, AreaParkir, Kendaraan } from '../types/type';
import { Modal } from '../components/Modal';

export const TransaksiPage: React.FC = () => {
  // Tabs: 'aktif' | 'riwayat'
  const [activeTab, setActiveTab] = useState<'aktif' | 'riwayat'>('aktif');

  // Data states
  const [activeTransactions, setActiveTransactions] = useState<TransaksiParkir[]>([]);
  const [allTransactions, setAllTransactions] = useState<TransaksiParkir[]>([]);
  const [areas, setAreas] = useState<AreaParkir[]>([]);
  const [kendaraanList, setKendaraanList] = useState<Kendaraan[]>([]);

  // UI States
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('');

  // Modals
  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(false);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransaksiParkir | null>(null);

  // Check-In Form State
  const [selectedKendaraanId, setSelectedKendaraanId] = useState<number | ''>('');
  const [selectedAreaId, setSelectedAreaId] = useState<number | ''>('');
  const [submittingCheckIn, setSubmittingCheckIn] = useState<boolean>(false);
  const [checkInError, setCheckInError] = useState<string | null>(null);

  // Load Data
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [aktifList, allList, areaList, vehicleList] = await Promise.all([
        apiTransaksi.getAktif(),
        apiTransaksi.getAll(),
        apiAreaParkir.getAll(),
        apiKendaraan.getAll(),
      ]);

      setActiveTransactions(aktifList);
      setAllTransactions(allList);
      setAreas(areaList);
      setKendaraanList(vehicleList);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data transaksi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, refreshing]);

  const handleRefresh = () => {
    setRefreshing(true);
    setLoading(true)
    loadData();
  };

  // Filtered List based on Active Tab
  const displayedList = useMemo(() => {
    const list = activeTab === 'aktif' ? activeTransactions : allTransactions;
    const q = searchQuery.toLowerCase().trim();

    return list.filter((tx) => {
      // Area filter
      if (selectedAreaFilter && tx.areaParkirId !== Number(selectedAreaFilter)) {
        return false;
      }

      // Status filter (hanya di tab riwayat)
      if (activeTab === 'riwayat' && selectedStatusFilter && tx.status !== selectedStatusFilter) {
        return false;
      }

      // Search query filter (plat nomor, pemilik, nama area)
      if (q) {
        const plat = tx.kendaraan?.platNomor?.toLowerCase() || '';
        const pemilik = tx.kendaraan?.pemilik?.toLowerCase() || '';
        const area = tx.areaParkir?.nama?.toLowerCase() || '';
        return plat.includes(q) || pemilik.includes(q) || area.includes(q);
      }

      return true;
    });
  }, [activeTab, activeTransactions, allTransactions, searchQuery, selectedAreaFilter, selectedStatusFilter]);

  // Durasi berjalan calculation
  const calculateDuration = (waktuMasuk: string): string => {
    const diffMs = Math.max(0, new Date().getTime() - new Date(waktuMasuk).getTime());
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours > 0) {
      return `${hours} jam ${mins} mnt`;
    }
    return `${mins} mnt`;
  };

  // Format datetime
  const formatDateTime = (isoString?: string | null): string => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      const day = d.getDate();
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
      ];
      const month = monthNames[d.getMonth()];
      return `${hours}.${mins}, ${day} ${month}`;
    } catch {
      return isoString;
    }
  };

  const formatRupiah = (val: number | null): string => {
    if (val === null || val === undefined) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Check-Out Handler
  const handleCheckOut = async (tx: TransaksiParkir) => {
    const plat = tx.kendaraan?.platNomor || `#${tx.id}`;
    if (!window.confirm(`Konfirmasi checkout kendaraan [${plat}]?`)) return;

    try {
      const result = await apiTransaksi.checkOut(tx.id);
      setSuccessMessage(
        `Kendaraan [${plat}] berhasil checkout! Total biaya: ${formatRupiah(result.biaya || 0)} (Durasi: ${result.durasiJam || 1} jam)`
      );
      setSelectedTransaction(result);
      setIsDetailOpen(true);
      loadData();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal memproses checkout');
    }
  };

  // Open Detail
  const openDetailModal = async (tx: TransaksiParkir) => {
    try {
      const detail = await apiTransaksi.getById(tx.id);
      setSelectedTransaction(detail);
      setIsDetailOpen(true);
    } catch {
      setSelectedTransaction(tx);
      setIsDetailOpen(true);
    }
  };

  // Check-In Submit
  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKendaraanId || !selectedAreaId) {
      setCheckInError('Pilih kendaraan dan area parkir terlebih dahulu');
      return;
    }

    setSubmittingCheckIn(true);
    setCheckInError(null);

    try {
      const newTx = await apiTransaksi.checkIn({
        kendaraanId: Number(selectedKendaraanId),
        areaParkirId: Number(selectedAreaId),
      });

      setSuccessMessage(`Check-in berhasil! Transaksi #${newTx.id} dimulai.`);
      setIsCheckInOpen(false);
      setSelectedKendaraanId('');
      setSelectedAreaId('');
      loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      setCheckInError(err instanceof Error ? err.message : 'Gagal membuat check-in');
    } finally {
      setSubmittingCheckIn(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3">
          <AlertCircle size={18} className="text-rose-600" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Tabs Switcher matching mockup */}
      <div className="flex items-center gap-6 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('aktif')}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-bold transition-all relative ${
            activeTab === 'aktif'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Transaksi Aktif (Sedang Parkir)</span>
        </button>

        <button
          onClick={() => setActiveTab('riwayat')}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-bold transition-all relative ${
            activeTab === 'riwayat'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ReceiptText size={16} />
          <span>Semua Riwayat Transaksi</span>
        </button>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari plat nomor, nama pemilik, atau area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          {/* Area Filter */}
          <select
            value={selectedAreaFilter}
            onChange={(e) => setSelectedAreaFilter(e.target.value)}
            className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-700"
          >
            <option value="">Semua Area Parkir</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nama}
              </option>
            ))}
          </select>

          {/* Status Filter (Active in Riwayat tab) */}
          {activeTab === 'riwayat' && (
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full sm:w-40 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-700"
            >
              <option value="">Semua Status</option>
              <option value="AKTIF">AKTIF</option>
              <option value="SELESAI">SELESAI</option>
            </select>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition shadow-2xs disabled:opacity-50"
          >
            <RotateCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setCheckInError(null);
              setIsCheckInOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition shadow-md shadow-blue-600/20 text-nowrap"
          >
            <Plus size={16} />
            <span>Check-In</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Title Bar */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-2.5 bg-slate-50/50">
          <ReceiptText size={20} className="text-blue-600" />
          <h4 className="text-base font-bold text-slate-800">
            {activeTab === 'aktif'
              ? `Kendaraan Sedang Parkir (${displayedList.length})`
              : `Daftar Seluruh Transaksi (${displayedList.length})`}
          </h4>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-semibold bg-slate-50/30">
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-6">Plat Nomor</th>
                <th className="py-3.5 px-6">Jenis</th>
                <th className="py-3.5 px-6">Pemilik</th>
                <th className="py-3.5 px-6">Area Parkir</th>
                <th className="py-3.5 px-6">Waktu Masuk</th>
                {activeTab === 'aktif' ? (
                  <th className="py-3.5 px-6">Durasi Berjalan</th>
                ) : (
                  <th className="py-3.5 px-6">Waktu Keluar</th>
                )}
                <th className="py-3.5 px-6">Biaya</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Memuat data transaksi...
                  </td>
                </tr>
              ) : displayedList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    {activeTab === 'aktif'
                      ? 'Tidak ada kendaraan yang sedang parkir saat ini.'
                      : 'Tidak ada transaksi yang cocok dengan filter pencarian.'}
                  </td>
                </tr>
              ) : (
                displayedList.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-400">#{tx.id}</td>
                    <td className="py-4 px-6 font-bold text-slate-800 text-nowrap">
                      {tx.kendaraan?.platNomor || '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                          tx.kendaraan?.jenis === 'motor'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {tx.kendaraan?.jenis || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium text-xs">
                      {tx.kendaraan?.pemilik || 'Umum'}
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      {tx.areaParkir?.nama || '-'}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {formatDateTime(tx.waktuMasuk)}
                    </td>

                    {/* Durasi / Waktu Keluar */}
                    {activeTab === 'aktif' ? (
                      <td className="py-4 px-6 font-semibold text-amber-600">
                        {calculateDuration(tx.waktuMasuk)}
                      </td>
                    ) : (
                      <td className="py-4 px-6 text-slate-500">
                        {tx.waktuKeluar ? formatDateTime(tx.waktuKeluar) : (
                          <span className="font-semibold text-amber-600">
                            {calculateDuration(tx.waktuMasuk)}
                          </span>
                        )}
                      </td>
                    )}

                    {/* Biaya */}
                    <td className="py-4 px-3 font-semibold text-slate-800">
                      {formatRupiah(tx.biaya)}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-3">
                      {tx.status === 'AKTIF' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          AKTIF
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          SELESAI
                        </span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        {tx.status === 'AKTIF' && (
                          <button
                            onClick={() => handleCheckOut(tx)}
                            title="Keluar / Checkout"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition shadow-2xs"
                          >
                            <LogOut size={13} />
                            <span>Keluar</span>
                          </button>
                        )}
                        <button
                          onClick={() => openDetailModal(tx)}
                          title="Detail Struk"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Info size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Check-In Baru */}
      <Modal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        title="Check-In Parkir Baru"
      >
        <form onSubmit={handleCheckInSubmit} className="space-y-4">
          {checkInError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {checkInError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Pilih Kendaraan
            </label>
            <select
              value={selectedKendaraanId}
              onChange={(e) => setSelectedKendaraanId(Number(e.target.value))}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">-- Pilih Kendaraan Terdaftar --</option>
              {kendaraanList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.platNomor} ({k.jenis.toUpperCase()}) - {k.pemilik}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Pilih Area Parkir
            </label>
            <select
              value={selectedAreaId}
              onChange={(e) => setSelectedAreaId(Number(e.target.value))}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">-- Pilih Area Parkir --</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nama} (Slot: {a.slotMotorTersedia ?? a.kapasitasMotor} Motor,{' '}
                  {a.slotMobilTersedia ?? a.kapasitasMobil} Mobil)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsCheckInOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submittingCheckIn}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              {submittingCheckIn ? 'Menyimpan...' : 'Check-In Sekarang'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail / Struk Transaksi */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Detail Struk Parkir"
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              {/* Struk Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    No. Tiket
                  </p>
                  <p className="text-xl font-extrabold text-slate-800">
                    #{selectedTransaction.id}
                  </p>
                </div>
                <div>
                  {selectedTransaction.status === 'AKTIF' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      AKTIF
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                      SELESAI
                    </span>
                  )}
                </div>
              </div>

              {/* Data Kendaraan */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Data Kendaraan
                </p>
                <p className="text-base font-extrabold text-slate-800 tracking-wider">
                  {selectedTransaction.kendaraan?.platNomor || '-'}
                </p>
                <p className="text-xs text-slate-600">
                  Jenis: <strong className="uppercase">{selectedTransaction.kendaraan?.jenis || '-'}</strong> | Pemilik: <strong>{selectedTransaction.kendaraan?.pemilik || 'Umum'}</strong>
                </p>
              </div>

              {/* Data Lokasi */}
              <div className="space-y-1 pt-2 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Area Parkir
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {selectedTransaction.areaParkir?.nama || '-'}
                </p>
                {selectedTransaction.areaParkir?.lokasi && (
                  <p className="text-xs text-slate-500">
                    {selectedTransaction.areaParkir.lokasi}
                  </p>
                )}
              </div>

              {/* Waktu Masuk & Keluar */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar size={12} /> Waktu Masuk
                  </span>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {formatDateTime(selectedTransaction.waktuMasuk)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock size={12} /> Waktu Keluar
                  </span>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {selectedTransaction.waktuKeluar
                      ? formatDateTime(selectedTransaction.waktuKeluar)
                      : 'Sedang Parkir'}
                  </p>
                </div>
              </div>

              {/* Durasi & Biaya */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Durasi
                  </p>
                  <p className="text-sm font-bold text-amber-600 mt-0.5">
                    {selectedTransaction.durasiJam
                      ? `${selectedTransaction.durasiJam} Jam`
                      : calculateDuration(selectedTransaction.waktuMasuk)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Biaya
                  </p>
                  <p className="text-lg font-extrabold text-blue-600 mt-0.5">
                    {formatRupiah(selectedTransaction.biaya)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="px-5 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
