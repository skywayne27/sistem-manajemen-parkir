import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Building2,
  Search,
  RotateCw,
  Plus,
  Info,
  Pencil,
  Trash2,
  Bike,
  Car,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { apiAreaParkir } from '../services/api';
import type { AreaParkir } from '../types/type';
import { Modal } from '../components/Modal';

export const AreaParkirPage: React.FC = () => {
  const [areas, setAreas] = useState<AreaParkir[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search Query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [selectedArea, setSelectedArea] = useState<AreaParkir | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    lokasi: '',
    kapasitasMotor: 50,
    kapasitasMobil: 20,
    tarifPerJamMotor: 2000,
    tarifPerJamMobil: 5000,
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load Data
  const loadAreas = useCallback(async () => {
    try {
      setError(null);
      const data = await apiAreaParkir.getAll();
      setAreas(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data area parkir');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAreas();
  };

  // Filtered Areas
  const filteredAreas = useMemo(() => {
    if (!searchQuery.trim()) return areas;
    const q = searchQuery.toLowerCase();
    return areas.filter(
      (a) => a.nama.toLowerCase().includes(q) || a.lokasi.toLowerCase().includes(q)
    );
  }, [areas, searchQuery]);

  // Open Create Modal, default
  const openCreateModal = () => {
    setFormData({
      nama: '',
      lokasi: '',
      kapasitasMotor: 50,
      kapasitasMobil: 20,
      tarifPerJamMotor: 2000,
      tarifPerJamMobil: 5000,
    });
    setFormError(null);
    setIsCreateOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (area: AreaParkir) => {
    setSelectedArea(area);
    setFormData({
      nama: area.nama,
      lokasi: area.lokasi,
      kapasitasMotor: area.kapasitasMotor,
      kapasitasMobil: area.kapasitasMobil,
      tarifPerJamMotor: area.tarifPerJamMotor,
      tarifPerJamMobil: area.tarifPerJamMobil,
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  // Open Detail Modal
  const openDetailModal = (area: AreaParkir) => {
    setSelectedArea(area);
    setIsDetailOpen(true);
  };

  // Handle Submit Create
  const handleCreateSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      await apiAreaParkir.create({
        nama: formData.nama.trim(),
        lokasi: formData.lokasi.trim(),
        kapasitasMotor: Number(formData.kapasitasMotor),
        kapasitasMobil: Number(formData.kapasitasMobil),
        tarifPerJamMotor: Number(formData.tarifPerJamMotor),
        tarifPerJamMobil: Number(formData.tarifPerJamMobil),
      });

      setSuccessMessage('Area parkir baru berhasil ditambahkan');
      setIsCreateOpen(false);
      loadAreas();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Gagal menambahkan area');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Submit Edit
  const handleEditSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedArea) return;

    setSubmitting(true);
    setFormError(null);

    try {
      await apiAreaParkir.update(selectedArea.id, {
        nama: formData.nama.trim(),
        lokasi: formData.lokasi.trim(),
        kapasitasMotor: Number(formData.kapasitasMotor),
        kapasitasMobil: Number(formData.kapasitasMobil),
        tarifPerJamMotor: Number(formData.tarifPerJamMotor),
        tarifPerJamMobil: Number(formData.tarifPerJamMobil),
      });

      setSuccessMessage('Data area parkir berhasil diperbarui');
      setIsEditOpen(false);
      loadAreas();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Gagal memperbarui area');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (area: AreaParkir) => {
    if (
      !window.confirm(
        `Yakin ingin menghapus "${area.nama}"? Pastikan tidak ada transaksi aktif di area ini.`
      )
    ) {
      return;
    }

    try {
      await apiAreaParkir.delete(area.id);
      setSuccessMessage(`Area "${area.nama}" berhasil dihapus`);
      loadAreas();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus area parkir');
    }
  };

  const formatRupiah = (val: number): string => {
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

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3">
          <AlertCircle size={18} className="text-rose-600" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Top Search & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama area atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
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
            <span>Tambah Area Parkir</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Title Bar */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-2.5 bg-slate-50/50">
          <Building2 size={20} className="text-blue-600" />
          <h4 className="text-base font-bold text-slate-800">
            Daftar Lokasi & Kapasitas Parkir ({filteredAreas.length})
          </h4>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-semibold bg-slate-50/30">
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-6">Nama Area</th>
                <th className="py-3.5 px-6">Lokasi</th>
                <th className="py-3.5 px-6">Kapasitas</th>
                <th className="py-3.5 px-6">Tarif per Jam</th>
                <th className="py-3.5 px-6">Slot Tersedia</th>
                <th className="py-3.5 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Memuat data area parkir...
                  </td>
                </tr>
              ) : filteredAreas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada area parkir yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredAreas.map((area) => (
                  <tr key={area.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-400">#{area.id}</td>
                    <td className="py-4 px-6 font-bold text-slate-800">{area.nama}</td>
                    <td className="py-4 px-6 text-slate-600">{area.lokasi}</td>
                    <td className="py-4 px-6">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Bike size={14} className="text-amber-500" />
                          <span>
                            Motor: <strong>{area.kapasitasMotor}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Car size={14} className="text-blue-500" />
                          <span>
                            Mobil: <strong>{area.kapasitasMobil}</strong>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1 text-xs text-slate-600">
                        <p>Motor: {formatRupiah(area.tarifPerJamMotor)}</p>
                        <p>Mobil: {formatRupiah(area.tarifPerJamMobil)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1 text-xs font-semibold">
                        <p className="text-emerald-600">
                          Motor: {area.slotMotorTersedia ?? area.kapasitasMotor} slot
                        </p>
                        <p className="text-emerald-600">
                          Mobil: {area.slotMobilTersedia ?? area.kapasitasMobil} slot
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openDetailModal(area)}
                          title="Detail Area"
                          className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Info size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(area)}
                          title="Edit Area"
                          className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(area)}
                          title="Hapus Area"
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

      {/* Modal Tambah Area Parkir */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tambah Area Parkir Baru"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nama Area Parkir
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Parkir Basement A"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Lokasi
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Gedung Utama Lt. B1"
              value={formData.lokasi}
              onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Kapasitas Motor
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.kapasitasMotor}
                onChange={(e) =>
                  setFormData({ ...formData, kapasitasMotor: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Kapasitas Mobil
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.kapasitasMobil}
                onChange={(e) =>
                  setFormData({ ...formData, kapasitasMobil: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tarif / Jam Motor
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.tarifPerJamMotor}
                onChange={(e) =>
                  setFormData({ ...formData, tarifPerJamMotor: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tarif / Jam Mobil
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.tarifPerJamMobil}
                onChange={(e) =>
                  setFormData({ ...formData, tarifPerJamMobil: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
              {submitting ? 'Menyimpan...' : 'Simpan Area'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Area Parkir */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Area: ${selectedArea?.nama || ''}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nama Area Parkir
            </label>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Lokasi
            </label>
            <input
              type="text"
              required
              value={formData.lokasi}
              onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Kapasitas Motor
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.kapasitasMotor}
                onChange={(e) =>
                  setFormData({ ...formData, kapasitasMotor: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Kapasitas Mobil
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.kapasitasMobil}
                onChange={(e) =>
                  setFormData({ ...formData, kapasitasMobil: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tarif / Jam Motor
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.tarifPerJamMotor}
                onChange={(e) =>
                  setFormData({ ...formData, tarifPerJamMotor: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tarif / Jam Mobil
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.tarifPerJamMobil}
                onChange={(e) =>
                  setFormData({ ...formData, tarifPerJamMobil: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
              {submitting ? 'Menyimpan...' : 'Perbarui Area'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail Area Parkir */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Detail Area Parkir"
      >
        {selectedArea && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Nama Area</p>
                <p className="text-base font-bold text-slate-800">{selectedArea.nama}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Lokasi</p>
                <p className="text-sm font-medium text-slate-700">{selectedArea.lokasi}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Kapasitas Motor</p>
                  <p className="text-sm font-bold text-slate-800">{selectedArea.kapasitasMotor} Unit</p>
                  <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                    Tersedia: {selectedArea.slotMotorTersedia ?? selectedArea.kapasitasMotor} slot
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Kapasitas Mobil</p>
                  <p className="text-sm font-bold text-slate-800">{selectedArea.kapasitasMobil} Unit</p>
                  <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                    Tersedia: {selectedArea.slotMobilTersedia ?? selectedArea.kapasitasMobil} slot
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Tarif Motor</p>
                  <p className="text-sm font-bold text-slate-800">
                    {formatRupiah(selectedArea.tarifPerJamMotor)} / jam
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">Tarif Mobil</p>
                  <p className="text-sm font-bold text-slate-800">
                    {formatRupiah(selectedArea.tarifPerJamMobil)} / jam
                  </p>
                </div>
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
    </div>
  );
};
