import { LogOut, User, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function Navbar({ onMenuClick, onLogout }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-gray-100 truncate">
            Parent Academic Monitoring System
          </h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors duration-300"
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 dark:bg-gray-800">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-gray-300">
              Parent
            </span>
          </div>
          <button
            type="button"
            onClick={() => onLogout?.()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
