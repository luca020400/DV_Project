

import { features } from '../text/features';

function FeatureCards() {
    return (
        <div className="py-16 mb-20 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-bold mb-6">What You'll Explore</h2>
                    <p className="text-lg sm:text-xl max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
                        This dashboard provides multiple perspectives on the Syrian conflict through data-driven insights
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="p-8 rounded-xl border-2 transition-all duration-300 hover:shadow-xl cursor-default bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-blue-100 dark:hover:bg-gray-750"
                        >
                            <div className="text-5xl mb-4 inline-block p-3 rounded-lg bg-gradient-to-br from-red-500/10 to-blue-500/10">{feature.icon}</div>
                            <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 p-8 rounded-xl border-2 border-dashed bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-800 border-blue-300 dark:border-gray-700">
                    <p className="text-center text-base sm:text-lg text-gray-700 dark:text-gray-300">
                        <strong>💡 Tip:</strong> Use the navigation bar at the top to toggle dark mode, and look for the progress bar on the right to see your position in the dashboard.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default FeatureCards;
