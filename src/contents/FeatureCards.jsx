import { useTheme } from '../contexts/ThemeContext';
import { getBgClass, getTextClass } from './themeUtils';

import { features } from '../text/features';

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

                <div className={`mt-12 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <p className={`text-center ${getTextClass(isDark)}`}>
                        <strong>💡 Tip:</strong> Use the navigation bar at the top to toggle dark mode, and look for the progress bar on the right to see your position in the dashboard.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default FeatureCards;
