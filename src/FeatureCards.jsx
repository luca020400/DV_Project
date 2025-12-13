import { useTheme } from './contexts/ThemeContext';
import { getBgClass, getTextClass } from './contents/themeUtils';
import { features } from './text/features';

function FeatureCards() {
    const { isDark } = useTheme();

    return (
        <div className={`py-12 sm:py-16 ${getBgClass(isDark)}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">What You'll Explore</h2>
                    <p className={`text-lg ${getTextClass(isDark)}`}>
                        This dashboard provides multiple perspectives on the Syrian conflict through data-driven insights
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className={`p-6 rounded-lg border-2 transition hover:shadow-lg ${isDark
                                ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
                                : 'bg-white border-gray-200 hover:border-blue-400'
                                }`}
                        >
                            <div className="text-4xl mb-3">{feature.icon}</div>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className={getTextClass(isDark)}>
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-12">
                    <h3 className="text-2xl font-semibold mb-6 text-center">How to Navigate</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <p className="flex gap-3 items-start">
                                <span className="text-2xl flex-shrink-0">👉</span>
                                <span className={getTextClass(isDark)}>
                                    <strong>Scroll</strong> through sections to explore different aspects of the conflict
                                </span>
                            </p>
                        </div>
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <p className="flex gap-3 items-start">
                                <span className="text-2xl flex-shrink-0">🎨</span>
                                <span className={getTextClass(isDark)}>
                                    <strong>Toggle dark mode</strong> in the navigation bar for comfortable viewing
                                </span>
                            </p>
                        </div>
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <p className="flex gap-3 items-start">
                                <span className="text-2xl flex-shrink-0">📍</span>
                                <span className={getTextClass(isDark)}>
                                    <strong>Use the side progress bar</strong> to see where you are in the dashboard
                                </span>
                            </p>
                        </div>
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <p className="flex gap-3 items-start">
                                <span className="text-2xl flex-shrink-0">⬆️</span>
                                <span className={getTextClass(isDark)}>
                                    <strong>Scroll to the bottom</strong> to see all data sources and citations
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FeatureCards;
