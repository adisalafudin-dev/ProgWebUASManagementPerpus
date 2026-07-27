import { useState, useEffect, useCallback, useMemo } from "react";
import Icon from "../../components/Icon";
import reviewApi from "../../services/reviewApi";
import aksaraToast from "../../utils/toast";

function StatusBadge({ status }) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-700">
          <Icon name="clock" className="h-3 w-3" />
          Menunggu
        </span>
      );
    case "approved":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
          <Icon name="check" className="h-3 w-3" />
          Disetujui
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-red-700">
          <Icon name="close" className="h-3 w-3" />
          Ditolak
        </span>
      );
    default:
      return null;
  }
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState("pending"); // pending, approved, rejected, ALL
  const [searchQuery, setSearchQuery] = useState("");

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await reviewApi.getReviews();
      setReviews(data || []);
      setError(null);
    } catch (err) {
      setError("Gagal memuat daftar ulasan.");
      aksaraToast.error("Gagal memuat ulasan dari server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleModerate = async (id, status) => {
    try {
      await reviewApi.moderateReview(id, { status });
      aksaraToast.success(`Ulasan berhasil di-${status.toLowerCase()}.`);
      // Update local state without refetching for speed
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (err) {
      aksaraToast.error("Gagal memperbarui status ulasan.");
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesTab = activeTab === "all" || review.status === activeTab;
      
      if (!searchQuery) return matchesTab;
      
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        review.book?.title?.toLowerCase().includes(q) ||
        review.user?.name?.toLowerCase().includes(q) ||
        review.comment?.toLowerCase().includes(q);
        
      return matchesTab && matchesSearch;
    });
  }, [reviews, activeTab, searchQuery]);

  const tabs = [
    { id: "pending", label: "Menunggu", count: reviews.filter((r) => r.status === "pending").length },
    { id: "approved", label: "Disetujui", count: reviews.filter((r) => r.status === "approved").length },
    { id: "rejected", label: "Ditolak", count: reviews.filter((r) => r.status === "rejected").length },
    { id: "all", label: "Semua", count: reviews.length },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Icon
            name="search"
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari buku, pengguna, atau isi komentar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-800 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

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

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
            <p className="mt-4 text-sm text-slate-500">Memuat data ulasan...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <Icon name="close" className="mx-auto mb-2 h-8 w-8" />
            <p>{error}</p>
            <button
              onClick={loadReviews}
              className="mt-4 text-indigo-600 hover:underline text-sm font-semibold"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
              <Icon name="star" className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Belum Ada Ulasan</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? "Tidak ada ulasan yang cocok dengan pencarian Anda."
                : `Belum ada ulasan dengan status ${tabs.find((t) => t.id === activeTab)?.label.toLowerCase()}.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-5 sm:p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={review.status} />
                      <span className="text-xs font-semibold text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString("id-ID", {
                          year: 'numeric', month: 'long', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="flex items-start gap-4">
                      {review.book?.cover ? (
                        <img 
                          src={review.book.cover} 
                          alt={review.book.title} 
                          className="w-12 h-16 object-cover rounded shadow-sm flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-slate-100 flex items-center justify-center rounded shadow-sm flex-shrink-0">
                          <Icon name="bookOpen" className="w-5 h-5 text-slate-300" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                          {review.book?.title || "Buku tidak tersedia"}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Icon
                                key={star}
                                name="star"
                                className={`h-3.5 w-3.5 ${star <= review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-slate-500 font-semibold">dari {review.user?.name || "Pengguna"}</span>
                        </div>
                        {review.comment && (
                          <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                            "{review.comment}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {review.status === "pending" && (
                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleModerate(review.id, "approved")}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                      >
                        <Icon name="check" className="h-4 w-4" />
                        Setujui
                      </button>
                      <button
                        onClick={() => handleModerate(review.id, "rejected")}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                      >
                        <Icon name="close" className="h-4 w-4" />
                        Tolak
                      </button>
                    </div>
                  )}
                  {review.status === "rejected" && (
                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleModerate(review.id, "approved")}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Ubah ke Disetujui
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
