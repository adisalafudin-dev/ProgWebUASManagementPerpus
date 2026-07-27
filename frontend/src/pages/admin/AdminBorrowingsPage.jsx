import { useState, useEffect, useCallback, useMemo } from "react";
import Icon from "../../components/Icon";
import borrowingApi from "../../services/borrowingApi";
import aksaraToast from "../../utils/toast";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function StatusBadge({ status }) {
  const isBorrowed = status === "dipinjam";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
        isBorrowed
          ? "bg-amber-100 text-amber-700"
          : "bg-emerald-100 text-emerald-700"
      }`}
    >
      <Icon name={isBorrowed ? "clock" : "check"} className="h-3 w-3" />
      {isBorrowed ? "Dipinjam" : "Dikembalikan"}
    </span>
  );
}

export default function AdminBorrowingsPage() {
  const [borrowings, setBorrowings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadBorrowings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await borrowingApi.getAllBorrowings();
      setBorrowings(data || []);
      setError(null);
    } catch (err) {
      setError("Gagal memuat data peminjaman.");
      aksaraToast.error("Gagal memuat data peminjaman dari server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBorrowings();
  }, [loadBorrowings]);

  const filteredBorrowings = useMemo(() => {
    return borrowings.filter((b) => {
      const matchesTab =
        activeTab === "all" || b.status === activeTab;

      if (!searchQuery) return matchesTab;

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        b.user?.name?.toLowerCase().includes(q) ||
        b.book?.title?.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [borrowings, activeTab, searchQuery]);

  const tabs = [
    { id: "all", label: "Semua", count: borrowings.length },
    {
      id: "dipinjam",
      label: "Dipinjam",
      count: borrowings.filter((b) => b.status === "dipinjam").length,
    },
    {
      id: "dikembalikan",
      label: "Dikembalikan",
      count: borrowings.filter((b) => b.status === "dikembalikan").length,
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Icon
            name="search"
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari nama peminjam atau judul buku..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-800 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-xl bg-slate-100 p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold transition-all ${
              activeTab === tab.id
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                activeTab === tab.id
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
            <p className="mt-4 text-sm text-slate-500">Memuat data peminjaman...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <Icon name="info" className="mx-auto mb-2 h-8 w-8" />
            <p>{error}</p>
            <button
              onClick={loadBorrowings}
              className="mt-4 text-indigo-600 hover:underline text-sm font-semibold"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredBorrowings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
              <Icon name="bookOpen" className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Belum Ada Peminjaman</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? "Tidak ada peminjaman yang cocok dengan pencarian Anda."
                : "Belum ada data peminjaman buku."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">
                    Peminjam
                  </th>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">
                    Buku
                  </th>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">
                    Tanggal Pinjam
                  </th>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">
                    Tanggal Kembali
                  </th>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBorrowings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {b.user?.name || "—"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {b.user?.email || ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {b.book?.cover ? (
                          <img
                            src={b.book.cover}
                            alt={b.book.title}
                            className="h-12 w-8 rounded object-cover shadow-sm flex-shrink-0"
                          />
                        ) : (
                          <div className="flex h-12 w-8 items-center justify-center rounded bg-slate-100 flex-shrink-0">
                            <Icon name="bookOpen" className="h-4 w-4 text-slate-300" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 line-clamp-1">
                            {b.book?.title || "—"}
                          </p>
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {b.book?.author || ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                      {formatDate(b.borrowDate)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                      {formatDate(b.returnDate)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
