import { useTheme } from '../contexts/ThemeContext';
import { getBgClass, getCardBgClass } from './themeUtils';

// Data Sources Section
function DataSources({ dataSources, flashingId }) {
    const { isDark } = useTheme();

    return (
        <section className="scroll-mt-20" id="data-sources">
            <div className={`py-12 ${getBgClass(isDark)}`}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Data Sources</h2>
                    <p className={`text-lg mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Our analysis is built on reliable, publicly available data from international organizations and research institutions
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {dataSources.map((source) => (
                            <div
                                key={source.id}
                                id={`source-${source.id}`}
                                className={`p-6 rounded-lg border scroll-mt-24 transition-all ${getCardBgClass(isDark)} ${flashingId === source.id ? 'flash-card' : ''}`}
                            >
                                <h3 className="font-semibold text-lg mb-2">{source.title}</h3>
                                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                    {source.description}
                                </p>
                                <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-block mt-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDark
                                        ? 'text-blue-400 hover:text-blue-300'
                                        : 'text-blue-600 hover:text-blue-700'
                                        }`}
                                >
                                    Visit Source →
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default DataSources;
