import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Car,
  Search,
  RotateCw,
  Plus,
  Info,
  Pencil,
  Trash2,
  History,
  Key,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { apiKendaraan, apiTransaksi } from '../services/api';
import type { Kendaraan, TransaksiParkir } from '../types/type';
import { Modal } from '../components/Modal';

export const KendaraanPage: React.FC = () => {
  const [kendaraanList, setKendaraanList] = useState<Kendaraan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedJenisFilter, setSelectedJenisFilter] = useState<'semua' | 'motor' | 'mobil'>('semua');

  // Direct Plat Search API
  const [directPlatInput, setDirectPlatInput] = useState<string>('');
  const [searchingPlat, setSearchingPlat] = useState<boolean>(false);
  const [directPlatResult, setDirectPlatResult] = useState<Kendaraan | null>(null);
  const [directPlatError, setDirectPlatError] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [selectedKendaraan, setSelectedKendaraan] = useState<Kendaraan | null>(null);

  // History State
  const [vehicleHistory, setVehicleHistory] = useState<TransaksiParkir[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    platNomor: '',
    jenis: 'mobil' as 'mobil' | 'motor',
    pemilik: '',
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load Data
  const loadKendaraan = useCallback(async () => {
    try {
      setError(null);
      const data = await apiKendaraan.getAll();
      setKendaraanList(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data kendaraan');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadKendaraan();
  }, [loadKendaraan]);

  const handleRefresh = () => {
    setRefreshing(true);
    setDirectPlatResult(null);
    setDirectPlatError(null);
    loadKendaraan();
  };

  // Filter List
  const filteredList = useMemo(() => {
    return kendaraanList.filter((k) => {
      const matchJenis =
        selectedJenisFilter === 'semua' ? true : k.jenis.toLowerCase() === selectedJenisFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        k.platNomor.toLowerCase().includes(q) ||
        (k.pemilik && k.pemilik.toLowerCase().includes(q));
      return matchJenis && matchSearch;
    });
  }, [kendaraanList, selectedJenisFilter, searchQuery]);

  // Handle Direct Plat Search API
  const handleDirectPlatSearch = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!directPlatInput.trim()) return;

    setSearchingPlat(true);
    setDirectPlatResult(null);
    setDirectPlatError(null);

    try {
      const found = await apiKendaraan.getByPlat(directPlatInput);
      setDirectPlatResult(found);
    } catch (err: unknown) {
      setDirectPlatError(err instanceof Error ? err.message : 'Kendaraan tidak ditemukan');
    } finally {
      setSearchingPlat(false);
    }
  };

  // Open Create
  const openCreateModal = () => {
    setFormData({
      platNomor: '',
      jenis: 'mobil',
      pemilik: 'Umum',
    });
    setFormError(null);
    setIsCreateOpen(true);
  };

  // Open Edit
  const openEditModal = (k: Kendaraan) => {
    setSelectedKendaraan(k);
    setFormData({
      platNomor: k.platNomor,
      jenis: k.jenis,
      pemilik: k.pemilik || 'Umum',
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  // Open Detail
  const openDetailModal = (k: Kendaraan) => {
    setSelectedKendaraan(k);
    setIsDetailOpen(true);
  };

  // Open History Modal
  const openHistoryModal = async (k: Kendaraan) => {
    setSelectedKendaraan(k);
    setIsHistoryOpen(true);
    setLoadingHistory(true);
    try {
      const historyData = await apiTransaksi.getByKendaraanId(k.id);
      setVehicleHistory(historyData);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal memuat riwayat kendaraan');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Submit Create
  const handleCreateSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      await apiKendaraan.create({
        platNomor: formData.platNomor.toUpperCase().trim(),
        jenis: formData.jenis,
        pemilik: formData.pemilik.trim() || 'Umum',
      });

      setSuccessMessage('Kendaraan berhasil didaftarkan ke sistem');
      setIsCreateOpen(false);
      loadKendaraan();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Gagal mendaftarkan kendaraan');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedKendaraan) return;

    setSubmitting(true);
    setFormError(null);

    try {
      await apiKendaraan.update(selectedKendaraan.id, {
        platNomor: formData.platNomor.toUpperCase().trim(),
        jenis: formData.jenis,
        pemilik: formData.pemilik.trim() || 'Umum',
      });

      setSuccessMessage('Data kendaraan berhasil diperbarui');
      setIsEditOpen(false);
      loadKendaraan();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Gagal memperbarui kendaraan');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (k: Kendaraan) => {
    if (
      !window.confirm(
        `Yakin ingin menghapus data kendaraan [${k.platNomor}]? Pastikan tidak sedang memiliki transaksi aktif.`
      )
    ) {
      return;
    }

    try {
      await apiKendaraan.delete(k.id);
      setSuccessMessage(`Kendaraan ${k.platNomor} berhasil dihapus`);
      loadKendaraan();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus kendaraan');
    }
  };

  const formatDate = (isoString?: string): string => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
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

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3">
          <AlertCircle size={18} className="text-rose-600" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari plat nomor atau pemilik..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          <select
            value={selectedJenisFilter}
            onChange={(e) =>
              setSelectedJenisFilter(e.target.value as 'semua' | 'motor' | 'mobil')
            }
            className="w-full sm:w-52 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-700"
          >
            <option value="semua">Semua Tipe Kendaraan</option>
            <option value="motor">Motor</option>
            <option value="mobil">Mobil</option>
          </select>
        </div>

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
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition shadow-md shadow-blue-600/20"
          >
            <Plus size={16} />
            <span>Daftarkan Kendaraan</span>
          </button>
        </div>
      </div>

      {/* Direct Plat Search Bar (API /kendaraan/plat/:platNomor) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold shrink-0">
          <Key size={16} className="text-blue-600" />
          <span>Cek Langsung Plat Nomor:</span>
        </div>

        <form onSubmit={handleDirectPlatSearch} className="flex-1 flex items-center gap-3 w-full">
          <input
            type="text"
            placeholder="Masukkan plat persis (mis: B 1234 ABC)"
            value={directPlatInput}
            onChange={(e) => setDirectPlatInput(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 uppercase"
          />
          <button
            type="submit"
            disabled={searchingPlat}
            className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition disabled:opacity-50 shrink-0"
          >
            {searchingPlat ? 'Mencari...' : 'Cari by Plat (API)'}
          </button>
        </form>
      </div>

      {/* Result Direct Plat Search */}
      {(directPlatResult || directPlatError) && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            directPlatResult
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {directPlatResult ? (
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-blue-600" />
              <span>
                Ditemukan: <strong>{directPlatResult.platNomor}</strong> ({directPlatResult.jenis.toUpperCase()}) - Pemilik: <strong>{directPlatResult.pemilik}</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-600" />
              <span>{directPlatError}</span>
            </div>
          )}
          <button
            onClick={() => {
              setDirectPlatResult(null);
              setDirectPlatError(null);
            }}
            className="text-xs font-semibold px-2 py-1 text-slate-600 hover:text-slate-800"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Title Bar */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-2.5 bg-slate-50/50">
          <Car size={20} className="text-blue-600" />
          <h4 className="text-base font-bold text-slate-800">
            Daftar Kendaraan Terdaftar ({filteredList.length})
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
                <th className="py-3.5 px-6">Nama Pemilik</th>
                <th className="py-3.5 px-6">Waktu Registrasi</th>
                <th className="py-3.5 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Memuat data kendaraan...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada kendaraan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-400">#{k.id}</td>
                    <td className="py-4 px-6 font-bold text-slate-800 tracking-wider">
                      {k.platNomor}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          k.jenis === 'motor'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {k.jenis}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {k.pemilik || 'Umum'}
                    </td>
                    <td className="py-4 px-6 text-slate-500">{formatDate(k.createdAt)}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openDetailModal(k)}
                          title="Detail Kendaraan"
                          className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Info size={16} />
                        </button>
                        <button
                          onClick={() => openHistoryModal(k)}
                          title="Riwayat Parkir"
                          className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                        >
                          <History size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(k)}
                          title="Edit Kendaraan"
                          className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(k)}
                          title="Hapus Kendaraan"
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 size={16} />
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

      {/* Modal Daftarkan Kendaraan */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Daftarkan Kendaraan Baru"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Plat Nomor
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: B 1234 ABC"
              value={formData.platNomor}
              onChange={(e) => setFormData({ ...formData, platNomor: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Jenis Kendaraan
            </label>
            <select
              value={formData.jenis}
              onChange={(e) =>
                setFormData({ ...formData, jenis: e.target.value as 'mobil' | 'motor' })
              }
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="mobil">Mobil</option>
              <option value="motor">Motor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nama Pemilik
            </label>
            <input
              type="text"
              placeholder="Nama Pemilik (default: Umum)"
              value={formData.pemilik}
              onChange={(e) => setFormData({ ...formData, pemilik: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Daftarkan Kendaraan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Kendaraan */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Data Kendaraan: ${selectedKendaraan?.platNomor || ''}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Plat Nomor
            </label>
            <input
              type="text"
              required
              value={formData.platNomor}
              onChange={(e) => setFormData({ ...formData, platNomor: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Jenis Kendaraan
            </label>
            <select
              value={formData.jenis}
              onChange={(e) =>
                setFormData({ ...formData, jenis: e.target.value as 'mobil' | 'motor' })
              }
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="mobil">Mobil</option>
              <option value="motor">Motor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nama Pemilik
            </label>
            <input
              type="text"
              value={formData.pemilik}
              onChange={(e) => setFormData({ ...formData, pemilik: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Perbarui Data'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail Kendaraan */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Detail Kendaraan"
      >
        {selectedKendaraan && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Plat Nomor</p>
                <p className="text-lg font-bold text-slate-800 tracking-wider">
                  {selectedKendaraan.platNomor}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Jenis</p>
                  <p className="text-sm font-bold text-slate-800 uppercase">
                    {selectedKendaraan.jenis}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Pemilik</p>
                  <p className="text-sm font-bold text-slate-800">
                    {selectedKendaraan.pemilik || 'Umum'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Terdaftar Pada</p>
                <p className="text-sm text-slate-600">{formatDate(selectedKendaraan.createdAt)}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
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

      {/* Modal Riwayat Parkir Kendaraan */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title={`Riwayat Parkir: ${selectedKendaraan?.platNomor || ''}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          {loadingHistory ? (
            <p className="text-sm text-slate-500 py-6 text-center">Memuat riwayat transaksi...</p>
          ) : vehicleHistory.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              Belum ada riwayat transaksi parkir untuk kendaraan ini.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Area Parkir</th>
                    <th className="py-2.5 px-3">Waktu Masuk</th>
                    <th className="py-2.5 px-3">Waktu Keluar</th>
                    <th className="py-2.5 px-3">Biaya</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {vehicleHistory.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-400">#{tx.id}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {tx.areaParkir?.nama || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {formatDate(tx.waktuMasuk)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {tx.waktuKeluar ? formatDate(tx.waktuKeluar) : '-'}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {formatRupiah(tx.biaya)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-2xs font-bold uppercase ${
                            tx.status === 'AKTIF'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsHistoryOpen(false)}
              className="px-5 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
