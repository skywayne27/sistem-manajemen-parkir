import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import type { PageType } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/Dashboard';
import { AreaParkirPage } from './pages/AreaParkir';
import { KendaraanPage } from './pages/Kendaraan';
import { TransaksiPage } from './pages/Transaksi';
import { checkApiHealth } from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [isApiConnected, setIsApiConnected] = useState<boolean>(false);

  // Periksa koneksi API secara berkala
  useEffect(() => {
    let isMounted = true;
    const verifyHealth = async () => {
      const isOnline = await checkApiHealth();
      if (isMounted) setIsApiConnected(isOnline);
    };

    verifyHealth();
    const interval = setInterval(verifyHealth, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Informasi header berdasarkan halaman aktif
  const getHeaderInfo = () => {
    switch (currentPage) {
      case 'dashboard':
        return {
          title: 'Dashboard Overview',
          subtitle: 'Statistik parkir dan transaksi aktif real-time',
        };
      case 'area-parkir':
        return {
          title: 'Manajemen Area Parkir',
          subtitle: 'Pengaturan kapasitas, lokasi, dan tarif parkir per jam',
        };
      case 'kendaraan':
        return {
          title: 'Manajemen Kendaraan',
          subtitle: 'Daftar registrasi motor & mobil yang terdaftar di sistem',
        };
      case 'transaksi':
        return {
          title: 'Transaksi Parkir',
          subtitle: 'Monitoring kendaraan aktif dan seluruh riwayat transaksi',
        };
      default:
        return {
          title: 'Sistem Manajemen Parkir',
          subtitle: 'Admin Management Web Client',
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar Navigasi */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isApiConnected={isApiConnected}
      />

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title={headerInfo.title} subtitle={headerInfo.subtitle} />

        <main className="flex-1 pb-16">
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'area-parkir' && <AreaParkirPage />}
          {currentPage === 'kendaraan' && <KendaraanPage />}
          {currentPage === 'transaksi' && <TransaksiPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
