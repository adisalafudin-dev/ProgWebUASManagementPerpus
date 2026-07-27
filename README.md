# 📚 Sistem Manajemen Perpustakaan (Library Management System)

> **Proyek Ujian Akhir Semester (UAS)**
> Mata Kuliah: Pemrograman Web
> Program Studi S1 Informatika — Universitas AMIKOM Yogyakarta

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-Backend-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeORM](https://img.shields.io/badge/TypeORM-ORM-FE0902)](https://typeorm.io/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](#-lisensi)

---

## 📖 Daftar Isi

1. [Deskripsi Proyek](#-deskripsi-proyek)
2. [Identitas Pengembang](#-identitas-pengembang)
3. [Tujuan Aplikasi](#-tujuan-aplikasi)
4. [Fitur Utama](#-fitur-utama)
5. [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
6. [Arsitektur Sistem](#-arsitektur-sistem)
7. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
8. [Struktur Basis Data (ERD)](#-struktur-basis-data-erd)
9. [Persyaratan Sistem (Prerequisites)](#-persyaratan-sistem-prerequisites)
10. [Panduan Instalasi & Menjalankan Aplikasi](#-panduan-instalasi--menjalankan-aplikasi)
    - [1. Clone Repository](#1-clone-repository)
    - [2. Konfigurasi & Menjalankan Backend](#2-konfigurasi--menjalankan-backend)
    - [3. Konfigurasi & Menjalankan Frontend](#3-konfigurasi--menjalankan-frontend)
11. [Dokumentasi API (Swagger)](#-dokumentasi-api-swagger)
12. [Daftar Endpoint API](#-daftar-endpoint-api)
13. [Akun Pengguna Default (Seeder)](#-akun-pengguna-default-seeder)
14. [Alur Penggunaan Aplikasi](#-alur-penggunaan-aplikasi)
15. [Tangkapan Layar Aplikasi](#-tangkapan-layar-aplikasi)
16. [Rencana Pengembangan Selanjutnya](#-rencana-pengembangan-selanjutnya)
17. [Lisensi](#-lisensi)

---

## 📝 Deskripsi Proyek

**Sistem Manajemen Perpustakaan** adalah aplikasi web *full-stack* yang dikembangkan sebagai pemenuhan tugas **Ujian Akhir Semester (UAS)** pada mata kuliah **Pemrograman Web**. Aplikasi ini dirancang untuk membantu proses digitalisasi pengelolaan perpustakaan, mencakup manajemen data buku, kategori buku, serta proses peminjaman dan pengembalian buku oleh anggota/pengguna.

Aplikasi dibangun dengan pendekatan **arsitektur terpisah (decoupled architecture)**, di mana **backend** berperan sebagai *RESTful API* yang menangani seluruh logika bisnis dan akses basis data, sedangkan **frontend** berperan sebagai antarmuka pengguna (*user interface*) yang mengonsumsi API tersebut.


## 🎯 Tujuan Aplikasi

1. Mengimplementasikan konsep **RESTful API** menggunakan framework backend modern (NestJS).
2. Menerapkan **autentikasi dan otorisasi** pengguna berbasis **JSON Web Token (JWT)**.
3. Mengimplementasikan operasi **CRUD (Create, Read, Update, Delete)** pada entitas Kategori, Buku, dan Peminjaman.
4. Menerapkan relasi antar-tabel pada basis data relasional menggunakan **ORM (Object Relational Mapping)**.
5. Menyediakan dokumentasi API otomatis menggunakan **Swagger/OpenAPI**.
6. Mengimplementasikan fitur pendukung seperti **paginasi**, **pencarian (search)**, dan **database seeding**.
7. Membangun antarmuka pengguna yang responsif dan terintegrasi penuh dengan backend API.

## ✨ Fitur Utama

### 🔐 Autentikasi & Otorisasi
- Registrasi dan login pengguna dengan **JWT (JSON Web Token)**.
- Enkripsi kata sandi menggunakan *hashing* (bcrypt).
- Proteksi *endpoint* API menggunakan **Guard** dan pembatasan hak akses berbasis peran (*role-based access*: Admin/Petugas & Anggota).

### 📗 Manajemen Kategori Buku
- Tambah, lihat, ubah, dan hapus data kategori buku.

### 📚 Manajemen Buku
- Tambah, lihat, ubah, dan hapus data buku (judul, penulis, penerbit, tahun terbit, stok, kategori, dll).
- **Pencarian (search)** buku berdasarkan judul/penulis.
- **Paginasi** data buku untuk efisiensi tampilan data dalam jumlah besar.

### 🔄 Manajemen Peminjaman
- Pencatatan transaksi peminjaman buku oleh anggota.
- Pencatatan pengembalian buku beserta validasi status.
- Pembaruan stok buku secara otomatis saat terjadi peminjaman/pengembalian.
- Riwayat peminjaman per pengguna.

### ⚙️ Fitur Pendukung
- **Swagger UI** untuk dokumentasi dan pengujian API secara interaktif.
- **Database Seeder** untuk mengisi data awal (dummy data) secara otomatis.
- Validasi input pada setiap *request* menggunakan **DTO (Data Transfer Object)** dan `class-validator`.
- Penanganan galat (*error handling*) yang konsisten di seluruh *endpoint*.

## 🛠 Teknologi yang Digunakan

### Backend
| Teknologi | Fungsi |
|---|---|
| **NestJS** | Framework backend berbasis Node.js dan TypeScript |
| **TypeORM** | ORM untuk pemetaan objek ke basis data relasional |
| **MySQL** | Sistem manajemen basis data relasional |
| **JWT (JSON Web Token)** | Mekanisme autentikasi berbasis token |
| **Passport.js** | Middleware strategi autentikasi |
| **bcrypt** | Enkripsi (hashing) kata sandi pengguna |
| **class-validator & class-transformer** | Validasi dan transformasi data request |
| **Swagger (OpenAPI)** | Dokumentasi API interaktif |

### Frontend
| Teknologi | Fungsi |
|---|---|
| **React** | Library untuk membangun antarmuka pengguna |
| **TypeScript** | Superset JavaScript dengan penambahan tipe data statis |
| **Vite** | Build tool dan development server frontend |
| **Tailwind CSS & shadcn/ui** | Kerangka kerja tampilan (styling) dan komponen UI |
| **Axios / Fetch API** | Klien HTTP untuk komunikasi dengan backend API |

> ℹ️ **Catatan:** Sesuaikan tabel teknologi di atas dengan *package.json* aktual pada masing-masing folder `backend` dan `frontend` apabila terdapat perbedaan pustaka yang digunakan.

## 🏗 Arsitektur Sistem

Aplikasi ini menggunakan arsitektur **Client-Server** dengan pemisahan tanggung jawab yang jelas antara backend dan frontend:

```
┌─────────────────────┐        HTTP/REST (JSON)        ┌──────────────────────┐
│                      │  ────────────────────────────▶ │                      │
│   Frontend (React)   │                                 │   Backend (NestJS)   │
│   - UI/UX            │  ◀──────────────────────────── │   - REST API         │
│   - State Management │        JWT Bearer Token         │   - Business Logic   │
│                      │                                 │   - Authentication   │
└─────────────────────┘                                 └───────────┬──────────┘
                                                                      │
                                                                      │ TypeORM
                                                                      ▼
                                                          ┌──────────────────────┐
                                                          │   MySQL Database     │
                                                          │   - users            │
                                                          │   - categories       │
                                                          │   - books            │
                                                          │   - borrowings       │
                                                          └──────────────────────┘
```

Pola arsitektur backend mengikuti struktur **modular** khas NestJS, dengan pemisahan tiap domain fungsional (Auth, User, Category, Book, Borrowing) ke dalam modul masing-masing yang terdiri atas **Controller** (menangani *request/response*), **Service** (logika bisnis), **Entity** (representasi tabel basis data), dan **DTO** (validasi data).

## 📁 Struktur Direktori Proyek

```
ProgWebUASManagementPerpus/
│
├── backend/                     # Aplikasi server (NestJS REST API)
│   ├── src/
│   │   ├── auth/                 # Modul autentikasi (login, register, JWT strategy)
│   │   ├── users/                # Modul manajemen pengguna
│   │   ├── categories/           # Modul manajemen kategori buku
│   │   ├── books/                # Modul manajemen buku
│   │   ├── borrowings/           # Modul manajemen peminjaman buku
│   │   ├── database/
│   │   │   └── seeder/           # Script seeding data awal
│   │   ├── app.module.ts
│   │   └── main.ts               # Entry point aplikasi + konfigurasi Swagger
│   ├── .env.example              # Contoh konfigurasi environment
│   └── package.json
│
├── frontend/                    # Aplikasi klien (React)
│   ├── src/
│   │   ├── components/           # Komponen UI reusable
│   │   ├── pages/                # Halaman aplikasi (Login, Dashboard, Buku, dll)
│   │   ├── services/              # Konfigurasi axios/fetch ke backend API
│   │   └── App.tsx
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

> ℹ️ **Catatan:** Struktur di atas merupakan representasi umum arsitektur modular NestJS + React. Silakan sesuaikan penamaan folder/file dengan kondisi aktual pada repositori Anda.

## 🗄 Struktur Basis Data (ERD)

Aplikasi menggunakan basis data relasional **MySQL** dengan entitas utama sebagai berikut:

```
┌────────────────┐        ┌─────────────────┐        ┌────────────────┐
│     users       │        │   borrowings     │        │     books       │
├────────────────┤        ├─────────────────┤        ├────────────────┤
│ id (PK)         │───┐    │ id (PK)          │    ┌───│ id (PK)         │
│ name            │   └───▶│ user_id (FK)     │    │   │ title           │
│ email           │        │ book_id (FK)     │◀───┘   │ author          │
│ password        │        │ borrow_date      │        │ publisher       │
│ role            │        │ due_date         │        │ year            │
│ created_at      │        │ return_date      │        │ stock           │
└────────────────┘        │ status           │        │ category_id (FK)│──┐
                            │ created_at       │        │ created_at      │  │
                            └─────────────────┘        └────────────────┘  │
                                                                              │
                                                          ┌────────────────┐  │
                                                          │   categories    │◀─┘
                                                          ├────────────────┤
                                                          │ id (PK)         │
                                                          │ name            │
                                                          │ created_at      │
                                                          └────────────────┘
```

**Relasi antar-tabel:**
- Satu `category` dapat memiliki banyak `book` (**One-to-Many**).
- Satu `user` dapat melakukan banyak `borrowing` (**One-to-Many**).
- Satu `book` dapat memiliki banyak riwayat `borrowing` (**One-to-Many**).

> ℹ️ **Catatan:** Sesuaikan nama kolom/tabel pada diagram di atas dengan definisi *entity* aktual pada folder `backend/src/**/entities`.

## 💻 Persyaratan Sistem (Prerequisites)

Sebelum menjalankan aplikasi, pastikan perangkat yang digunakan telah terpasang perangkat lunak berikut:

| Perangkat Lunak | Versi Minimum | Tautan Unduh |
|---|---|---|
| **Node.js** | v18.x atau lebih baru | https://nodejs.org/ |
| **npm** | v9.x (terpasang bersama Node.js) | — |
| **MySQL** | v8.x | https://dev.mysql.com/downloads/ |
| **Git** | Versi terbaru | https://git-scm.com/ |
| **Code Editor** (disarankan) | VS Code | https://code.visualstudio.com/ |

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

Berikut adalah langkah-langkah lengkap untuk menjalankan aplikasi ini secara lokal, mulai dari pengambilan kode sumber hingga aplikasi dapat diakses melalui browser.

### 1. Clone Repository

```bash
git clone https://github.com/adisalafudin-dev/ProgWebUASManagementPerpus.git
cd ProgWebUASManagementPerpus
```

### 2. Konfigurasi & Menjalankan Backend

**a. Masuk ke direktori backend**
```bash
cd backend
```

**b. Instalasi dependensi**
```bash
npm install
```

**c. Konfigurasi variabel lingkungan (environment variables)**

Buat file `.env` pada folder `backend` (dapat menyalin dari `.env.example` jika tersedia), lalu sesuaikan dengan konfigurasi lokal:

```env
# Konfigurasi Server
PORT=3000

# Konfigurasi Database MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=perpustakaan_db

# Konfigurasi JWT
JWT_SECRET=isi_dengan_kunci_rahasia_anda
JWT_EXPIRES_IN=1d
```

**d. Membuat basis data**

Buat basis data baru pada MySQL sesuai nama pada `DB_NAME` (contoh: `perpustakaan_db`), misalnya melalui MySQL CLI atau phpMyAdmin:

```sql
CREATE DATABASE perpustakaan_db;
```

**e. Menjalankan seeder (opsional, untuk data awal)**
```bash
npm run seed
```

**f. Menjalankan server backend (mode development)**
```bash
npm run start:dev
```

Setelah berhasil, backend akan berjalan pada `http://localhost:3000`.

### 3. Konfigurasi & Menjalankan Frontend

**a. Buka terminal baru, lalu masuk ke direktori frontend**
```bash
cd frontend
```

**b. Instalasi dependensi**
```bash
npm install
```

**c. Konfigurasi variabel lingkungan**

Buat file `.env` pada folder `frontend`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

**d. Menjalankan aplikasi frontend**
```bash
npm run dev
```

Setelah berhasil, aplikasi frontend dapat diakses melalui `http://localhost:5173` (port default Vite).

> ℹ️ **Catatan:** Perintah dan port di atas mengikuti konfigurasi standar NestJS (`start:dev`, port 3000) dan Vite+React (`dev`, port 5173). Silakan sesuaikan dengan skrip yang tertulis pada masing-masing `package.json` bila terdapat perbedaan.

## 📑 Dokumentasi API (Swagger)

Backend telah dilengkapi dokumentasi API otomatis menggunakan **Swagger (OpenAPI)**. Setelah server backend berjalan, dokumentasi dapat diakses melalui:

```
http://localhost:3000/api
```

Melalui halaman ini, dosen penilai maupun pengguna dapat melihat seluruh *endpoint* yang tersedia, struktur *request/response*, serta melakukan pengujian API secara langsung (*try it out*) tanpa memerlukan aplikasi klien tambahan seperti Postman.

## 🔗 Daftar Endpoint API

Berikut ringkasan *endpoint* utama yang tersedia pada REST API:

### Autentikasi
| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `POST` | `/auth/register` | Registrasi pengguna baru | Publik |
| `POST` | `/auth/login` | Login dan memperoleh JWT token | Publik |

### Kategori Buku
| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `GET` | `/categories` | Menampilkan seluruh kategori | Terautentikasi |
| `POST` | `/categories` | Menambahkan kategori baru | Admin |
| `PATCH` | `/categories/:id` | Memperbarui data kategori | Admin |
| `DELETE` | `/categories/:id` | Menghapus data kategori | Admin |

### Buku
| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `GET` | `/books?page=1&limit=10&search=` | Menampilkan daftar buku (dengan paginasi & pencarian) | Terautentikasi |
| `GET` | `/books/:id` | Menampilkan detail buku | Terautentikasi |
| `POST` | `/books` | Menambahkan buku baru | Admin |
| `PATCH` | `/books/:id` | Memperbarui data buku | Admin |
| `DELETE` | `/books/:id` | Menghapus data buku | Admin |

### Peminjaman
| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `GET` | `/borrowings` | Menampilkan seluruh transaksi peminjaman | Admin |
| `GET` | `/borrowings/me` | Menampilkan riwayat peminjaman milik pengguna login | Terautentikasi |
| `POST` | `/borrowings` | Membuat transaksi peminjaman baru | Terautentikasi |
| `PATCH` | `/borrowings/:id/return` | Memproses pengembalian buku | Admin |

> ℹ️ **Catatan:** Tabel di atas merupakan gambaran umum *endpoint* berdasarkan alur bisnis aplikasi. Silakan sesuaikan nama *route*, parameter, dan hak akses persis dengan implementasi pada folder `backend/src/**/*.controller.ts`, atau rujuk langsung ke Swagger UI untuk daftar yang akurat dan terkini.

## 🔑 Akun Pengguna Default (Seeder)

Apabila perintah `npm run seed` dijalankan, sistem akan membuat akun contoh berikut untuk keperluan pengujian:

| Role | Email | Password |
|---|---|---|
| Admin/Petugas | `admin@perpustakaan.com` | `password123` |
| Anggota | `member@perpustakaan.com` | `password123` |

> ⚠️ **Catatan Keamanan:** Kredensial di atas hanya digunakan untuk keperluan demonstrasi/pengujian pada lingkungan lokal (*development*) dan **wajib diganti** apabila aplikasi akan digunakan pada lingkungan produksi.

## 🔄 Alur Penggunaan Aplikasi

1. **Registrasi/Login** — Pengguna melakukan registrasi akun atau login menggunakan akun yang telah terdaftar.
2. **Autentikasi** — Sistem memvalidasi kredensial dan mengembalikan JWT token yang digunakan untuk mengakses *endpoint* yang terproteksi.
3. **Manajemen Data (Admin)** — Admin/petugas mengelola data kategori dan buku (tambah, ubah, hapus).
4. **Peminjaman Buku (Anggota)** — Anggota memilih buku yang tersedia dan mengajukan peminjaman; stok buku berkurang secara otomatis.
5. **Pengembalian Buku** — Admin memproses pengembalian buku; stok buku diperbarui kembali.
6. **Riwayat & Laporan** — Pengguna dan admin dapat melihat riwayat transaksi peminjaman.

## 🖼 Tangkapan Layar Aplikasi

> Tambahkan tangkapan layar (*screenshot*) aplikasi pada bagian ini untuk memperjelas gambaran antarmuka kepada dosen penilai. Contoh format penyematan gambar:

```markdown
### Halaman Login
![Halaman Login](./docs/screenshots/login.png)

### Dashboard Manajemen Buku
![Dashboard Buku](./docs/screenshots/dashboard-books.png)

### Swagger API Documentation
![Swagger UI](./docs/screenshots/swagger.png)
```

## 🔮 Rencana Pengembangan Selanjutnya

- [ ] Fitur notifikasi keterlambatan pengembalian buku (denda).
- [ ] Fitur ekspor laporan peminjaman ke format PDF/Excel.
- [ ] Fitur unggah gambar sampul buku.
- [ ] Implementasi *role* tambahan (misalnya Kepala Perpustakaan).
- [ ] Pengujian otomatis (*unit testing* & *e2e testing*).

## 📄 Lisensi

Proyek ini dibuat untuk keperluan **akademik** sebagai pemenuhan tugas Ujian Akhir Semester (UAS) mata kuliah Pemrograman Web di Universitas AMIKOM Yogyakarta, dan didistribusikan di bawah [Lisensi MIT](https://opensource.org/licenses/MIT) untuk keperluan pembelajaran.

---

<p align="center">
  Dibuat dengan 💻 dan ☕ oleh <b>Adi Salafudin</b> — S1 Informatika, Universitas AMIKOM Yogyakarta
</p>
