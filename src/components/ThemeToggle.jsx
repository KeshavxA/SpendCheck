import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-200 dark:bg-slate-700 transition-all duration-300 hover:ring-2 ring-blue-400"
            aria-label="Toggle Dark Mode"
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 text-slate-800" />
            ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
            )}
        </button>
    );
};

export default ThemeToggle;