import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import MonthlyChart from '../components/MonthlyChart';
import Navbar from '../components/Navbar';
import SummaryCard from '../components/SummaryCard';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';

export default function Dashboard() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [summary, setSummary] = useState(null);
  const [chart, setChart] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c, cats, txs] = await Promise.all([
        api.get('/transactions/summary', { params: { month, year } }),
        api.get('/transactions/monthly-chart'),
        api.get('/categories'),
        api.get('/transactions', { params: { month, year } }),
      ]);
      setSummary(s.data);
      setChart(c.data.data);
      setCategories(cats.data);
      setTransactions(txs.data);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const years = useMemo(() => {
    const current = now.getFullYear();
    return [current - 2, current - 1, current, current + 1];
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h1 className="text-2xl font-bold">Tổng quan</h1>
          <div className="flex gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard variant="income" value={summary?.total_income} />
          <SummaryCard variant="expense" value={summary?.total_expense} />
          <SummaryCard variant="balance" value={summary?.balance} />
        </div>

        <MonthlyChart data={chart} />

        <TransactionForm categories={categories} onCreated={loadAll} />

        <TransactionList
          transactions={transactions}
          categories={categories}
          onChanged={loadAll}
        />

        {loading && (
          <div className="text-center text-slate-500 text-sm">Đang tải...</div>
        )}
      </main>
    </div>
  );
}
