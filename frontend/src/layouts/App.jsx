import { lazy, Suspense } from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "./MainLayout";
import AuthLayout from "./AuthLayout";
import AdminLayout from "./AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import { ROLES } from "../constants/roles.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useScrollRestoration } from "../hooks/useScrollRestoration";

// Lazy load pages for code splitting
const ExplorePage = lazy(() => import("../pages/ExplorePage"));
const LibraryPage = lazy(() => import("../pages/LibraryPage"));
const FavoritesPage = lazy(() => import("../pages/FavoritesPage"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const BookDetailPage = lazy(() => import("../pages/BookDetailPage"));
const MyBorrowingsPage = lazy(() => import("../pages/MyBorrowingsPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const AdminDashboardPage = lazy(
  () => import("../pages/admin/AdminDashboardPage"),
);
const AdminBooksPage = lazy(() => import("../pages/admin/AdminBooksPage"));
const AdminBookDetailPage = lazy(
  () => import("../pages/admin/AdminBookDetailPage"),
);
const AdminCategoriesPage = lazy(
  () => import("../pages/admin/AdminCategoriesPage"),
);
const AdminUsersPage = lazy(() => import("../pages/admin/AdminUsersPage"));
const AdminReviewsPage = lazy(() => import("../pages/admin/AdminReviewsPage"));
const AdminBorrowingsPage = lazy(() => import("../pages/admin/AdminBorrowingsPage"));
const AdminStatisticsPage = lazy(
  () => import("../pages/admin/AdminStatisticsPage"),
);

export default function App() {
  // Custom scroll restoration
  useScrollRestoration();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<ExplorePage />} />
          <Route path="books" element={<LibraryPage />} />
          <Route path="books/:id" element={<BookDetailPage />} />
          <Route
            path="favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-borrowings"
            element={
              <ProtectedRoute>
                <MyBorrowingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="about" element={<AboutPage />} />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="books" element={<AdminBooksPage />} />
          <Route path="books/:id" element={<AdminBookDetailPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="borrowings" element={<AdminBorrowingsPage />} />
          <Route path="statistics" element={<AdminStatisticsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
