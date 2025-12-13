import { useState, useMemo } from 'react';

import { useTheme } from '../contexts/ThemeContext';
import { getBgClass, getCardBgClass } from './themeUtils';

// Data Sources Section
function DataSources({ dataSources, flashingId }) {
    const { isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSources = useMemo(() => {
        return dataSources.filter(source =>
            source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            source.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [dataSources, searchQuery]);

    return (
        <section className="scroll-mt-20" id="data-sources">
            <div className={`py-16 sm:py-24 ${getBgClass(isDark)}`}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl sm:text-5xl font-bold mb-6">Data Sources</h2>
                    <p className={`text-lg sm:text-xl mb-12 max-w-2xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Our analysis is built on reliable, publicly available data from international organizations and research institutions
                    </p>

                    {/* Search Input */}
                    <div className="mb-8">
                        <input
                            type="text"
                            placeholder="Search sources by name or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 ${isDark
                                ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-red-500'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500'
                                }`}
                        />
                    </div>

                    {/* Results counter */}
                    {searchQuery && (
                        <p className={`mb-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Showing {filteredSources.length} of {dataSources.length} sources
                        </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredSources.map((source) => (
                            <div
                                key={source.id}
                                id={`source-${source.id}`}
                                className={`p-8 rounded-xl border-2 scroll-mt-24 transition-all duration-300 hover:shadow-lg hover:scale-102 ${getCardBgClass(isDark)} ${flashingId === source.id ? 'flash-card ring-2 ring-red-500 ring-offset-2' : isDark ? 'border-gray-700 hover:border-blue-500' : 'border-gray-200 hover:border-blue-400'}`}
                            >
                                <h3 className="font-bold text-lg">{source.title}</h3>

                                <p className={`mt-2 text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {source.description}
                                </p>

                                <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-block mt-4 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDark
                                        ? 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 hover:text-blue-300'
                                        : 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700'
                                        }`}
                                >
                                    Visit Source →
                                </a>
                            </div>
                        ))}
                    </div>

                    {filteredSources.length === 0 && searchQuery && (
                        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <p>No sources found matching "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default DataSources;
