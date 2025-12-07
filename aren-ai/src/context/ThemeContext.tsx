import React, { createContext, useContext, useState, useEffect } from 'react';

// Define available themes
export type Theme = 'original' | 'original-alter' | 'navy' | 'sage' | 'burgundy' | 'bamboo' | 'earth';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    availableThemes: Theme[];
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>('original');

    // Load theme from local storage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('arenai-theme') as Theme;
        const userRole = localStorage.getItem('userRole');

        // Apply saved theme if it exists, otherwise default to original
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            setTheme('original');
        }
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('arenai-theme', newTheme);

        // Apply theme class to body
        document.body.className = ''; // Clear existing classes
        if (newTheme !== 'original') {
            document.body.classList.add(`theme-${newTheme}`);
        }
    };

    const availableThemes: Theme[] = ['original', 'original-alter', 'navy', 'sage', 'burgundy', 'bamboo', 'earth'];

    return (
        <ThemeContext.Provider value={{ theme, setTheme, availableThemes }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
