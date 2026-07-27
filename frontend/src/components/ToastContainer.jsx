import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { useTheme } from "../contexts/ThemeContext.jsx";

export default function ToastContainer() {
  const { isDarkMode } = useTheme();
  const [position, setPosition] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 640
      ? "bottom-center"
      : "top-right",
  );

  useEffect(() => {
    const handleResize = () => {
      setPosition(window.innerWidth < 640 ? "bottom-center" : "top-right");
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Toaster
      position={position}
      theme={isDarkMode ? "dark" : "light"}
      closeButton
      richColors
      toastOptions={{
        className: "font-sans rounded-xl shadow-book border font-medium text-sm",
        style: {
          borderRadius: "0.75rem",
        },
      }}
    />
  );
}

