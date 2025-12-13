import { useTheme } from '../contexts/ThemeContext';
import { getBgClass, getTextClass } from './themeUtils';

import { hero } from '../text/hero.js';

// Hero Section
function Hero() {
    const { isDark } = useTheme();

    return (
        <div className={`mb-16 py-16 sm:py-24 ${getBgClass(isDark)}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl sm:text-5xl font-bold mb-4">{hero.title}</h2>
                <p className={`text-lg mb-8 ${getTextClass(isDark)}`}>
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
