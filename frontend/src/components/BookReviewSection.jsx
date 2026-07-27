import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import reviewApi from "../services/reviewApi.js";
import aksaraToast from "../utils/toast.js";

const MAX_COMMENT_LENGTH = 500;

function StarRating({ rating, setRating, readOnly = false }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => setRating?.(star)}
          className={`${readOnly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110 focus:outline-none"}`}
          aria-label={readOnly ? `Rating ${rating} bintang` : `Beri rating ${star} bintang`}
        >
          <Icon
            name="star"
            className={`h-6 w-6 ${star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ initialData = null, onSubmit, onCancel, isSubmitting }) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [comment, setComment] = useState(initialData?.comment || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      aksaraToast.error("Silakan berikan rating (1-5 bintang).");
      return;
    }
    onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-borderSoft bg-white p-5 shadow-sm">
      <h3 className="font-playfair text-lg font-bold text-textMain mb-4">
        {initialData ? "Edit Ulasan Anda" : "Tulis Ulasan"}
      </h3>
      
      <div className="mb-4">
        <label className="block text-sm font-semibold text-textSecondary mb-2">Rating</label>
        <StarRating rating={rating} setRating={setRating} />
      </div>

      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-semibold text-textSecondary mb-2">
          Komentar (Opsional)
        </label>
        <textarea
          id="comment"
          rows={4}
          maxLength={MAX_COMMENT_LENGTH}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Bagaimana pendapat Anda tentang buku ini?"
          className="w-full rounded-lg border border-borderSoft bg-cream/30 p-3 text-sm text-textMain placeholder:text-textSecondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors resize-none"
        />
        <div className="mt-1 text-right text-xs text-textSecondary">
          {comment.length}/{MAX_COMMENT_LENGTH}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-textSecondary hover:text-textMain transition-colors"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="btn-primary py-2 px-6 text-sm"
        >
          {isSubmitting ? "Menyimpan..." : "Kirim Ulasan"}
        </button>
      </div>
    </form>
  );
}

function ReviewItem({ review, isMine, onEdit, onDelete }) {
  const isPending = review.status === "pending";
  const isRejected = review.status === "rejected";
  
  return (
    <div className={`rounded-xl border ${isMine ? 'border-accent/40 bg-accent/5' : 'border-borderSoft bg-white'} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-accentHover font-bold font-playfair uppercase">
            {review.user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <p className="font-semibold text-textMain text-sm">
              {isMine ? "Anda" : review.user?.name || "Pengguna"}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating rating={review.rating} readOnly />
              <span className="text-xs text-textSecondary font-crimson">
                {new Date(review.createdAt).toLocaleDateString("id-ID", {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
        
        {isMine && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="text-textSecondary hover:text-accentHover p-1 transition-colors"
              aria-label="Edit ulasan"
              title="Edit ulasan"
            >
              <Icon name="edit" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="text-textSecondary hover:text-red-500 p-1 transition-colors"
              aria-label="Hapus ulasan"
              title="Hapus ulasan"
            >
              <Icon name="trash" className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {(isPending || isRejected) && isMine && (
        <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${isPending ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
          <Icon name={isPending ? "clock" : "close"} className="h-3 w-3" />
          {isPending ? "Menunggu Moderasi" : "Ditolak"}
        </div>
      )}

      {review.comment && (
        <p className="mt-3 text-sm text-textSecondary leading-relaxed whitespace-pre-wrap">
          {review.comment}
        </p>
      )}
    </div>
  );
}

export default function BookReviewSection({ bookId }) {
  const { user, isAuthenticated } = useAuth();
  
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ average: 0, count: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reviewsData, summaryData] = await Promise.all([
        reviewApi.getBookReviews(bookId),
        reviewApi.getBookRatingSummary(bookId).catch(() => ({ averageRating: 0, totalReviews: 0 }))
      ]);
      setReviews(reviewsData);
      setSummary(summaryData);
      setError(null);
    } catch (err) {
      console.error("Gagal memuat ulasan:", err);
      setError("Gagal memuat daftar ulasan.");
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const myReview = reviews.find((r) => r.user?.id === user?.id);
  const otherReviews = reviews.filter((r) => r.user?.id !== user?.id);

  const handleSubmitReview = async (data) => {
    setIsSubmitting(true);
    try {
      if (myReview) {
        await reviewApi.updateReview(myReview.id, data);
        aksaraToast.success("Ulasan berhasil diperbarui dan menunggu moderasi.");
      } else {
        await reviewApi.createReview({ bookId, ...data });
        aksaraToast.success("Ulasan berhasil dikirim dan menunggu moderasi.");
      }
      setIsFormOpen(false);
      fetchReviews();
    } catch (err) {
      aksaraToast.error(err?.response?.data?.message || "Gagal menyimpan ulasan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus ulasan ini?")) return;
    try {
      await reviewApi.deleteReview(myReview.id);
      aksaraToast.success("Ulasan berhasil dihapus.");
      fetchReviews();
    } catch (err) {
      aksaraToast.error("Gagal menghapus ulasan.");
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 py-6">
        <div className="h-6 w-48 rounded bg-borderSoft/60" />
        <div className="h-32 w-full rounded-xl bg-borderSoft/30" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-borderSoft pb-4">
        <div>
          <p className="section-label mb-1">Diskusi & Rating</p>
          <h2 className="font-playfair text-xl font-bold text-textMain">
            Ulasan Pembaca
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Icon name="star" className="h-5 w-5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-lg text-textMain">
              {Number(summary.average).toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-textSecondary font-crimson">
            ({summary.count} ulasan)
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          {error}
        </div>
      )}

      {/* Form / Current User's Review */}
      <div className="bg-cream/20 rounded-2xl p-1">
        {!isAuthenticated ? (
          <div className="rounded-xl border border-dashed border-borderSoft bg-white p-6 text-center">
            <p className="text-sm text-textSecondary mb-3">
              Silakan login untuk memberikan ulasan.
            </p>
            <Link to="/login" className="btn-primary inline-flex py-2 px-6">
              Login
            </Link>
          </div>
        ) : isFormOpen ? (
          <ReviewForm
            initialData={myReview}
            onSubmit={handleSubmitReview}
            onCancel={() => setIsFormOpen(false)}
            isSubmitting={isSubmitting}
          />
        ) : myReview ? (
          <ReviewItem
            review={myReview}
            isMine={true}
            onEdit={() => setIsFormOpen(true)}
            onDelete={handleDeleteReview}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-borderSoft bg-white p-6 text-center">
            <p className="text-sm text-textSecondary mb-3">
              Anda belum memberikan ulasan untuk buku ini.
            </p>
            <button
              type="button"
              className="btn-primary py-2 px-6 inline-flex"
              onClick={() => setIsFormOpen(true)}
            >
              <Icon name="edit" className="h-4 w-4" />
              Tulis Ulasan
            </button>
          </div>
        )}
      </div>

      {/* Other Reviews List */}
      <div className="space-y-4">
        {otherReviews.length > 0 ? (
          otherReviews.map((review) => (
            <ReviewItem key={review.id} review={review} isMine={false} />
          ))
        ) : (
          <div className="py-8 text-center text-sm text-textSecondary font-crimson italic">
            Belum ada ulasan publik untuk buku ini.
          </div>
        )}
      </div>
    </div>
  );
}
