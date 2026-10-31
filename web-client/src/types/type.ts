// Definisi data Area Parkir
export interface AreaParkir {
  id: number;
  nama: string;
  lokasi: string;
  kapasitasMotor: number;
  kapasitasMobil: number;
  tarifPerJamMotor: number;
  tarifPerJamMobil: number;
  createdAt?: string;
  slotMotorTersedia?: number;
  slotMobilTersedia?: number;
}

// Definisi data Kendaraan
export interface Kendaraan {
  id: number;
  platNomor: string;
  jenis: 'motor' | 'mobil';
  pemilik: string;
  createdAt?: string;
}

// Definisi data Transaksi Parkir
export interface TransaksiParkir {
  id: number;
  kendaraanId: number;
  areaParkirId: number;
  waktuMasuk: string;
  waktuKeluar: string | null;
  biaya: number | null;
  status: 'AKTIF' | 'SELESAI';
  createdAt?: string;
  durasiJam?: number;
  kendaraan?: {
    platNomor: string;
    jenis: 'motor' | 'mobil';
    pemilik: string;
  };
  areaParkir?: {
    nama: string;
    lokasi?: string;
    tarifPerJamMotor?: number;
    tarifPerJamMobil?: number;
  };
}

// Format respon standar dari API Server
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
