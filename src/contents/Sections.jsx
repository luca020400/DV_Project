import { useState, useEffect, useMemo } from "react";

import { useTheme } from '../contexts/ThemeContext';
import { useVisualizationData } from "../contexts/DataProviderContext";
import componentDataKeyMapper from "../util/ComponentDataKeyMapper";
import { getBgClass, getTextClass } from './themeUtils';
import LinePlot from '../d3/LinePlot';
import ScatterPlot from '../d3/ScatterPlot';

// Render visualization based on component name
function DynamicVisualization({ componentName, data, isMobile }) {
    switch (componentName) {
        case 'CasualtyTrendChart':
        case 'RegionalConflictMap':
        case 'EconomicIndicators':
        case 'TimelineChart':
            return <LinePlot data={data} isMobile={isMobile} />;
        case 'DisplacementChart':
            return <ScatterPlot data={data} isMobile={isMobile} />;
        default:
            return null;
    }
}

// Description Section
function DescriptionSection({ section }) {
    const { isDark } = useTheme();

    return (
        <div className={`py-8 ${getBgClass(isDark)}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`space-y-4 text-base sm:text-lg leading-relaxed ${getTextClass(isDark)}`}>
                    {section.description.map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
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
            className={`w-full h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:border-opacity-75 ${isDark ? 'border-gray-600 bg-gray-700 hover:bg-gray-650' : 'border-gray-300 bg-gray-100 hover:bg-gray-150'}`}
            onClick={onOpen}
        >
            <p className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                📊 Interactive Chart
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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

                {/* Desktop: Show full chart */}
                <div className="hidden lg:flex lg:w-full h-[600px] items-center justify-center">
                    <div className={`w-full mx-4 sm:mx-auto sm:max-w-7xl h-full rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'}`}>
                        <div className="h-full flex items-center justify-center">
                            {isLoading ? (
                                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading...</p>
                            ) : (
                                <DynamicVisualization componentName={section.visualization.component} data={data} isMobile={false} />
                            )}
                        </div>
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

    return (
        <div className={`py-8 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h4 className="text-xl font-semibold mb-4">Data Sources for this Section</h4>
                <div className="flex flex-wrap gap-3">
                    {sourceButtons.map((source) => (
                        <button
                            key={source.id}
                            onClick={() => onScrollToSource(source.id)}
                            className={`px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDark
                                ? 'bg-gray-800 border-gray-700 text-blue-400 hover:bg-gray-700 hover:border-blue-500'
                                : 'bg-gray-50 border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300'
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
            {sections.map((section) => (
                <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-20"
                >
                    {/* Title */}
                    <div className={`py-8 ${getBgClass(isDark)}`}>
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h3 className="text-3xl sm:text-4xl font-bold">{section.title}</h3>
                        </div>
                    </div>

                    {/* Subtitle */}
                    <div className={`py-4 ${getBgClass(isDark)}`}>
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <p className={`text-lg ${getTextClass(isDark)}`}>
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
