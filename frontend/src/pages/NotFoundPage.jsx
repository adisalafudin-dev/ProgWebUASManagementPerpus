import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="mx-auto min-h-[70vh] max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-borderSoft bg-white p-10 text-center shadow-book">
        <p className="font-playfair text-4xl font-bold text-textMain mb-4">
          404
        </p>
        <p className="text-lg font-semibold text-textMain mb-3">
          Halaman tidak ditemukan
        </p>
        <p className="text-textSecondary mb-8">
          Halaman yang kamu tuju mungkin sudah dipindahkan atau alamatnya salah.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="btn-primary">
            Kembali ke Jelajah
          </Link>
          <Link to="/books" className="btn-secondary text-primary">
            Lihat Katalog Buku
          </Link>
        </div>
      </div>
    </section>
  );
}
