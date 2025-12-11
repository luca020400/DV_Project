import { useState, useEffect, useMemo } from "react";

import { getVisualizationComponent } from "./components/VisualizationRegistry";
import { useVisualizationData } from "./hooks/useVisualizationData";
import componentDataKeyMapper from "./util/ComponentDataKeyMapper";

// Theme utilities
const getBgClass = (isDark) => isDark ? 'bg-gray-800' : 'bg-gray-50';
const getTextClass = (isDark) => isDark ? 'text-gray-300' : 'text-gray-700';
const getCardBgClass = (isDark) => isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200';

// Introduction Section
function IntroductionSection({ isDark, section }) {
    return (
        <div className={`py-8 ${getBgClass(isDark)}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`space-y-4 text-base sm:text-lg leading-relaxed ${getTextClass(isDark)}`}>
                    {section.introduction.map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Mobile placeholder component
function MobileChartPlaceholder({ isDark, onOpen }) {
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

function FullscreenChartModal({ isOpen, onClose, data, isDark, VisualizationComponent, isLoading }) {
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
        e.stopPropagation();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={handleModalClick}>
            <div className={`relative w-full h-full max-w-6xl max-h-screen rounded-lg ${isDark ? 'bg-gray-900' : 'bg-white'} flex flex-col`}>
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
                <div className={`flex-1 overflow-hidden flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    {isLoading ? (
                        <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading...</p>
                    ) : (
                        VisualizationComponent && <VisualizationComponent data={data} isMobile={true} />
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

function VisualizationSection({ isDark, section }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const VisualizationComponent = useMemo(() => {
        return getVisualizationComponent(section.visualization.component);
    }, [section.visualization.component]);

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
                    <MobileChartPlaceholder isDark={isDark} onOpen={() => setIsModalOpen(true)} />
                </div>

                {/* Desktop: Show full chart */}
                <div className="hidden lg:flex lg:w-full lg:h-96 xl:h-[600px] items-center justify-center">
                    <div className={`w-full mx-4 sm:mx-auto sm:max-w-7xl h-full rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'}`}>
                        <div className="h-full flex items-center justify-center">
                            {isLoading ? (
                                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading...</p>
                            ) : (
                                <VisualizationComponent data={data} isMobile={false} />
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
                isDark={isDark}
                VisualizationComponent={VisualizationComponent}
                isLoading={isLoading}
            />
        </>
    );
}

function SourceDataSection({ isDark, section, dataSources, onScrollToSource }) {
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

function DataSources({ isDark, dataSources, flashingId }) {
    return (
        <section className="scroll-mt-20" id="data-sources">
            <div className={`py-12 ${getBgClass(isDark)}`}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Data Sources</h2>
                    <p className={`text-lg mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Our analysis is built on reliable, publicly available data from international organizations and research institutions
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {dataSources.map((source, idx) => (
                            <div
                                key={idx}
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

function Content({ isDark, sections, sources, hero }) {
    const [flashingId, setFlashingId] = useState(null);

    const scrollToSource = (sourceId) => {
        const element = document.getElementById(`source-${sourceId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setFlashingId(sourceId);
            const timer = setTimeout(() => setFlashingId(null), 1800);
            return () => clearTimeout(timer);
        }
    };

    return (
        <>
            {/* Hero Section */}
            <div className={`mb-16 py-16 sm:py-24 ${getBgClass(isDark)}`}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">{hero.title}</h2>
                    <p className={`text-lg ${getTextClass(isDark)}`}>
                        {hero.subtitle}
                    </p>
                </div>
            </div>

            {/* Content Sections */}
            {sections.map((section, idx) => (
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
                    {section.visualization && <VisualizationSection isDark={isDark} section={section} idx={idx} />}
                    {section.introduction && <IntroductionSection isDark={isDark} section={section} />}
                    {section.sourceData && (
                        <SourceDataSection
                            isDark={isDark}
                            section={section}
                            dataSources={sources}
                            onScrollToSource={scrollToSource}
                        />
                    )}
                </section>
            ))}

            {/* Data Sources Section */}
            <DataSources isDark={isDark} dataSources={sources} flashingId={flashingId} />
        </>
    );
}

export default Content;
