import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const scrollPositions = new Map();

export function useScrollRestoration() {
  const location = useLocation();

  useEffect(() => {
    // Restore scroll position when navigating back
    const savedPosition = scrollPositions.get(location.key);
    if (savedPosition !== undefined) {
      window.scrollTo(0, savedPosition);
    } else {
      // Scroll to top for new locations
      window.scrollTo(0, 0);
    }

    // Save scroll position before unmount
    const handleScroll = () => {
      scrollPositions.set(location.key, window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.key]);
}

export default useScrollRestoration;
