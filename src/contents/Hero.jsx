import { useTheme } from '../contexts/ThemeContext';
import { getBgClass, getTextClass } from './themeUtils';

import { hero } from '../text/hero.js';

// Hero Section
function Hero() {
    const { isDark } = useTheme();

    return (
        <div className={`relative mb-20 py-20 sm:py-32 bg-gradient-to-b ${isDark ? 'from-gray-900 via-gray-800 to-gray-900' : 'from-blue-50 via-white to-gray-50'}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-400">{hero.title}</h1>
                <p className={`text-lg sm:text-xl mb-12 ${getTextClass(isDark)}`}>
                    {hero.subtitle}
                </p>
                {hero.content && hero.content.length > 0 && (
                    <div className={`space-y-4 text-base sm:text-lg leading-relaxed text-left ${getTextClass(isDark)}`}>
                        {hero.content.map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Hero;
