import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import notificationApi from "../services/notificationApi.js";
import { useAuth } from "./AuthContext.jsx";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { showToast as sonnerShowToast } from "../utils/toast.js";

const NotificationContext = createContext(null);

let toastIdCounter = 0;

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [toasts, setToasts] = useState([]);
  const [backendNotifications, setBackendNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [response, countResponse] = await Promise.all([
        notificationApi.getNotifications(),
        notificationApi.getUnreadCount()
      ]);
      const data = response.data || response;
      const notifications = Array.isArray(data)
        ? data
        : data?.notifications || data?.data || [];
      setBackendNotifications(notifications);

      const countData = countResponse.data || countResponse;
      const count =
        typeof countData === "number"
          ? countData
          : countData?.count || countData?.unreadCount || 0;
      setUnreadCount(count);
    } catch {
      // Backend fallback silent
    }
  }, [isAuthenticated]);

  // Load backend notifications when authenticated, and poll every 2 minutes
  useEffect(() => {
    if (!isAuthenticated) {
      setBackendNotifications([]);
      setUnreadCount(0);
      return;
    }

    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, loadNotifications]);

  // Also refetch when route changes
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [location.pathname, isAuthenticated, loadNotifications]);

  const dismissToast = useCallback((id) => {
    toast.dismiss(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title, message, type = "info", duration) => {
      const toastId = sonnerShowToast(title, message, type, duration);
      return toastId;
    },
    [],
  );

  const markAsRead = useCallback(
    async (id) => {
      if (isAuthenticated) {
        try {
          await notificationApi.markAsRead(id);
          setBackendNotifications((prev) =>
            prev.map((n) =>
              n.id === id || n._id === id ? { ...n, read: true } : n,
            ),
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch {
          // Silent fallback
        }
      }
    },
    [isAuthenticated],
  );

  const markAllAsRead = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await notificationApi.markAllAsRead();
        setBackendNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true })),
        );
        setUnreadCount(0);
      } catch {
        // Silent fallback
      }
    }
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      dismissToast,
      backendNotifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
    }),
    [
      toasts,
      showToast,
      dismissToast,
      backendNotifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
