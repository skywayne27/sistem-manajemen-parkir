import type { AreaParkir, Kendaraan, TransaksiParkir, ApiResponse } from '../types/type';

const BASE_URL = 'http://localhost:3000/api';

// Helper untuk request fetch
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || `Request gagal dengan status ${response.status}`);
  }

  return json.data;
}

// ================= AREA PARKIR
export const apiAreaParkir = {
  // Ambil semua area parkir beserta sisa slot
  getAll: () => request<AreaParkir[]>('/area-parkir'),

  // Ambil detail 1 area parkir
  getById: (id: number) => request<AreaParkir>(`/area-parkir/${id}`),

  // Tambah area parkir baru
  create: (data: {
    nama: string;
    lokasi: string;
    kapasitasMotor: number;
    kapasitasMobil: number;
    tarifPerJamMotor: number;
    tarifPerJamMobil: number;
  }) =>
    request<AreaParkir>('/area-parkir', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Perbarui data area parkir
  update: (
    id: number,
    data: Partial<{
      nama: string;
      lokasi: string;
      kapasitasMotor: number;
      kapasitasMobil: number;
      tarifPerJamMotor: number;
      tarifPerJamMobil: number;
    }>
  ) =>
    request<AreaParkir>(`/area-parkir/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Hapus area parkir
  delete: (id: number) =>
    request<null>(`/area-parkir/${id}`, {
      method: 'DELETE',
    }),
};

// ================= KENDARAAN
export const apiKendaraan = {
  // Ambil daftar kendaraan, opsi filter jenis (motor/mobil)
  getAll: (jenis?: 'motor' | 'mobil') => {
    const query = jenis ? `?jenis=${jenis}` : '';
    return request<Kendaraan[]>(`/kendaraan${query}`);
  },

  // Ambil detail 1 kendaraan
  getById: (id: number) => request<Kendaraan>(`/kendaraan/${id}`),

  // Cari kendaraan berdasarkan plat nomor
  getByPlat: (platNomor: string) =>
    request<Kendaraan>(`/kendaraan/plat/${encodeURIComponent(platNomor.trim())}`),

  // Daftarkan kendaraan baru
  create: (data: { platNomor: string; jenis: 'motor' | 'mobil'; pemilik?: string }) =>
    request<Kendaraan>('/kendaraan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Perbarui data kendaraan
  update: (
    id: number,
    data: Partial<{ platNomor: string; jenis: 'motor' | 'mobil'; pemilik: string }>
  ) =>
    request<Kendaraan>(`/kendaraan/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Hapus kendaraan
  delete: (id: number) =>
    request<null>(`/kendaraan/${id}`, {
      method: 'DELETE',
    }),
};

// ================= TRANSAKSI PARKIR
export const apiTransaksi = {
  // Ambil semua transaksi (bisa difilter berdasarkan status atau area)
  getAll: (params?: { status?: string; areaParkirId?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.areaParkirId) query.append('areaParkirId', params.areaParkirId.toString());
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<TransaksiParkir[]>(`/transaksi${queryString}`);
  },

  // Ambil transaksi yang sedang AKTIF (sedang parkir)
  getAktif: () => request<TransaksiParkir[]>('/transaksi/aktif'),

  // Ambil detail satu transaksi
  getById: (id: number) => request<TransaksiParkir>(`/transaksi/${id}`),

  // Ambil riwayat parkir kendaraan tertentu
  getByKendaraanId: (kendaraanId: number) =>
    request<TransaksiParkir[]>(`/transaksi/kendaraan/${kendaraanId}`),

  // Check-In kendaraan (mulai transaksi masuk, sementara)
  checkIn: (data: { kendaraanId: number; areaParkirId: number }) =>
    request<TransaksiParkir>('/transaksi', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Check-Out kendaraan (selesaikan transaksi & hitung tarif, sementara)
  checkOut: (id: number) =>
    request<TransaksiParkir>(`/transaksi/${id}/keluar`, {
      method: 'PUT',
    }),
};

// Helper cek status koneksi API Server
export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch('http://localhost:3000/');
    return res.ok;
  } catch {
    return false;
  }
}
