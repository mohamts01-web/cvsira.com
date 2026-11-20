import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
export type Theme = "dark" | "light";
export const THEME_KEY = "elmam.theme";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});
export function useAppTheme() {
  return useContext(ThemeContext);
}
export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#000000" : "#ffffff");
}
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document !== "undefined" &&
    document.documentElement.dataset.theme === "light"
      ? "light"
      : "dark",
  );
  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* Switching works without storage. */
    }
  }, [theme]);
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === THEME_KEY)
        setTheme(e.newValue === "light" ? "light" : "dark");
    };
    addEventListener("storage", sync);
    return () => removeEventListener("storage", sync);
  }, []);
  const toggle = () => {
    const update = () =>
      setTheme((value) => (value === "dark" ? "light" : "dark"));
    const transitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => { ready: Promise<void> };
    };
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !transitionDocument.startViewTransition
    ) {
      update();
      return;
    }
    transitionDocument.startViewTransition(() => {
      flushSync(update);
    });
  };
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeContext);
  return (
    <button
      type="button"
      className="icon-btn theme-toggle"
      onClick={toggle}
      aria-label={
        theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"
      }
      title={theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
    >
      {theme === "dark" ? (
        <Sun size={19} aria-hidden="true" />
      ) : (
        <Moon size={19} aria-hidden="true" />
      )}
    </button>
  );
}
