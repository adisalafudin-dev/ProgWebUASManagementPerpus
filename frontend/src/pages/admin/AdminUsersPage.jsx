import { useState, useMemo, useEffect } from "react";
import Icon from "../../components/Icon";
import EmptyState from "../../components/EmptyState";
import Pagination from "../../components/Pagination";
import AdminUserModal from "../../components/admin/AdminUserModal";
import AdminUserDeleteModal from "../../components/admin/AdminUserDeleteModal";
import memberApi from "../../services/memberApi.js";
import aksaraToast from "../../utils/toast.js";

export default function AdminUsersPage() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua Status");
  const [selectedBorrowStatus, setSelectedBorrowStatus] = useState("Semua");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal & Action states
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deletingMember, setDeletingMember] = useState(null);
  const [detailMember, setDetailMember] = useState(null); // (Opsional fitur detail)

  const loadMembers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await memberApi.getMembers();
      setMembers(data || []);
    } catch (requestError) {
      setMembers([]);
      setError(
        requestError?.response?.data?.message ||
          "Data anggota tidak dapat dimuat."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [refreshKey]);

  // Filter logic 
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (m.name && m.name.toLowerCase().includes(term)) ||
        (m.memberNumber && m.memberNumber.toLowerCase().includes(term)) ||
        (m.email && m.email.toLowerCase().includes(term));

      const matchesStatus =
        selectedStatus === "Semua Status" ||
        selectedStatus === "Semua" ||
        m.status === selectedStatus;

      const matchesBorrowStatus =
        selectedBorrowStatus === "Semua" ||
        m.borrowStatus === selectedBorrowStatus;

      return matchesSearch && matchesStatus && matchesBorrowStatus;
    });
  }, [members, searchTerm, selectedStatus, selectedBorrowStatus]);

  // Pagination logic
  const totalPages = Math.max(
    1,
    Math.ceil(filteredMembers.length / itemsPerPage)
  );

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(start, start + itemsPerPage);
  }, [filteredMembers, currentPage, itemsPerPage]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    (selectedStatus !== "Semua Status" && selectedStatus !== "Semua") ||
    selectedBorrowStatus !== "Semua";

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("Semua Status");
    setSelectedBorrowStatus("Semua");
    setCurrentPage(1);
  };

  // Statistics calculations (defaults to 0 when members is empty)
  const totalMembersCount = members.length;
  const activeMembersCount = members.filter((m) => m.status === "Aktif").length;
  const borrowingMembersCount = members.filter(
    (m) => m.borrowStatus === "Sedang Meminjam"
  ).length;
  const overdueMembersCount = members.filter(
    (m) => m.borrowStatus === "Terlambat"
  ).length;

  const handleSaveMember = async (memberData) => {
    const { id, ...payload } = memberData;
    try {
      if (id) {
        await memberApi.patchMember(id, payload);
        aksaraToast.show?.("Data anggota berhasil diperbarui", "success");
      } else {
        const res = await memberApi.createMember(payload);
        aksaraToast.show?.("Anggota baru berhasil ditambahkan", "success");
        if (res && res.loginAccountCreated) {
          window.alert(
            `PENTING:\n\nAkun login untuk anggota ini telah otomatis dibuat.\nEmail: ${res.email || payload.email}\nPassword Default: ${res.defaultPassword || "password"}\n\nBeritahu anggota untuk segera mengganti password setelah login.`
          );
        }
      }
      setIsMemberModalOpen(false);
      setEditingMember(null);
      setRefreshKey((k) => k + 1);
    } catch (saveError) {
      window.alert(
        saveError?.response?.data?.message || "Gagal menyimpan data anggota."
      );
    }
  };

  const handleSuspendMember = async (member) => {
    try {
      await memberApi.patchMember(member.id, { status: "Nonaktif" });
      aksaraToast.show?.(`Status ${member.name} dinonaktifkan`, "success");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      window.alert(err?.response?.data?.message || "Gagal menonaktifkan anggota.");
    }
  };

  const handleActivateMember = async (member) => {
    try {
      await memberApi.patchMember(member.id, { status: "Aktif" });
      aksaraToast.show?.(`Status ${member.name} diaktifkan`, "success");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      window.alert(err?.response?.data?.message || "Gagal mengaktifkan anggota.");
    }
  };

  const handleConfirmDelete = async (memberId) => {
    try {
      await memberApi.deleteMember(memberId);
      aksaraToast.show?.("Anggota berhasil dihapus", "success");
      setDeletingMember(null);
      setRefreshKey((k) => k + 1);
    } catch (deleteError) {
      window.alert(
        deleteError?.response?.data?.message || "Gagal menghapus anggota."
      );
      setDeletingMember(null);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header & Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-slate-900">
            Manajemen Anggota
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Kelola data anggota perpustakaan, status keanggotaan, serta aktivitas peminjaman.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingMember(null);
            setIsMemberModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          <Icon name="plus" className="h-4 w-4" />
          <span>Tambah Anggota</span>
        </button>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Anggota */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600 border border-blue-100">
            <Icon name="users" className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Total Anggota
            </p>
            <h3 className="font-playfair text-2xl font-bold text-slate-900 mt-0.5">
              {totalMembersCount}
            </h3>
          </div>
        </div>

        {/* Card 2: Anggota Aktif */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 border border-emerald-100">
            <Icon name="check" className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Anggota Aktif
            </p>
            <h3 className="font-playfair text-2xl font-bold text-slate-900 mt-0.5">
              {activeMembersCount}
            </h3>
          </div>
        </div>

        {/* Card 3: Sedang Meminjam */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-600 border border-amber-100">
            <Icon name="bookOpen" className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Sedang Meminjam
            </p>
            <h3 className="font-playfair text-2xl font-bold text-slate-900 mt-0.5">
              {borrowingMembersCount}
            </h3>
          </div>
        </div>

        {/* Card 4: Terlambat Mengembalikan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="rounded-xl bg-rose-50 p-3 text-rose-600 border border-rose-100">
            <Icon name="clock" className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Terlambat
            </p>
            <h3 className="font-playfair text-2xl font-bold text-slate-900 mt-0.5">
              {overdueMembersCount}
            </h3>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Icon
              name="search"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama anggota atau nomor anggota..."
              className="w-full rounded-xl border border-slate-200 pl-10 pr-8 py-2 text-xs sm:text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <Icon name="close" className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Status Anggota Dropdown */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>

          {/* Filter Status Peminjaman Dropdown */}
          <div>
            <select
              value={selectedBorrowStatus}
              onChange={(e) => {
                setSelectedBorrowStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            >
              <option value="Semua">Semua Peminjaman</option>
              <option value="Tidak Meminjam">Tidak Meminjam</option>
              <option value="Sedang Meminjam">Sedang Meminjam</option>
              <option value="Terlambat">Terlambat</option>
            </select>
          </div>
        </div>

        {/* Reset Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Menampilkan filter anggota aktif
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              <Icon name="refresh" className="h-3.5 w-3.5" />
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <Icon name="info" className="h-6 w-6" />
          </div>
          <h3 className="mt-3 font-playfair text-xl font-bold text-slate-900">
            Gagal memuat data anggota
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
            {error}
          </p>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Icon name="refresh" className="h-4 w-4" /> Coba lagi
          </button>
        </div>
      ) : !isLoading && members.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <EmptyState
            icon="users"
            title="Anggota tidak ditemukan"
            description={
              hasActiveFilters
                ? "Tidak ada anggota yang sesuai dengan filter pencarian."
                : "Belum ada anggota terdaftar."
            }
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Foto</th>
                  <th className="px-5 py-3.5 font-semibold">Nama Anggota</th>
                  <th className="px-5 py-3.5 font-semibold">Nomor Anggota</th>
                  <th className="px-5 py-3.5 font-semibold">Status Anggota</th>
                  <th className="px-5 py-3.5 font-semibold">Status Peminjaman</th>
                  <th className="px-5 py-3.5 font-semibold">Tanggal Bergabung</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedMembers.map((member) => {
                  const initials = member.name
                    ? member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "MB";
                  const isActive = member.status === "Aktif";
                  const isBorrowing = member.borrowStatus === "Sedang Meminjam";
                  const isOverdue = member.borrowStatus === "Terlambat";

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-2xs"
                          />
                        ) : (
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white shadow-2xs">
                            {initials}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        <div>
                          <div className="font-semibold text-slate-900">
                            {member.name}
                          </div>
                          <div className="text-xs text-slate-400 font-normal">
                            {member.email}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-slate-700 font-mono text-xs font-medium">
                        {member.memberNumber || "-"}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {member.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border ${
                            isOverdue
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : isBorrowing
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          <Icon
                            name={
                              isOverdue
                                ? "clock"
                                : isBorrowing
                                ? "bookOpen"
                                : "check"
                            }
                            className="h-3 w-3"
                          />
                          {member.borrowStatus || "Tidak Meminjam"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-slate-600 text-xs">
                        {new Date(member.joinedDate).toLocaleDateString("id-ID")}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Edit Member Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMember(member);
                              setIsMemberModalOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200"
                            title="Edit Anggota"
                          >
                            <Icon name="pen" className="h-3.5 w-3.5" />
                          </button>

                          {/* Suspend / Activate Member Button */}
                          {isActive ? (
                            <button
                              type="button"
                              onClick={() => handleSuspendMember(member)}
                              className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors border border-amber-200"
                              title="Nonaktifkan Anggota"
                            >
                              <Icon name="ban" className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleActivateMember(member)}
                              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-emerald-200"
                              title="Aktifkan Anggota"
                            >
                              <Icon name="check" className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Delete Member Button */}
                          <button
                            type="button"
                            onClick={() => setDeletingMember(member)}
                            className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors border border-rose-200"
                            title="Hapus Anggota"
                          >
                            <Icon name="trash" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredMembers.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {/* Edit / Create Member Modal */}
      <AdminUserModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        user={editingMember}
      />

      {/* Delete Member Confirmation Modal */}
      <AdminUserDeleteModal
        isOpen={Boolean(deletingMember)}
        onClose={() => setDeletingMember(null)}
        onConfirm={handleConfirmDelete}
        user={deletingMember}
      />
    </div>
  );
}
