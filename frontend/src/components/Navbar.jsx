import { LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="text-primary" size={24} />
          <span className="text-lg font-bold">Finance Tracker</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600 hidden md:block">
            {user?.full_name || user?.email}
          </span>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1 text-sm text-slate-700 hover:text-expense"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}
