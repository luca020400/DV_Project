import { useRef, useEffect, useState, useMemo, useCallback, memo } from 'react';
import { ChevronRight, ChevronLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

import * as d3 from 'd3';

// Map Layer
const MapLayer = memo(({
    width,
    height,
    geoJson,
    neighborsGeoJson,
    pathGenerator,
    projection,
    currentDataSlice,
    colorScale,
    isDark,
    onRegionEnter,
    onRegionLeave,
    onMouseMove
}) => {
    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            {/* Neighbors */}
            {neighborsGeoJson && neighborsGeoJson.features && (
                <g className="opacity-40">
                    {neighborsGeoJson.features.map((feature, i) => {
                        const pathData = pathGenerator(feature);
                        return pathData ? (
                            <path
                                key={`neighbor-${i}`}
                                d={pathData}
                                fill={isDark ? '#1e293b' : '#f1f5f9'}
                                stroke={isDark ? '#334155' : '#cbd5e1'}
                                strokeWidth={0.5}
                                className="transition-colors duration-300"
                            />
                        ) : null;
                    })}
                </g>
            )}

            {/* Syria Regions */}
            <g>
                {geoJson.features.map((feature, i) => {
                    const regionName = feature.properties.NAME_1 || feature.properties.name;
                    const value = currentDataSlice?.regions?.[regionName] || 0;

                    return (
                        <path
                            key={`path-${i}`}
                            d={pathGenerator(feature)}
                            fill={value > 0 ? colorScale(value) : (isDark ? '#334155' : '#e2e8f0')}
                            stroke={isDark ? '#1e293b' : '#fff'}
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
    onReset,
    onPrev,
    onNext,
    onPlayPause,
    onSliderChange,
    isDark
}) => {
    return (
        <div className="p-6 rounded-xl shadow-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors duration-300">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={onReset} className="p-2 rounded-lg transition-colors bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600">
                            <RotateCcw size={18} className="text-gray-900 dark:text-gray-100" />
                        </button>
                        <div className="w-px h-6 bg-slate-600 mx-1 opacity-50"></div>
                        <button onClick={onPrev} disabled={currentIndex === 0} className={`p-2 rounded-lg transition-colors ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600'}`}>
                            <ChevronLeft size={20} className="text-gray-900 dark:text-gray-100" />
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
                        <button onClick={onNext} disabled={currentIndex === timeSeriesData.length - 1} className={`p-2 rounded-lg transition-colors ${currentIndex === timeSeriesData.length - 1 ? 'opacity-30 cursor-not-allowed' : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600'}`}>
                            <ChevronRight size={20} className="text-gray-900 dark:text-gray-100" />
                        </button>
                    </div>

                    <div className="text-2xl font-mono font-bold text-slate-800 dark:text-slate-200">
                        {currentLabel}
                    </div>
                </div>

                <div className="relative w-full h-8 flex items-center group">
                    <div className="absolute w-full h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700">
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
    dataObj,
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
    const { data, geoJson } = dataObj || {};
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
        const interpolator = isDark ? d3.interpolateYlOrRd : d3.interpolateOranges;
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
        const proj = d3.geoMercator()
            .center([39, 34.85])
            .translate([width / 2, height / 2])
            .scale(5000);
        return proj;
    }, [geoJson, width, height]);

    const pathGenerator = useMemo(() => {
        if (!projection) return null;
        return d3.geoPath().projection(projection);
    }, [projection]);


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
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 py-8">

            {/* Map Area */}
            <div className="relative w-full h-[650px] flex justify-center overflow-hidden rounded-2xl shadow-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                <MapLayer
                    width={width}
                    height={height}
                    geoJson={geoJson}
                    neighborsGeoJson={dataObj?.neighborsGeoJson}
                    pathGenerator={pathGenerator}
                    projection={projection}
                    currentDataSlice={currentDataSlice}
                    colorScale={colorScale}
                    isDark={isDark}
                    onRegionEnter={handleRegionEnter}
                    onRegionLeave={handleRegionLeave}
                    onMouseMove={handleMouseMove}
                />

                {/* React Tooltip */}
                <div
                    ref={tooltipRef}
                    className={`absolute top-0 left-0 pointer-events-none px-4 py-3 rounded-lg shadow-xl text-sm z-20 border bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 transition-opacity duration-150 ${tooltipContent ? 'opacity-100' : 'opacity-0'}`}
                    style={{ willChange: 'transform' }}
                >
                    {tooltipContent && (
                        <>
                            <div className="font-bold text-slate-900 dark:text-white">{tooltipContent.name}</div>
                            <div className="font-mono text-base text-slate-700 dark:text-slate-300">
                                {tooltipContent.value > 0 ? `${tooltipContent.value} Events` : 'No events'}
                            </div>
                        </>
                    )}
                </div>

                {/* Legend */}
                <div className="absolute right-4 top-4 flex flex-col gap-2 p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-gray-300 dark:border-slate-700 text-xs shadow-sm pointer-events-none z-10">
                    <div className="font-bold text-slate-500 uppercase tracking-wider mb-1">Events Scale</div>
                    <div className="flex flex-col gap-2">
                        {legendSteps.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded border border-black/10 shadow-sm" style={{ backgroundColor: step.color }} />
                                <span className="text-slate-700 dark:text-slate-300 font-mono">
                                    {step.value >= 1000 ? `${(step.value / 1000).toFixed(1)}k` : step.value}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="text-xs border-t border-gray-300 dark:border-slate-700 pt-2 mt-2">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded border border-black/10 shadow-sm" style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0' }} />
                            <span className="text-slate-600 dark:text-slate-400">No Data</span>
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