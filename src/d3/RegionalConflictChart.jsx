import { useRef, useEffect, useState, useMemo, useCallback, memo } from 'react';
import { ChevronRight, ChevronLeft, Play, Pause, RotateCcw } from 'lucide-react';
import * as d3 from 'd3';
import { useTheme } from '../contexts/ThemeContext';

import geoJson from '../data/geo/syria.json' with { type: 'json' };

// Map Layer
const MapLayer = memo(({
    width,
    height,
    geoJson,
    pathGenerator,
    currentDataSlice,
    colorScale,
    themeStyles,
    onRegionEnter,
    onRegionLeave,
    onMouseMove
}) => {
    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            <g>
                {geoJson.features.map((feature, i) => {
                    const regionName = feature.properties.NAME_1 || feature.properties.name;
                    const value = currentDataSlice.regions[regionName] || 0;

                    return (
                        <path
                            key={`path-${i}`}
                            d={pathGenerator(feature)}
                            fill={value > 0 ? colorScale(value) : themeStyles.emptyRegion}
                            stroke={themeStyles.stroke}
                            strokeWidth={1}
                            className="transition-colors duration-500 ease-in-out cursor-pointer hover:opacity-80"
                            onMouseEnter={() => onRegionEnter(regionName, value)}
                            onMouseLeave={onRegionLeave}
                            onMouseMove={onMouseMove}
                        />
                    );
                })}
            </g>
        </svg>
    );
});

// Controls Component
const Controls = memo(({
    currentIndex,
    isPlaying,
    timeSeriesData,
    currentLabel,
    progressPercent,
    sliderLabels,
    themeStyles,
    onReset,
    onPrev,
    onNext,
    onPlayPause,
    onSliderChange,
    isDark
}) => {
    return (
        <div className={`p-6 rounded-xl shadow-lg border ${themeStyles.border} ${themeStyles.background} transition-colors duration-300`}>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={onReset} className={`p-2 rounded-lg transition-colors ${themeStyles.controlsBg}`}>
                            <RotateCcw size={18} className={themeStyles.textMain} />
                        </button>
                        <div className="w-px h-6 bg-slate-600 mx-1 opacity-50"></div>
                        <button onClick={onPrev} disabled={currentIndex === 0} className={`p-2 rounded-lg transition-colors ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : themeStyles.controlsBg}`}>
                            <ChevronLeft size={20} className={themeStyles.textMain} />
                        </button>
                        <button
                            onClick={onPlayPause}
                            disabled={timeSeriesData.length === 0 || (currentIndex === timeSeriesData.length - 1 && !isPlaying)}
                            className={`p-2 rounded-lg transition-colors border-2 ${timeSeriesData.length === 0 || (currentIndex === timeSeriesData.length - 1 && !isPlaying)
                                ? 'opacity-50 cursor-not-allowed bg-slate-800 border-slate-600'
                                : isPlaying ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20 border-transparent' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20 border-transparent'
                                }`}
                        >
                            {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
                        </button>
                        <button onClick={onNext} disabled={currentIndex === timeSeriesData.length - 1} className={`p-2 rounded-lg transition-colors ${currentIndex === timeSeriesData.length - 1 ? 'opacity-30 cursor-not-allowed' : themeStyles.controlsBg}`}>
                            <ChevronRight size={20} className={themeStyles.textMain} />
                        </button>
                    </div>

                    <div className={`text-2xl font-mono font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {currentLabel}
                    </div>
                </div>

                <div className="relative w-full h-8 flex items-center group">
                    <div className={`absolute w-full h-2 rounded-full overflow-hidden ${themeStyles.progressBarBg}`}>
                        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300 ease-out" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <input type="range" min={0} max={Math.max(0, timeSeriesData.length - 1)} value={currentIndex} onChange={onSliderChange} className="absolute w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="absolute h-4 w-4 bg-white rounded-full shadow-md border-2 border-blue-500 pointer-events-none transition-all duration-300 ease-out z-0" style={{ left: `calc(${progressPercent}% - 8px)` }} />
                    <div className="absolute top-6 w-full h-6 pointer-events-none">
                        {sliderLabels.map((label, i) => (
                            <span key={i} className="absolute text-xs font-mono opacity-40 whitespace-nowrap" style={{ left: label.left, transform: label.transform }}>{label.text}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
});

function RegionalConflictChart({
    data,
    width = 800,
    height = 600
}) {
    const { isDark } = useTheme();

    // State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [tooltipContent, setTooltipContent] = useState(null);

    const animationRef = useRef();
    const tooltipRef = useRef();

    // Data Processing
    const { timeSeriesData, maxVal } = useMemo(() => {
        if (!data || data.length === 0) return { timeSeriesData: [], maxVal: 0 };

        const groups = d3.group(data, d => d3.timeFormat('%Y')(new Date(d.date)));
        const sortedYears = Array.from(groups.keys()).sort();

        let globalMax = 0;
        const series = sortedYears.map(yearStr => {
            const yearEvents = groups.get(yearStr);
            const regionCounts = d3.rollups(yearEvents, v => v.length, d => d.region);
            const regionMap = Object.fromEntries(regionCounts);
            const yearlyMax = d3.max(regionCounts, d => d[1]);

            if (yearlyMax > globalMax) globalMax = yearlyMax;

            return {
                date: new Date(yearStr + '-01-01'),
                label: yearStr,
                regions: regionMap
            };
        });

        return { timeSeriesData: series, maxVal: globalMax };
    }, [data]);

    // Visual Memoization
    const colorScale = useMemo(() => {
        const interpolator = isDark ? d3.interpolateYlOrRd : d3.interpolatePuRd;
        return d3.scaleSequential(interpolator).domain([0, maxVal]);
    }, [maxVal, isDark]);

    const legendSteps = useMemo(() => {
        if (!maxVal) return [];
        const steps = 5;
        return Array.from({ length: steps }, (_, i) => {
            const value = maxVal * ((steps - 1 - i) / (steps - 1));
            return { value: Math.round(value), color: colorScale(value) };
        });
    }, [maxVal, colorScale]);

    const projection = useMemo(() => {
        if (!geoJson) return null;
        return d3.geoMercator().fitSize([width, height], geoJson);
    }, [geoJson, width, height]);

    const pathGenerator = useMemo(() => {
        if (!projection) return null;
        return d3.geoPath().projection(projection);
    }, [projection]);

    const themeStyles = useMemo(() => ({
        background: isDark ? 'bg-slate-800' : 'bg-white',
        textMain: isDark ? 'text-gray-100' : 'text-gray-900',
        textSub: isDark ? 'text-gray-400' : 'text-gray-600',
        border: isDark ? 'border-slate-700' : 'border-gray-300',
        tooltipBg: isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-900 text-white',
        emptyRegion: isDark ? '#334155' : '#e2e8f0',
        stroke: isDark ? '#1e293b' : '#fff',
        controlsBg: isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300',
        progressBarBg: isDark ? 'bg-slate-700' : 'bg-gray-200',
    }), [isDark]);

    // Animation Logic
    useEffect(() => {
        if (isPlaying) {
            animationRef.current = setInterval(() => {
                setCurrentIndex(prev => {
                    if (prev >= timeSeriesData.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1200);
        } else {
            clearInterval(animationRef.current);
        }
        return () => clearInterval(animationRef.current);
    }, [isPlaying, timeSeriesData.length]);

    useEffect(() => {
        if (timeSeriesData.length > 0 && currentIndex === 0) {
            const index2012 = timeSeriesData.findIndex(d => d.label === '2012');
            if (index2012 !== -1) setCurrentIndex(index2012);
        }
    }, [timeSeriesData]);

    // Handlers
    const handleRegionEnter = useCallback((name, value) => setTooltipContent({ name, value }), []);
    const handleRegionLeave = useCallback(() => setTooltipContent(null), []);

    // Optimized Mouse Move
    const handleMouseMove = useCallback((e) => {
        if (tooltipRef.current) {
            const x = e.nativeEvent.offsetX + 20;
            const y = e.nativeEvent.offsetY - 20;
            tooltipRef.current.style.transform = `translate(${x}px, ${y}px)`;
        }
    }, []);

    // Slider Handlers (Memoized for Controls component)
    const handleSliderChange = useCallback((e) => {
        const val = parseInt(e.target.value);
        setCurrentIndex(val);
        if (val === timeSeriesData.length - 1) setIsPlaying(false);
    }, [timeSeriesData.length]);

    const handlePrev = useCallback(() => setCurrentIndex(curr => Math.max(0, curr - 1)), []);
    const handleNext = useCallback(() => setCurrentIndex(curr => Math.min(timeSeriesData.length - 1, curr + 1)), [timeSeriesData.length]);
    const handleReset = useCallback(() => { setIsPlaying(false); setCurrentIndex(0); }, []);
    const handlePlayPause = useCallback(() => setIsPlaying(p => !p), []);

    // Computed Values
    const currentDataSlice = timeSeriesData[currentIndex];
    const progressPercent = timeSeriesData.length > 1 ? (currentIndex / (timeSeriesData.length - 1)) * 100 : 0;

    const sliderLabels = useMemo(() => {
        const count = timeSeriesData.length;
        if (count === 0) return [];
        return timeSeriesData.map((item, index) => {
            const percent = (index / (count - 1)) * 100;
            let transform = 'translateX(-50%)';
            if (index === 0) transform = 'translateX(0%)';
            if (index === count - 1) transform = 'translateX(-100%)';
            return { text: item.label, left: `${percent}%`, transform };
        });
    }, [timeSeriesData]);

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-8">

            {/* Map Area */}
            <div className="relative w-full aspect-video flex justify-center overflow-hidden">
                <MapLayer
                    width={width}
                    height={height}
                    geoJson={geoJson}
                    pathGenerator={pathGenerator}
                    currentDataSlice={currentDataSlice}
                    colorScale={colorScale}
                    themeStyles={themeStyles}
                    onRegionEnter={handleRegionEnter}
                    onRegionLeave={handleRegionLeave}
                    onMouseMove={handleMouseMove}
                />

                {/* React Tooltip */}
                <div
                    ref={tooltipRef}
                    className={`absolute top-0 left-0 pointer-events-none px-4 py-3 rounded shadow-xl text-sm z-20 border ${themeStyles.tooltipBg} transition-opacity duration-150 ${tooltipContent ? 'opacity-100' : 'opacity-0'}`}
                    style={{ willChange: 'transform' }}
                >
                    {tooltipContent && (
                        <>
                            <div className="font-bold">{tooltipContent.name}</div>
                            <div className="font-mono text-base">
                                {tooltipContent.value > 0 ? `${tooltipContent.value} Events` : 'No events'}
                            </div>
                        </>
                    )}
                </div>

                {/* Legend */}
                <div className={`absolute right-4 top-4 flex flex-col gap-4 p-5 rounded-lg border ${themeStyles.border} ${isDark ? 'bg-slate-900/95' : 'bg-white/95'} backdrop-blur-md shadow-xl min-w-[160px]`}>
                    <div className={`text-sm font-bold uppercase tracking-wider ${themeStyles.textMain}`}>Events Scale</div>
                    <div className="flex flex-col gap-3">
                        {legendSteps.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <div className="w-6 h-6 rounded border border-black/10 shadow-sm" style={{ backgroundColor: step.color }} />
                                <span className={`text-sm font-mono font-medium ${themeStyles.textMain}`}>
                                    {step.value >= 1000 ? `${(step.value / 1000).toFixed(1)}k` : step.value}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className={`text-sm border-t ${themeStyles.border} pt-3 mt-2`}>
                        <div className="flex items-center gap-4">
                            <div className="w-6 h-6 rounded border border-black/10 shadow-sm" style={{ backgroundColor: themeStyles.emptyRegion }} />
                            <span className={themeStyles.textSub}>No Data</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Memoized Controls */}
            <Controls
                currentIndex={currentIndex}
                isPlaying={isPlaying}
                timeSeriesData={timeSeriesData}
                currentLabel={currentDataSlice.label}
                progressPercent={progressPercent}
                sliderLabels={sliderLabels}
                themeStyles={themeStyles}
                onReset={handleReset}
                onPrev={handlePrev}
                onNext={handleNext}
                onPlayPause={handlePlayPause}
                onSliderChange={handleSliderChange}
                isDark={isDark}
            />
        </div>
    );
}

export default RegionalConflictChart;