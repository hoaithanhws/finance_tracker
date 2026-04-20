import { Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import api from '../api/axios';
import { formatDateVN, formatVND } from '../utils/format';

const PAGE_SIZE = 10;

export default function TransactionList({ transactions, categories, onChanged }) {
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter && t.type !== typeFilter) return false;
      if (categoryFilter && String(t.category?.id) !== categoryFilter) return false;
      return true;
    });
  }, [transactions, typeFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const onDelete = async (id) => {
    if (!confirm('Xóa giao dịch này?')) return;
    await api.delete(`/transactions/${id}`);
    onChanged?.();
  };

  const onSaveEdit = async () => {
    const amountNum = Number(editing.amount);
    if (!(amountNum > 0)) return;
    await api.put(`/transactions/${editing.id}`, {
      amount: amountNum,
      type: editing.type,
      description: editing.description || null,
      date: editing.date,
      category_id: editing.category_id ? Number(editing.category_id) : null,
    });
    setEditing(null);
    onChanged?.();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h3 className="font-semibold">Danh sách giao dịch</h3>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">Tất cả loại</option>
            <option value="income">Thu nhập</option>
            <option value="expense">Chi tiêu</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-2 pr-3">Ngày</th>
              <th className="py-2 pr-3">Mô tả</th>
              <th className="py-2 pr-3">Danh mục</th>
              <th className="py-2 pr-3">Loại</th>
              <th className="py-2 pr-3 text-right">Số tiền</th>
              <th className="py-2 pr-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-slate-500">
                  Chưa có giao dịch
                </td>
              </tr>
            ) : (
              paged.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3">{formatDateVN(t.date)}</td>
                  <td className="py-2 pr-3">{t.description || '-'}</td>
                  <td className="py-2 pr-3">{t.category?.name || '-'}</td>
                  <td className="py-2 pr-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        t.type === 'income'
                          ? 'bg-green-50 text-income'
                          : 'bg-red-50 text-expense'
                      }`}
                    >
                      {t.type === 'income' ? 'Thu' : 'Chi'}
                    </span>
                  </td>
                  <td
                    className={`py-2 pr-3 text-right font-medium ${
                      t.type === 'income' ? 'text-income' : 'text-expense'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '-'}
                    {formatVND(t.amount)}
                  </td>
                  <td className="py-2 pr-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() =>
                          setEditing({
                            id: t.id,
                            type: t.type,
                            amount: t.amount,
                            description: t.description || '',
                            date: t.date,
                            category_id: t.category?.id || '',
                          })
                        }
                        className="text-slate-600 hover:text-primary"
                        title="Sửa"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(t.id)}
                        className="text-slate-600 hover:text-expense"
                        title="Xóa"
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-slate-500">
            Trang {currentPage} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-slate-300 rounded disabled:opacity-50"
            >
              Trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-slate-300 rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Sửa giao dịch</h3>
            <div className="space-y-3">
              <select
                value={editing.type}
                onChange={(e) => setEditing({ ...editing, type: e.target.value, category_id: '' })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              >
                <option value="expense">Chi tiêu</option>
                <option value="income">Thu nhập</option>
              </select>
              <input
                type="number"
                min="0"
                value={editing.amount}
                onChange={(e) => setEditing({ ...editing, amount: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                placeholder="Số tiền"
              />
              <select
                value={editing.category_id}
                onChange={(e) => setEditing({ ...editing, category_id: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              >
                <option value="">-- Danh mục --</option>
                {categories
                  .filter((c) => c.type === editing.type)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
              <input
                type="date"
                value={editing.date}
                onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
              <input
                type="text"
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                placeholder="Mô tả"
              />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={onSaveEdit}
                className="px-4 py-2 bg-primary text-white rounded-lg"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
