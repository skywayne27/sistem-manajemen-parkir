import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Bike,
  Car,
  Banknote,
  RotateCw,
  Plus,
  LogOut,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { apiAreaParkir, apiTransaksi, apiKendaraan } from '../services/api';
import type { AreaParkir, Kendaraan, TransaksiParkir } from '../types/type';
import { Modal } from '../components/Modal';

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Data State
  const [activeTransactions, setActiveTransactions] = useState<TransaksiParkir[]>([]);
  const [areas, setAreas] = useState<AreaParkir[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [kendaraanList, setKendaraanList] = useState<Kendaraan[]>([]);

  // Modal Check-In State (sementara)
  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(false);
  const [selectedKendaraanId, setSelectedKendaraanId] = useState<number | ''>('');
  const [selectedAreaId, setSelectedAreaId] = useState<number | ''>('');
  const [submittingCheckIn, setSubmittingCheckIn] = useState<boolean>(false);
  const [checkInMessage, setCheckInMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Modal Checkout Feedback State
  const [checkoutFeedback, setCheckoutFeedback] = useState<string | null>(null);

  // Load Data
  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);
      const [aktifList, areaList, allTransactions, vehicles] = await Promise.all([
        apiTransaksi.getAktif(),
        apiAreaParkir.getAll(),
        apiTransaksi.getAll({ status: 'SELESAI' }),
        apiKendaraan.getAll(),
      ]);

      setActiveTransactions(aktifList);
      setAreas(areaList);
      setKendaraanList(vehicles);

      // Hitung total pendapatan selesai
      const rev = allTransactions.reduce((acc, curr) => acc + (curr.biaya || 0), 0);
      setTotalRevenue(rev);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Gagal memuat data dashboard');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Hitung total kapasitas & ketersediaan slot
  const totalSlotMotor = areas.reduce((acc, a) => acc + (a.slotMotorTersedia ?? 0), 0);
  const totalKapasitasMotor = areas.reduce((acc, a) => acc + (a.kapasitasMotor ?? 0), 0);

  const totalSlotMobil = areas.reduce((acc, a) => acc + (a.slotMobilTersedia ?? 0), 0);
  const totalKapasitasMobil = areas.reduce((acc, a) => acc + (a.kapasitasMobil ?? 0), 0);

  // Format durasi parkir berjalan
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

  // Format jam masuk
  const formatTime = (isoString: string): string => {
    try {
      const d = new Date(isoString);
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      return `${h}.${m} WIB`;
    } catch {
      return '-';
    }
  };

  // Format Rupiah
  const formatRupiah = (val: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Handle Check-Out
  const handleCheckOut = async (id: number) => {
    if (!window.confirm(`Konfirmasi checkout untuk transaksi #${id}?`)) return;

    try {
      const res = await apiTransaksi.checkOut(id);
      setCheckoutFeedback(
        `Kendaraan ${res.kendaraan?.platNomor || ''} berhasil keluar! Total biaya: ${formatRupiah(
          res.biaya || 0
        )} (Durasi: ${res.durasiJam || 1} jam)`
      );
      loadDashboardData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal memproses checkout');
    }
  };

  // Handle Submit Check-In
  const handleCheckInSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedKendaraanId || !selectedAreaId) {
      setCheckInMessage({ type: 'error', text: 'Pilih kendaraan dan area parkir terlebih dahulu' });
      return;
    }

    setSubmittingCheckIn(true);
    setCheckInMessage(null);

    try {
      await apiTransaksi.checkIn({
        kendaraanId: Number(selectedKendaraanId),
        areaParkirId: Number(selectedAreaId),
      });

      setCheckInMessage({ type: 'success', text: 'Check-in berhasil dibuat!' });
      setTimeout(() => {
        setIsCheckInOpen(false);
        setSelectedKendaraanId('');
        setSelectedAreaId('');
        setCheckInMessage(null);
        loadDashboardData();
      }, 1000);
    } catch (err: unknown) {
      setCheckInMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Gagal melakukan check-in',
      });
    } finally {
      setSubmittingCheckIn(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Alert Feedback Checkout */}
      {checkoutFeedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <span className="font-medium text-sm">{checkoutFeedback}</span>
          </div>
          <button
            onClick={() => setCheckoutFeedback(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-2 py-1"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header Bar Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Ringkasan Operasional</h3>
          <p className="text-sm text-slate-500">
            Pantau pergerakan kendaraan dan kapasitas slot secara langsung
          </p>
        </div>

        <div className="flex items-center gap-3">
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
              setCheckInMessage(null);
              setIsCheckInOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition shadow-md shadow-blue-600/20"
          >
            <Plus size={16} />
            <span>Check-In Kendaraan (testing)</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3">
          <AlertCircle size={20} className="text-rose-600 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 h-36">
        {/* Card 1: Kendaraan Parkir Aktif */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden" >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600">Kendaraan Parkir Aktif</p>
              <h4 className="text-2xl font-extrabold text-slate-800 mt-1">
                {loading ? '...' : `${activeTransactions.length} Unit`}
              </h4>
              <p className="text-xs text-slate-500 mt-1">Sedang berada di dalam area</p>
            </div>
            <div className="w-8 h-8 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity size={24} />
            </div>
          </div>
        </div>

        {/* Card 2: Slot Motor Tersedia */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600">Slot Motor Tersedia</p>
              <h4 className="text-2xl font-extrabold text-slate-800 mt-1">
                {loading ? '...' : `${totalSlotMotor} Slot`}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Dari total {totalKapasitasMotor} kapasitas motor
              </p>
            </div>
            <div className="w-8 h-8 rounded-sm bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bike size={24} />
            </div>
          </div>
        </div>

        {/* Card 3: Slot Mobil Tersedia */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600">Slot Mobil Tersedia</p>
              <h4 className="text-2xl font-extrabold text-slate-800 mt-1">
                {loading ? '...' : `${totalSlotMobil} Slot`}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Dari total {totalKapasitasMobil} kapasitas mobil
              </p>
            </div>
            <div className="w-8 h-8 rounded-sm bg-blue-50 text-blue-600 flex items-center justify-center">
              <Car size={24} />
            </div>
          </div>
        </div>

        {/* Card 4: Total Pendapatan Selesai */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600">Total Pendapatan</p>
              <h4 className="text-2xl font-extrabold text-slate-800 mt-1">
                {loading ? '...' : formatRupiah(totalRevenue)}
              </h4>
              <p className="text-xs text-slate-500 mt-1">Akumulasi biaya parkir selesai</p>
            </div>
            <div className="w-8 h-8 rounded-sm bg-purple-50 text-purple-600 flex items-center justify-center">
              <Banknote size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Transaksi Aktif */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header Section */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-emerald-500" />
            <h4 className="text-base font-bold text-slate-800">
              Transaksi Parkir Aktif ({activeTransactions.length})
            </h4>
          </div>
          <span className="text-xs text-slate-500">Menampilkan kendaraan yang belum checkout</span>
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
                <th className="py-3.5 px-6">Durasi Berjalan</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Memuat data transaksi aktif...
                  </td>
                </tr>
              ) : activeTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada kendaraan yang sedang parkir saat ini.
                  </td>
                </tr>
              ) : (
                activeTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-400">#{tx.id}</td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {tx.kendaraan?.platNomor || '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          tx.kendaraan?.jenis === 'motor'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {tx.kendaraan?.jenis || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-xs font-medium">
                      {tx.kendaraan?.pemilik || 'Umum'}
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      {tx.areaParkir?.nama || '-'}
                    </td>
                    <td className="py-4 px-4 text-slate-500">{formatTime(tx.waktuMasuk)}</td>
                    <td className="py-4 px-6 font-semibold text-amber-600">
                      {calculateDuration(tx.waktuMasuk)}
                    </td>
                    <td className="py-4 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        AKTIF
                      </span>
                    </td>
                    <td className="py-4 px-3 text-center">
                      <button
                        onClick={() => handleCheckOut(tx.id)}
                        className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition shadow-2xs"
                      >
                        <LogOut size={13} />
                        <span>Keluar</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Check-In Kendaraan Baru */}
      <Modal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        title="Check-In Kendaraan Masuk"
      >
        <form onSubmit={handleCheckInSubmit} className="space-y-4">
          {checkInMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-medium ${
                checkInMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {checkInMessage.text}
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
    </div>
  );
};
