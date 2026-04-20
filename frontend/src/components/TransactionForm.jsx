import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { todayISO } from '../utils/format';

const EMPTY = {
  type: 'expense',
  amount: '',
  category_id: '',
  description: '',
  date: todayISO(),
};

export default function TransactionForm({ categories, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === form.type),
    [categories, form.type]
  );

  useEffect(() => {
    setForm((f) => ({ ...f, category_id: '' }));
  }, [form.type]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const amountNum = Number(form.amount);
    if (!(amountNum > 0)) {
      setError('Số tiền phải lớn hơn 0');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/transactions', {
        type: form.type,
        amount: amountNum,
        category_id: form.category_id ? Number(form.category_id) : null,
        description: form.description || null,
        date: form.date,
      });
      setForm({ ...EMPTY, type: form.type });
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.detail || 'Không thể tạo giao dịch');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold mb-4">Thêm giao dịch</h3>
      {error && (
        <div className="mb-3 p-2 rounded bg-red-50 text-expense text-sm">{error}</div>
      )}
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Loại</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
          >
            <option value="expense">Chi tiêu</option>
            <option value="income">Thu nhập</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Số tiền</label>
          <input
            type="number"
            min="0"
            step="1"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Danh mục</label>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
          >
            <option value="">-- Chọn danh mục --</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ngày</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <input
            type="text"
            maxLength={255}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto bg-primary text-white font-medium rounded-lg px-6 py-2 hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Đang lưu...' : 'Thêm giao dịch'}
          </button>
        </div>
      </form>
    </div>
  );
}
