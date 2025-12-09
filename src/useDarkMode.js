import { useState, useEffect } from 'react';

function useDarkMode() {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('isDark');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('isDark', JSON.stringify(isDark));
    }, [isDark]);

    return [isDark, setIsDark];
}

export default useDarkMode;
