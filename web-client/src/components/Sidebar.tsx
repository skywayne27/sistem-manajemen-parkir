import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Car,
  ReceiptText,
  ShieldCheck,
  Circle,
} from 'lucide-react';

export type PageType = 'dashboard' | 'area-parkir' | 'kendaraan' | 'transaksi';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  isApiConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  isApiConnected,
}) => {
  const menuItems: { id: PageType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: 'area-parkir',
      label: 'Area Parkir',
      icon: <Building2 size={20} />,
    },
    {
      id: 'kendaraan',
      label: 'Kendaraan',
      icon: <Car size={20} />,
    },
    {
      id: 'transaksi',
      label: 'Transaksi Parkir',
      icon: <ReceiptText size={20} />,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shadow-sm select-none">
      <div>
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div>
            <h1 className="font-bold text-slate-800 text-base leading-tight tracking-wide">
              PARKIR DIGITAL
            </h1>
            <p className="text-xs text-slate-500 font-medium">Admin Management</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Status Koneksi di footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Circle
            size={10}
            className={`fill-current ${
              isApiConnected ? 'text-emerald-500 animate-pulse' : 'text-rose-500'
            }`}
          />
          <span
            className={`font-semibold ${
              isApiConnected ? 'text-slate-700' : 'text-rose-600'
            }`}
          >
            {isApiConnected ? 'API Connected' : 'API Disconnected'}
          </span>
        </div>
        <ShieldCheck
          size={16}
          className={isApiConnected ? 'text-emerald-600' : 'text-slate-400'}
        />
      </div>
    </aside>
  );
};
