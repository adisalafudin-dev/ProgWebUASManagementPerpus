import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import favoriteApi from "../services/favoriteApi.js";
import { useAuth } from "./AuthContext.jsx";
import { getBookId } from "../utils/bookHelpers.js";
import aksaraToast from "../utils/toast.js";

const FavoriteContext = createContext(null);

export function FavoriteProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (isAuthenticated) {
      try {
        const response = await favoriteApi.getFavorites();
        const data = response.data || response;
        const favorites = Array.isArray(data)
          ? data
          : data?.favorites || data?.data || [];
        
        // Backend returns Favorite objects: { id, book: Book, createdAt }
        // We map them to the format UI expects: Book objects with favoritedAt
        const normalized = favorites.map(fav => ({
          ...fav.book,
          favoritedAt: fav.createdAt ? new Date(fav.createdAt).getTime() : Date.now(),
        }));
        setFavoriteBooks(normalized);
      } catch (err) {
        setFavoriteBooks([]);
        setError("Gagal membaca data favorit dari server.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // If not authenticated, clear favorites
    setFavoriteBooks([]);
    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const favoriteIds = useMemo(() => {
    return new Set(favoriteBooks.map((book) => getBookId(book)));
  }, [favoriteBooks]);

  const favoriteCount = favoriteBooks.length;

  const addFavorite = useCallback(
    async (book) => {
      if (!book) return;
      
      if (!isAuthenticated) {
        aksaraToast.error("Silakan login untuk menyimpan favorit.");
        navigate("/login");
        return;
      }

      const bookId = getBookId(book);
      const exists = favoriteBooks.some((item) => getBookId(item) === bookId);

      if (exists) {
        aksaraToast.favoriteAlreadyExists();
        return;
      }

      try {
        // Backend strictly expects { bookId }
        await favoriteApi.addFavorite(bookId);
        setFavoriteBooks((prev) => [
          ...prev,
          { ...book, favoritedAt: Date.now() },
        ]);
        aksaraToast.favoriteAdded();
      } catch (err) {
        aksaraToast.error("Gagal menambahkan ke favorit.");
      }
    },
    [favoriteBooks, isAuthenticated, navigate],
  );

  const removeFavorite = useCallback(
    async (book) => {
      if (!book) return;
      
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      const bookId = getBookId(book);
      const exists = favoriteBooks.some((item) => getBookId(item) === bookId);

      if (!exists) return;

      try {
        await favoriteApi.removeFavoriteByBook(bookId);
        setFavoriteBooks((prev) =>
          prev.filter((item) => getBookId(item) !== bookId),
        );
        aksaraToast.favoriteRemoved();
      } catch (err) {
        aksaraToast.error("Gagal menghapus dari favorit.");
      }
    },
    [favoriteBooks, isAuthenticated, navigate],
  );

  const toggleFavorite = useCallback(
    async (book) => {
      if (!book) return;
      const bookId = getBookId(book);
      const exists = favoriteBooks.some((item) => getBookId(item) === bookId);

      if (exists) {
        await removeFavorite(book);
      } else {
        await addFavorite(book);
      }
    },
    [favoriteBooks, addFavorite, removeFavorite],
  );

  const value = useMemo(
    () => ({
      favoriteBooks,
      favoriteIds,
      favoriteCount,
      loading,
      error,
      reloadFavorites: loadFavorites,
      toggleFavorite,
      addFavorite,
      removeFavorite,
    }),
    [
      favoriteBooks,
      favoriteIds,
      favoriteCount,
      loading,
      error,
      loadFavorites,
      toggleFavorite,
      addFavorite,
      removeFavorite,
    ],
  );

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoriteProvider");
  }
  return context;
}
