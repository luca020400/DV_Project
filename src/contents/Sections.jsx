import { useState, useEffect, useMemo } from "react";

import { useTheme } from '../contexts/ThemeContext';
import { useVisualizationData } from "../contexts/DataProviderContext";
import componentDataKeyMapper from "../util/ComponentDataKeyMapper";
import { getBgClass, getTextClass } from './themeUtils';
import CasualtiesChart from "../d3/CasualtiesChart";
import DisplacementChart from "../d3/DisplacementChart";
import RegionalConflictChart from "../d3/RegionalConflictChart";
import EconomicIndicatorsCharts from "../d3/EconomicIndicatorsChart";
import ConflictEventsChart from "../d3/ConflictEventsChart";

// Render visualization based on component name
function DynamicVisualization({ componentName, data, isMobile }) {
    switch (componentName) {
        case 'CasualtyTrendChart':
            return <CasualtiesChart data={data} isMobile={isMobile} />;
        case 'RegionalConflictMap':
            return <RegionalConflictChart dataObj={data} isMobile={isMobile} />;
        case 'EconomicIndicators':
            return <EconomicIndicatorsCharts data={data} isMobile={isMobile} />;
        case 'TimelineChart':
            return <ConflictEventsChart dataObj={data} isMobile={isMobile} />;
        case 'DisplacementChart':
            return <DisplacementChart data={data} isMobile={isMobile} />;
        default:
            return null;
    }
}

// Description Section
function DescriptionSection({ section }) {
    const { isDark } = useTheme();

    return (
        <div className={`py-12 ${getBgClass(isDark)}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`space-y-6 text-lg sm:text-xl leading-relaxed font-light ${getTextClass(isDark)}`}>
                    {section.description.map((paragraph, idx) => (
                        <p key={idx} className="text-base sm:text-lg">{paragraph}</p>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Mobile placeholder component
function MobileChartPlaceholder({ onOpen }) {
    const { isDark } = useTheme();

    return (
        <div
            className={`w-full h-56 rounded-xl border-3 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:border-opacity-100 hover:scale-102 hover:shadow-lg ${isDark ? 'border-gray-600 bg-gray-700/50 hover:bg-gray-650 hover:border-blue-500' : 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:bg-gray-100 hover:border-blue-400'}`}
            onClick={onOpen}
        >
            <p className={`text-2xl font-bold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                📊 Interactive Chart
            </p>
            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Click here to view fullscreen
            </p>
        </div>
    );
}

function FullscreenChartModal({ isOpen, onClose, data, componentName, isLoading }) {
    const { isDark } = useTheme();

    useEffect(() => {
        if (isOpen) {
            document.documentElement.style.overflow = 'hidden';
            return () => {
                document.documentElement.style.overflow = '';
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleModalClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={handleModalClick}>
            <div className={`relative w-full h-full max-w-6xl rounded-lg ${isDark ? 'bg-gray-900' : 'bg-white'} flex flex-col`}>
                {/* Header */}
                <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} flex-shrink-0 flex items-center justify-between`}>
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        Chart Visualization
                    </h2>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors bg-red-600 hover:bg-red-700 text-white`}
                    >
                        × Close
                    </button>
                </div>

                {/* Chart container */}
                <div className={`flex-1 overflow-hidden w-full ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    {isLoading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading...</p>
                        </div>
                    ) : (
                        <div className="w-full h-full">
                            <DynamicVisualization componentName={componentName} data={data} isMobile={true} />
                        </div>
                    )}
                </div>

                {/* Mobile hints */}
                <div className={`p-4 border-t space-y-2 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} flex-shrink-0 md:hidden`}>
                    <p className={`text-sm text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        💡 Tip: Pinch to zoom, drag to pan
                    </p>
                    <p className={`text-sm text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        📱 For better viewing, rotate your device to landscape
                    </p>
                </div>
            </div>
        </div>
    );
}

function VisualizationSection({ section }) {
    const { isDark } = useTheme();

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Determine data key
    const dataKey = componentDataKeyMapper.getDataKey(section.visualization.component);
    const { data, isLoading, error } = useVisualizationData(dataKey);

    if (error) {
        return (
            <div className={`py-8 ${getBgClass(isDark)}`}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-900'}`}>
                        Error loading visualization data: {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`py-8 ${getBgClass(isDark)}`}>
                {/* Mobile: Show placeholder only */}
                <div className="lg:hidden w-full px-4 mx-auto">
                    <MobileChartPlaceholder onOpen={() => setIsModalOpen(true)} />
                </div>

                {/* Desktop: Full width background strip */}
                <div className={`hidden lg:flex lg:w-full h-full items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="w-full mx-4 sm:mx-auto sm:max-w-[95rem] h-full">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading...</p>
                            </div>
                        ) : (
                            <DynamicVisualization componentName={section.visualization.component} data={data} isMobile={false} />
                        )}
                    </div>
                </div>
            </div>

            {/* Fullscreen Modal */}
            <FullscreenChartModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={data}
                componentName={section.visualization.component}
                isLoading={isLoading}
            />
        </>
    );
}

function SourceDataSection({ section, dataSources, onScrollToSource }) {
    const { isDark } = useTheme();

    const sourceButtons = useMemo(() => {
        return section.sourceData.map((sourceId) => {
            return dataSources.find(source => source.id === sourceId);
        }).filter(Boolean);
    }, [section.sourceData, dataSources]);

    const handleViewAllSources = () => {
        const element = document.getElementById('data-sources');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className={`py-12 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h4 className="text-2xl font-bold">Data Sources for this Section</h4>
                    <button
                        onClick={handleViewAllSources}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 whitespace-nowrap hover:shadow-md ${isDark
                            ? 'text-gray-200 hover:text-gray-100 hover:bg-gray-800 border border-gray-700 hover:border-blue-500'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 hover:border-blue-400'
                            }`}
                    >
                        View all sources ↓
                    </button>
                </div>
                <div className="flex flex-wrap gap-4">
                    {sourceButtons.map((source) => (
                        <button
                            key={source.id}
                            onClick={() => onScrollToSource(source.id)}
                            className={`px-5 py-2.5 rounded-lg border-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 hover:shadow-md ${isDark
                                ? 'bg-gray-800 border-gray-700 text-blue-400 hover:bg-gray-700 hover:border-blue-500 hover:text-blue-300'
                                : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700'
                                }`}
                        >
                            {source.title}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Main Sections Component
function Sections({ sections, sources, onScrollToSource }) {
    const { isDark } = useTheme();

    return (
        <>
            {sections.map((section, sectionIndex) => (
                <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-20"
                >
                    {/* Visual separator - only between sections */}
                    {sectionIndex > 0 && (
                        <div className={`h-1 bg-gradient-to-r ${isDark ? 'from-transparent via-gray-700 to-transparent' : 'from-transparent via-gray-200 to-transparent'}`} />
                    )}

                    {/* Title */}
                    <div className={`py-12 ${getBgClass(isDark)}`}>
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h3 className="text-4xl sm:text-5xl font-bold">{section.title}</h3>
                        </div>
                    </div>

                    {/* Subtitle */}
                    <div className={`py-6 ${getBgClass(isDark)}`}>
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <p className={`text-lg sm:text-xl max-w-3xl ${getTextClass(isDark)}`}>
                                {section.subtitle || `Key insights and data visualization for ${section.title.toLowerCase()}`}
                            </p>
                        </div>
                    </div>

                    {/* Conditional Rendering */}
                    {section.visualization && <VisualizationSection section={section} />}
                    {section.description && <DescriptionSection section={section} />}
                    {section.sourceData && (
                        <SourceDataSection
                            section={section}
                            dataSources={sources}
                            onScrollToSource={onScrollToSource}
                        />
                    )}
                </section>
            ))}
        </>
    );
}

export default Sections;
