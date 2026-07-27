import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Building2,
  CalendarDays,
  Languages,
  LibraryBig,
  PieChart,
  RefreshCw,
  Tags,
  Users,
} from "lucide-react";
import EmptyState from "../../components/EmptyState";
import { getLibraryStatistics, invalidateDashboardCache } from "../../services/dashboardService";

const PIE_COLORS = ["#4f46e5", "#0d9488", "#f59e0b", "#e11d48", "#7c3aed", "#0284c7"];

const number = (value) => Number(value || 0).toLocaleString("id-ID");
const compareYears = (first, second) => {
  const firstYear = Number(first.label);
  const secondYear = Number(second.label);
  if (Number.isFinite(firstYear) && Number.isFinite(secondYear)) return firstYear - secondYear;
  if (Number.isFinite(firstYear)) return -1;
  if (Number.isFinite(secondYear)) return 1;
  return first.label.localeCompare(second.label, "id");
};

function StatisticsSkeleton() {
  return (
    <div className="space-y-6" aria-label="Memuat statistik perpustakaan">
      <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-slate-200" />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, tone }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className={`rounded-xl p-3 ${tone}`}><Icon className="h-5 w-5" /></div>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Database</span>
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-playfair text-3xl font-bold text-slate-900">{number(value)}</p>
    </article>
  );
}

function NoChartData({ text = "Tidak ada data yang dapat divisualkan." }) {
  return <p className="flex h-48 items-center justify-center text-center text-sm text-slate-500">{text}</p>;
}

function YearBarChart({ items }) {
  const chartItems = useMemo(() => [...items]
    .sort((a, b) => b.value - a.value || compareYears(b, a))
    .slice(0, 10)
    .sort(compareYears), [items]);
  const max = Math.max(...chartItems.map((item) => item.value), 1);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="year-chart-title">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600"><CalendarDays className="h-5 w-5" /></div>
        <div><p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Bar chart</p><h2 id="year-chart-title" className="font-playfair text-xl font-bold text-slate-900">Distribusi Tahun Terbit</h2></div>
      </div>
      {chartItems.length ? (
        <div className="mt-7 flex h-52 min-w-[380px] items-end gap-3 overflow-x-auto pb-7" role="img" aria-label="Diagram batang distribusi tahun terbit">
          {chartItems.map((item) => {
            const height = Math.max((item.value / max) * 100, 8);
            return <div key={item.label} className="flex h-full min-w-[34px] flex-1 flex-col justify-end text-center"><span className="mb-1 text-xs font-bold text-slate-600">{item.value}</span><div className="rounded-t-md bg-gradient-to-t from-indigo-600 to-violet-400 transition-all" style={{ height: `${height}%` }} title={`${item.label}: ${item.value} buku`} /><span className="mt-2 text-[11px] font-medium text-slate-500">{item.label}</span></div>;
          })}
        </div>
      ) : <NoChartData text="Tahun terbit tidak tersedia pada hasil pencarian ini." />}
    </section>
  );
}

function LanguagePieChart({ items }) {
  const chartItems = useMemo(() => {
    const top = items.slice(0, 5);
    const rest = items.slice(5).reduce((sum, item) => sum + item.value, 0);
    return rest ? [...top, { label: "Lainnya", value: rest }] : top;
  }, [items]);
  const total = chartItems.reduce((sum, item) => sum + item.value, 0);
  const background = useMemo(() => {
    if (!total) return "";
    let offset = 0;
    return `conic-gradient(${chartItems.map((item, index) => {
      const end = offset + (item.value / total) * 100;
      const segment = `${PIE_COLORS[index]} ${offset}% ${end}%`;
      offset = end;
      return segment;
    }).join(", ")})`;
  }, [chartItems, total]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="language-chart-title">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600"><PieChart className="h-5 w-5" /></div>
        <div><p className="text-xs font-bold uppercase tracking-wide text-emerald-600">Pie chart</p><h2 id="language-chart-title" className="font-playfair text-xl font-bold text-slate-900">Distribusi Bahasa</h2></div>
      </div>
      {total ? <div className="mt-6 grid items-center gap-6 sm:grid-cols-[170px_minmax(0,1fr)]"><div className="relative mx-auto h-40 w-40 rounded-full" style={{ background }} role="img" aria-label="Diagram pie distribusi bahasa"><div className="absolute inset-[28%] flex items-center justify-center rounded-full bg-white text-center"><span className="text-xs font-bold text-slate-600">{number(total)}<br />entri</span></div></div><ul className="space-y-2">{chartItems.map((item, index) => <li key={item.label} className="flex items-center justify-between gap-3 text-sm"><span className="flex min-w-0 items-center gap-2 font-medium text-slate-700"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} /> <span className="truncate">{item.label}</span></span><span className="shrink-0 font-bold text-slate-900">{item.value} · {Math.round((item.value / total) * 100)}%</span></li>)}</ul></div> : <NoChartData text="Bahasa tidak tersedia pada hasil pencarian ini." />}
    </section>
  );
}

function SubjectProgress({ items, totalBooks }) {
  const chartItems = items.slice(0, 6);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="subject-progress-title">
      <div className="flex items-start gap-3"><div className="rounded-xl bg-amber-50 p-2.5 text-amber-600"><Tags className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-wide text-amber-600">Progress bar</p><h2 id="subject-progress-title" className="font-playfair text-xl font-bold text-slate-900">Subject Terbanyak</h2></div></div>
      {chartItems.length ? <div className="mt-6 space-y-4">{chartItems.map((item) => { const percent = totalBooks ? (item.value / totalBooks) * 100 : 0; return <div key={item.label}><div className="mb-1.5 flex justify-between gap-4 text-sm"><span className="truncate font-semibold text-slate-700">{item.label}</span><span className="shrink-0 font-bold text-slate-900">{item.value} buku</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${item.label}: ${item.value} buku`} aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${Math.max(percent, 3)}%` }} /></div></div>; })}</div> : <NoChartData text="Subject tidak tersedia pada hasil pencarian ini." />}
    </section>
  );
}

function MostEditions({ book }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="edition-title">
      <div className="flex items-start gap-3"><div className="rounded-xl bg-violet-50 p-2.5 text-violet-600"><LibraryBig className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-wide text-violet-600">Koleksi</p><h2 id="edition-title" className="font-playfair text-xl font-bold text-slate-900">Buku dengan Edition Terbanyak</h2></div></div>
      {book ? <div className="mt-6 flex items-center gap-4 rounded-xl bg-slate-50 p-4"><div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-violet-100 text-violet-700">{book.cover ? <img src={book.cover} alt="" className="h-full w-full object-cover" /> : <BookOpen className="h-6 w-6" />}</div><div className="min-w-0"><h3 className="truncate font-playfair text-lg font-bold text-slate-900">{book.title}</h3><p className="mt-0.5 truncate text-sm text-slate-600">{book.author || "Penulis tidak diketahui"}</p><p className="mt-2 text-sm font-bold text-violet-700">{number(book.editionCount)} edition</p></div></div> : <NoChartData text="Jumlah edition belum tersedia pada hasil pencarian ini." />}
    </section>
  );
}

export default function AdminStatisticsPage() {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStatistics = useCallback(async (refresh = false) => {
    setLoading(true);
    setError("");
    if (refresh) invalidateDashboardCache();
    try {
      setStatistics(await getLibraryStatistics());
    } catch (requestError) {
      setStatistics(null);
      setError(requestError?.message || "Data statistik tidak dapat dimuat dari server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStatistics(); }, [loadStatistics]);

  if (loading) return <StatisticsSkeleton />;
  if (error) return <EmptyState icon="database" title="Statistik belum dapat dimuat" description={error} action actionLabel="Coba lagi" onAction={() => loadStatistics(true)} />;
  if (!statistics?.totalBooks) return <EmptyState icon="collection" title="Belum ada data statistik" description="Belum ada buku di database untuk ditampilkan pada halaman statistik." action actionLabel="Muat ulang" onAction={() => loadStatistics(true)} />;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-playfair text-2xl font-bold text-slate-900 sm:text-3xl">Statistik Perpustakaan</h2><span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Database Internal</span></div><p className="mt-1 max-w-2xl text-sm text-slate-600">Seluruh angka dihitung dari {number(statistics.totalBooks)} hasil pencarian yang sama dengan Dashboard Admin.</p></div>
        <button type="button" onClick={() => loadStatistics(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Perbarui data</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Buku" value={statistics.totalBooks} icon={BookOpen} tone="bg-indigo-50 text-indigo-600" />
        <MetricCard label="Total Author" value={statistics.totalAuthors} icon={Users} tone="bg-emerald-50 text-emerald-600" />
        <MetricCard label="Total Publisher" value={statistics.totalPublishers} icon={Building2} tone="bg-amber-50 text-amber-600" />
        <MetricCard label="Total Subject" value={statistics.totalSubjects} icon={Tags} tone="bg-violet-50 text-violet-600" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2"><YearBarChart items={statistics.yearDistribution} /><LanguagePieChart items={statistics.languageDistribution} /></div>
      <div className="grid gap-6 xl:grid-cols-2"><SubjectProgress items={statistics.subjectDistribution} totalBooks={statistics.totalBooks} /><MostEditions book={statistics.mostEditions} /></div>
    </div>
  );
}
