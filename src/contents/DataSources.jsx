import { useState, useMemo } from 'react';

import { useTheme } from '../contexts/ThemeContext';
import { getBgClass, getCardBgClass } from './themeUtils';

// Data Sources Section
function DataSources({ dataSources, flashingId }) {
    const { isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    const filteredSources = useMemo(() => {
        return dataSources.filter(source =>
            source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            source.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [dataSources, searchQuery]);

    return (
        <section className="scroll-mt-20" id="data-sources">
            <div className={`py-12 ${getBgClass(isDark)}`}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Data Sources</h2>
                    <p className={`text-lg mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredSources.map((source) => (
                            <div
                                key={source.id}
                                id={`source-${source.id}`}
                                className={`p-6 rounded-lg border scroll-mt-24 transition-all ${getCardBgClass(isDark)} ${flashingId === source.id ? 'flash-card ring-2 ring-red-500' : ''}`}
                            >
                                <div
                                    className="cursor-pointer flex items-start justify-between"
                                    onClick={() => setExpandedId(expandedId === source.id ? null : source.id)}
                                >
                                    <h3 className="font-semibold text-lg flex-1">{source.title}</h3>
                                    <span className={`text-lg ml-2 transition-transform ${expandedId === source.id ? 'rotate-180' : ''}`}>
                                        ⌄
                                    </span>
                                </div>

                                {/* Description - always visible on mobile, toggleable on desktop */}
                                <p className={`mt-2 text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {source.description}
                                </p>

                                {/* Link and expanded info */}
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
