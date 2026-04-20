import { ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react';
import { formatVND } from '../utils/format';

const CONFIG = {
  income: {
    label: 'Tổng thu',
    icon: ArrowUpCircle,
    className: 'text-income',
    bg: 'bg-green-50',
  },
  expense: {
    label: 'Tổng chi',
    icon: ArrowDownCircle,
    className: 'text-expense',
    bg: 'bg-red-50',
  },
  balance: {
    label: 'Số dư',
    icon: Wallet,
    className: 'text-primary',
    bg: 'bg-blue-50',
  },
};

export default function SummaryCard({ variant, value }) {
  const cfg = CONFIG[variant];
  const Icon = cfg.icon;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-600">{cfg.label}</span>
        <div className={`p-2 rounded-lg ${cfg.bg}`}>
          <Icon className={cfg.className} size={20} />
        </div>
      </div>
      <div className={`text-2xl font-bold ${cfg.className}`}>{formatVND(value)}</div>
    </div>
  );
}
