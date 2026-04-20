import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatVND } from '../utils/format';

export default function MonthlyChart({ data }) {
  const chartData = (data || []).map((d) => ({
    month: d.month.slice(5) + '/' + d.month.slice(2, 4),
    'Thu nhập': Number(d.income),
    'Chi tiêu': Number(d.expense),
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold mb-4">Thu chi 6 tháng gần nhất</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis
              fontSize={12}
              tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
            />
            <Tooltip formatter={(v) => formatVND(v)} />
            <Legend />
            <Bar dataKey="Thu nhập" fill="#16A34A" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Chi tiêu" fill="#DC2626" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
