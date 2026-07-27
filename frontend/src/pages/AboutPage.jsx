import { memo, useCallback, useState } from "react";
import Icon from "../components/Icon";
import { GENRES } from "../constants/books";


const STATS = [
  { icon: "collection", value: "Ribuan", label: "Judul buku tersedia" },
  { icon: "tag", value: String(GENRES.length - 1), label: "Kategori genre" },
  { icon: "globe", value: "Online", label: "Katalog terkini" },
  { icon: "monitor", value: "Responsif", label: "Semua perangkat" },
];

const FEATURES = [
  {
    icon: "search",
    title: "Pencarian Buku",
    desc: "Temukan buku berdasarkan judul, penulis, atau kata kunci dengan cepat.",
  },
  {
    icon: "collection",
    title: "Katalog Buku",
    desc: "Jelajahi koleksi buku digital yang terorganisir dan mudah dinavigasi.",
  },
  {
    icon: "eye",
    title: "Detail Buku",
    desc: "Lihat informasi lengkap seperti sinopsis, penulis, tahun terbit, dan rating.",
  },
  {
    icon: "bookmark",
    title: "Favorit",
    desc: "Simpan buku pilihan ke daftar favorit agar mudah diakses kembali.",
  },
  {
    icon: "filter",
    title: "Filter Buku",
    desc: "Saring koleksi menurut genre, tahun, rating, dan ketersediaan.",
  },
  {
    icon: "star",
    title: "Rating & Ulasan",
    desc: "Lihat penilaian dan ulasan dari pengguna lain untuk setiap buku di katalog.",
  },
  {
    icon: "monitor",
    title: "Responsive Design",
    desc: "Akses nyaman dari desktop, tablet, maupun ponsel tanpa kehilangan fitur.",
  },
];

const TECH_STACK = [
  { icon: "monitor", label: "Frontend", value: "React + Vite" },
  { icon: "database", label: "Backend", value: "NestJS + MongoDB" },
  { icon: "cloud", label: "API", value: "RESTful API" },
  { icon: "database", label: "Database", value: "MongoDB" },
  { icon: "pen", label: "Styling", value: "Tailwind CSS" },
];

const ARCHITECTURE_STEPS = [
  { icon: "user", label: "Pengguna", status: "active" },
  { icon: "monitor", label: "Frontend AksaraHub", status: "active" },
  { icon: "cloud", label: "RESTful API", status: "active" },
  { icon: "database", label: "NestJS Backend", status: "active" },
  { icon: "database", label: "MongoDB Database", status: "active" },
];

const ROADMAP = [
  { label: "Pencarian Buku", done: true },
  { label: "Detail Buku", done: true },
  { label: "Favorit", done: true },
  { label: "Filter", done: true },
  { label: "Dashboard", done: false },
  { label: "Peminjaman", done: false },
  { label: "Pengembalian", done: false },
  { label: "Notifikasi", done: false },
];

const FAQ_ITEMS = [
  {
    question: "Dari mana data buku berasal?",
    answer:
      "Metadata buku disimpan dan dikelola langsung melalui backend NestJS dengan database MongoDB. Admin dapat menambah, mengedit, dan menghapus data buku secara mandiri.",
  },
  {
    question: "Apakah buku dapat dipinjam?",
    answer:
      "Fitur peminjaman dan pengembalian sedang dalam tahap pengembangan dan akan tersedia pada fase selanjutnya.",
  },
  {
    question: "Apakah aplikasi mendukung perangkat mobile?",
    answer:
      "Ya. Antarmuka AksaraHub dirancang responsif sehingga dapat digunakan dengan nyaman di ponsel, tablet, dan komputer.",
  },
  {
    question: "Bagaimana cara menyimpan buku favorit?",
    answer:
      "Klik ikon bookmark pada kartu buku atau halaman detail untuk menambahkannya ke daftar Favorit. Buku tersimpan dapat diakses kapan saja melalui menu Favorit.",
  },
];

const WORKFLOW = [
  {
    icon: "compass",
    title: "Jelajahi rekomendasi",
    text: "Mulai dari halaman Jelajah untuk melihat buku unggulan dan koleksi terbaru.",
  },
  {
    icon: "search",
    title: "Cari buku",
    text: "Gunakan kolom pencarian untuk menemukan judul atau penulis yang Anda inginkan.",
  },
  {
    icon: "filter",
    title: "Saring hasil",
    text: "Persempit daftar buku dengan filter genre, tahun, rating, dan ketersediaan.",
  },
  {
    icon: "bookmark",
    title: "Simpan favorit",
    text: "Tandai buku menarik ke daftar Favorit agar mudah ditemukan kembali.",
  },
];

const SectionHeader = memo(function SectionHeader({ label, title, id }) {
  return (
    <div className="mb-6">
      <p className="section-label mb-2">{label}</p>
      <h2 id={id} className="font-semibold text-2xl text-textMain">
        {title}
      </h2>
    </div>
  );
});

const ContentCard = memo(function ContentCard({ children, className = "" }) {
  return (
    <div
      className={`bg-white border border-borderSoft rounded-lg p-6 shadow-book ${className}`}
    >
      {children}
    </div>
  );
});

const CardIcon = memo(function CardIcon({ name }) {
  return (
    <span className="w-9 h-9 rounded-lg bg-cream text-accentHover flex items-center justify-center flex-shrink-0">
      <Icon name={name} className="w-4 h-4" />
    </span>
  );
});

const FaqItem = memo(function FaqItem({ question, answer, isOpen, onToggle }) {
  const panelId = `faq-panel-${question.slice(0, 12).replace(/\s/g, "-")}`;

  return (
    <div className="border border-borderSoft rounded-lg overflow-hidden bg-white shadow-book">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left font-semibold text-textMain hover:bg-cream/50 transition-colors duration-200"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={`${isOpen ? "Tutup" : "Buka"} pertanyaan: ${question}`}
        onClick={onToggle}
      >
        <span>{question}</span>
        <Icon
          name="chevronDown"
          className={`w-4 h-4 text-accentHover flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={panelId}
        hidden={!isOpen}
        className={`px-6 pb-4 text-sm text-textSecondary leading-relaxed ${isOpen ? "block" : "hidden"}`}
      >
        {answer}
      </div>
    </div>
  );
});

export default function AboutPage() {
  const visibleGenres = GENRES.filter((genre) => genre !== "Semua");
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const handleFaqToggle = useCallback((index) => {
    setOpenFaqIndex((prev) => (prev === index ? -1 : index));
  }, []);

  return (
    <section
      id="tentang"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 scroll-mt-24"
    >
      <div className="flex flex-col gap-16 lg:gap-20">
        {/* Hero */}
        <header className="max-w-3xl">
          <p className="section-label mb-2">Tentang AksaraHub</p>
          <h1 className="font-extrabold text-4xl lg:text-5xl text-textMain mb-4 leading-tight">
            Sistem Informasi Perpustakaan Digital untuk menemukan, mengenal, dan
            mengelola koleksi buku.
          </h1>
          <p className="text-lg text-secondary leading-relaxed">
            AksaraHub hadir sebagai perpustakaan digital yang memudahkan Anda
            mencari buku, mempelajari detail koleksi, dan menyimpan judul favorit
            dalam satu platform yang rapi dan mudah digunakan. Kami menghadirkan
            pengalaman membaca modern bagi pembaca, mahasiswa, dan pengelola
            perpustakaan.
          </p>
        </header>

        {/* Stats */}
        <section aria-label="Ringkasan layanan AksaraHub">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {STATS.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-lg border border-borderSoft bg-white p-5 lg:p-6 shadow-book"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cream text-accentHover">
                  <Icon name={item.icon} className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xl lg:text-2xl font-extrabold text-textMain leading-none">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs lg:text-sm text-textSecondary">
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Visi & Misi */}
        <section aria-labelledby="visi-misi-heading">
          <SectionHeader
            label="Identitas"
            title="Visi dan Misi"
            id="visi-misi-heading"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            <ContentCard className="h-full">
              <div className="flex items-center gap-3 mb-4">
                <CardIcon name="eye" />
                <h3 className="font-semibold text-xl text-textMain">Visi</h3>
              </div>
              <p className="text-secondary leading-relaxed">
                Menjadi platform perpustakaan digital yang andal, mudah diakses,
                dan mendukung literasi masyarakat melalui teknologi informasi
                yang transparan.
              </p>
            </ContentCard>
            <ContentCard className="h-full">
              <div className="flex items-center gap-3 mb-4">
                <CardIcon name="compass" />
                <h3 className="font-semibold text-xl text-textMain">Misi</h3>
              </div>
              <p className="text-secondary leading-relaxed">
                Menyediakan layanan pencarian dan penelusuran buku yang efisien,
                menghadirkan informasi koleksi yang akurat, serta mempersiapkan
                ekosistem peminjaman digital yang terintegrasi.
              </p>
            </ContentCard>
          </div>
        </section>

        {/* Fitur Utama */}
        <section aria-labelledby="fitur-heading">
          <SectionHeader label="Layanan" title="Fitur Utama" id="fitur-heading" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {FEATURES.map((item) => (
              <article
                key={item.title}
                className="flex h-full flex-col rounded-lg border border-borderSoft bg-white p-6 shadow-book transition-colors duration-200 hover:border-accent"
              >
                <CardIcon name={item.icon} />
                <h3 className="mt-4 mb-2 font-semibold text-lg text-textMain">
                  {item.title}
                </h3>
                <p className="text-sm text-textSecondary leading-relaxed">
                  {item.desc}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Teknologi & Arsitektur */}
        <section
          aria-labelledby="teknologi-heading"
          className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-stretch"
        >
          <ContentCard className="flex h-full flex-col">
            <SectionHeader
              label="Infrastruktur"
              title="Teknologi"
              id="teknologi-heading"
            />
            <div className="flex flex-1 flex-col gap-3">
              {TECH_STACK.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 rounded-lg border border-borderSoft bg-cream/40 px-4 py-3"
                >
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-textMain">
                    <Icon name={item.icon} className="w-4 h-4 text-accentHover" />
                    {item.label}
                  </span>
                  <span className="text-sm text-textSecondary text-right">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </ContentCard>

          <ContentCard className="flex h-full flex-col">
            <SectionHeader label="Alur Data" title="Arsitektur Sistem" />
            <div
              className="flex flex-1 flex-col justify-center gap-1.5"
              role="img"
              aria-label="Alur sistem: Pengguna ke Frontend, REST API, Backend, dan Database"
            >
              {ARCHITECTURE_STEPS.map((step, index) => (
                <div key={step.label} className="flex flex-col items-stretch">
                  <div
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                      step.status === "soon"
                        ? "border-dashed border-borderSoft bg-cream/30 text-textSecondary"
                        : "border-borderSoft bg-cream/60 text-textMain"
                    }`}
                  >
                    <Icon
                      name={step.icon}
                      className="w-4 h-4 text-accentHover flex-shrink-0"
                    />
                    <span className="text-sm font-semibold">{step.label}</span>
                    {step.status === "soon" && (
                      <span className="ml-auto text-xs font-semibold uppercase tracking-wide text-accentHover">
                        Soon
                      </span>
                    )}
                  </div>
                  {index < ARCHITECTURE_STEPS.length - 1 && (
                    <div className="flex justify-center py-1" aria-hidden="true">
                      <Icon name="chevronDown" className="w-4 h-4 text-accentHover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ContentCard>
        </section>

        {/* Roadmap & Panduan */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-stretch">
          <ContentCard className="h-full">
            <SectionHeader label="Perkembangan" title="Roadmap" />
            <ul className="space-y-3" aria-label="Daftar fitur roadmap AksaraHub">
              {ROADMAP.map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.done
                        ? "bg-cream text-accentHover"
                        : "border-2 border-borderSoft text-textSecondary"
                    }`}
                    aria-hidden="true"
                  >
                    {item.done ? (
                      <Icon name="check" className="w-3.5 h-3.5" />
                    ) : (
                      <span className="w-2 h-2 rounded-sm bg-borderSoft" />
                    )}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      item.done ? "text-textMain" : "text-textSecondary"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`ml-auto shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      item.done
                        ? "bg-cream text-accentHover"
                        : "border border-dashed border-borderSoft text-textSecondary"
                    }`}
                  >
                    {item.done ? "Selesai" : "Rencana"}
                  </span>
                </li>
              ))}
            </ul>
          </ContentCard>

          <ContentCard className="h-full">
            <SectionHeader label="Panduan" title="Cara Menggunakan AksaraHub" />
            <div className="space-y-5">
              {WORKFLOW.map((step, index) => (
                <div key={step.title} className="flex gap-3">
                  <CardIcon name={step.icon} />
                  <div className="min-w-0 pt-0.5">
                    <p className="font-semibold text-textMain">
                      {index + 1}. {step.title}
                    </p>
                    <p className="mt-1 text-sm text-secondary leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ContentCard>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading">
          <SectionHeader label="Bantuan" title="Pertanyaan Umum" id="faq-heading" />
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => (
              <FaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                isOpen={openFaqIndex === index}
                onToggle={() => handleFaqToggle(index)}
              />
            ))}
          </div>
        </section>

        {/* Sumber Data & Kategori */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-stretch">
          <ContentCard className="flex h-full flex-col">
            <SectionHeader label="Referensi" title="Sumber Data" />
            <p className="mb-6 flex-1 text-secondary leading-relaxed">
              AksaraHub menggunakan backend NestJS dengan database MongoDB
              sebagai sumber metadata buku, termasuk judul, penulis, sampul,
              kategori, dan stok. Data dikelola sepenuhnya oleh admin melalui
              panel administrasi yang terintegrasi.
            </p>
            <span
              className="btn-primary self-start inline-flex items-center gap-2 cursor-default"
            >
              <Icon name="database" className="w-4 h-4" />
              Backend API Aktif
            </span>
          </ContentCard>

          <ContentCard className="h-full">
            <SectionHeader label="Koleksi" title="Kategori Buku" />
            <p className="mb-6 text-secondary leading-relaxed">
              Kategori buku dikelola oleh admin melalui panel administrasi dan
              digunakan sebagai filter untuk membantu pengguna menemukan buku
              sesuai minat baca.
            </p>
            <div className="flex flex-wrap gap-2">
              {visibleGenres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-borderSoft bg-cream px-3 py-1.5 text-sm font-semibold text-accentHover"
                >
                  {genre}
                </span>
              ))}
            </div>
          </ContentCard>
        </section>
      </div>
    </section>
  );
}
