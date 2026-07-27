import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import { useNotification } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";

export default function NotificationDropdown() {
  const { isAuthenticated } = useAuth();
  const { backendNotifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label="Notifikasi"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-borderSoft bg-white text-textSecondary shadow-xs transition-all duration-200 hover:border-accent hover:text-accentHover navbar-icon-btn ${isOpen ? 'border-accent text-accentHover' : ''}`}
      >
        <Icon name="bell" className="h-4 w-4" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-borderSoft bg-white shadow-2xl z-50">
          <div className="flex items-center justify-between border-b border-borderSoft/60 px-4 py-3 bg-cream/30">
            <h3 className="font-playfair text-sm font-bold text-textMain">Notifikasi</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-accentHover hover:underline transition-all"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto overscroll-contain">
            {backendNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cream/50 text-textSecondary">
                  <Icon name="bell" className="h-6 w-6 opacity-50" />
                </div>
                <p className="text-sm font-semibold text-textMain">Belum ada notifikasi</p>
                <p className="mt-1 text-xs text-textSecondary font-crimson">
                  Notifikasi baru akan muncul di sini.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-borderSoft/40">
                {backendNotifications.map((notif) => (
                  <li 
                    key={notif.id || notif._id} 
                    className={`relative p-4 transition-colors hover:bg-cream/50 cursor-pointer ${notif.read ? 'opacity-70' : 'bg-cream/20'}`}
                    onClick={() => {
                      if (!notif.read) markAsRead(notif.id || notif._id);
                    }}
                  >
                    {!notif.read && (
                      <span className="absolute left-2 top-4 h-1.5 w-1.5 rounded-full bg-accent"></span>
                    )}
                    <div className="ml-2">
                      <p className="text-sm font-semibold text-textMain mb-1">
                        {notif.title}
                      </p>
                      <p className="text-xs text-textSecondary font-crimson leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="mt-2 text-[10px] text-textSecondary font-semibold uppercase tracking-wider">
                        {new Date(notif.createdAt).toLocaleDateString("id-ID", {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
