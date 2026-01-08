/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react';

const ThemeContext = createContext(undefined);

export function ThemeProvider({ isDark, setIsDark, children }) {
    return (
        <ThemeContext.Provider value={{ isDark, setIsDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
