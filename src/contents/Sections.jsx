import { useState, useEffect, useMemo } from "react";

import { useVisualizationData } from "../contexts/DataProviderContext";
import componentDataKeyMapper from "../util/ComponentDataKeyMapper";
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
    return (
        <div className="py-8 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-6 text-lg sm:text-xl leading-relaxed font-light text-gray-700 dark:text-gray-300">
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
    return (
        <div
            className="w-full h-56 rounded-xl border-3 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:border-opacity-100 hover:scale-102 hover:shadow-lg border-gray-300 dark:border-gray-600 bg-gradient-to-br dark:from-gray-700 dark:to-gray-700 from-gray-50 to-gray-100 hover:bg-gray-100 dark:hover:bg-gray-650 hover:border-blue-400 dark:hover:border-blue-500"
            onClick={onOpen}
        >
            <p className="text-2xl font-bold mb-3 text-gray-700 dark:text-gray-200">
                📊 Interactive Chart
            </p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Click here to view fullscreen
            </p>
        </div>
    );
}

function FullscreenChartModal({ isOpen, onClose, data, componentName, isLoading }) {
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
            <div className="relative w-full h-full max-w-6xl rounded-lg bg-white dark:bg-gray-900 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Chart Visualization
                    </h2>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg font-medium transition-colors bg-red-600 hover:bg-red-700 text-white"
                    >
                        × Close
                    </button>
                </div>

                {/* Chart container */}
                <div className="flex-1 overflow-hidden w-full bg-gray-50 dark:bg-gray-800">
                    {isLoading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
                        </div>
                    ) : (
                        <div className="w-full h-full">
                            <DynamicVisualization componentName={componentName} data={data} isMobile={true} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function VisualizationSection({ section }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Determine data key
    const dataKey = componentDataKeyMapper.getDataKey(section.visualization.component);
    const { data, isLoading, error } = useVisualizationData(dataKey);

    if (error) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
                <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100">
                    Error loading visualization data: {error}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="py-8 bg-gray-50 dark:bg-gray-800">
                {/* Mobile: Show placeholder only */}
                <div className="md:hidden w-full px-4 mx-auto">
                    <MobileChartPlaceholder onOpen={() => setIsModalOpen(true)} />
                </div>

                {/* Desktop: Full width background strip */}
                <div className="hidden md:flex md:w-full h-full items-center justify-center bg-gray-50 dark:bg-gray-800">
                    <div className="w-full mx-4 sm:mx-auto sm:max-w-[95rem] h-full">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-600 dark:text-gray-300">Loading...</p>
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
        <div className="py-12 bg-white dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h4 className="text-2xl font-bold">Data Sources for this Section</h4>
                    <button
                        onClick={handleViewAllSources}
                        className="px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 whitespace-nowrap hover:shadow-md text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
                    >
                        View all sources ↓
                    </button>
                </div>
                <div className="flex flex-wrap gap-4">
                    {sourceButtons.map((source) => (
                        <button
                            key={source.id}
                            onClick={() => onScrollToSource(source.id)}
                            className="px-5 py-2.5 rounded-lg border-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 hover:shadow-md bg-white dark:bg-gray-800 border-blue-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
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
                        <div className="h-1 bg-gradient-to-r from-transparent dark:via-gray-700 via-gray-200 to-transparent" />
                    )}

                    {/* Title */}
                    <div className="py-12 bg-gray-50 dark:bg-gray-800">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h3 className="text-4xl sm:text-5xl font-bold">{section.title}</h3>
                        </div>
                    </div>

                    {/* Subtitle */}
                    <div className="py-6 bg-gray-50 dark:bg-gray-800">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <p className="text-lg sm:text-xl max-w-3xl text-gray-700 dark:text-gray-300">
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
