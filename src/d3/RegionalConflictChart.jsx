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
                <g className="opacity-60">
                    {neighborsGeoJson.features.map((feature, i) => {
                        const pathData = pathGenerator(feature);
                        return pathData ? (
                            <path
                                key={`neighbor-${i}`}
                                d={pathData}
                                className="fill-slate-300 dark:fill-slate-800 stroke-slate-400 dark:stroke-slate-700 transition-colors duration-300"
                                strokeWidth={0.5}
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
    displayYear,
    periodIndex,
    progressPercent,
    sliderLabels,
    onReset,
    onPrev,
    onNext,
    onPlayPause,
    onSliderChange,
    aggregation,
    onAggregationChange,
    isMobile = false,
}) => {
    return (
        <div className="px-4 md:px-6 py-4 rounded-xl shadow-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors duration-300">
            <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row items-center gap-6'}`}>

                {/* Playback Controls */}
                <div className={`flex items-center gap-2 shrink-0 ${isMobile ? 'justify-center' : ''}`}>
                    <button onClick={onReset} className="p-2 rounded-lg transition-colors bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 group" title="Reset" aria-label="Reset timeline">
                        <RotateCcw size={18} className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" />
                    </button>

                    <button onClick={onPrev} disabled={currentIndex === 0} className={`p-2 rounded-lg transition-colors ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600'}`} aria-label="Previous time period">
                        <ChevronLeft size={20} className="text-gray-900 dark:text-gray-100" />
                    </button>

                    <button
                        onClick={onPlayPause}
                        disabled={timeSeriesData.length === 0 || (currentIndex === timeSeriesData.length - 1 && !isPlaying)}
                        className={`p-2 rounded-lg transition-colors border-2 ${timeSeriesData.length === 0 || (currentIndex === timeSeriesData.length - 1 && !isPlaying)
                            ? 'opacity-50 cursor-not-allowed bg-slate-800 border-slate-600'
                            : isPlaying
                                ? 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-900/20 border-transparent'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-900/20 border-transparent'
                            }`}
                        aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
                    >
                        <span className="text-white">
                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                        </span>
                    </button>

                    <button onClick={onNext} disabled={currentIndex === timeSeriesData.length - 1} className={`p-2 rounded-lg transition-colors ${currentIndex === timeSeriesData.length - 1 ? 'opacity-30 cursor-not-allowed' : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600'}`} aria-label="Next time period">
                        <ChevronRight size={20} className="text-gray-900 dark:text-gray-100" />
                    </button>
                </div>

                {/* Timeline Slider */}
                <div className="flex-1 relative h-12 flex items-center group">
                    <div className="absolute w-full h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300 ease-out" style={{ width: `${progressPercent}%` }} />
                    </div>

                    <input type="range" min={0} max={Math.max(0, timeSeriesData.length - 1)} value={currentIndex} onChange={onSliderChange} className="absolute w-full h-full opacity-0 cursor-pointer z-10" aria-label="Timeline slider" />

                    {/* The Handle */}
                    <div className="absolute h-4 w-4 bg-white rounded-full shadow-md border-2 border-blue-500 pointer-events-none transition-all duration-300 ease-out z-0" style={{ left: `calc(${progressPercent}% - 8px)` }} />

                    {/* The Labels Container */}
                    <div className={`absolute top-8 w-full h-6 pointer-events-none ${isMobile ? 'hidden' : ''}`}>
                        {sliderLabels.map((label, i) => (
                            <span
                                key={i}
                                className="absolute text-xs font-mono whitespace-nowrap text-slate-700 dark:text-slate-200 leading-none pt-2"
                                style={{
                                    left: label.left,
                                    transform: 'translateX(-50%)'
                                }}
                            >
                                {label.text}
                            </span>
                        ))}
                    </div>
                </div>

                {/* The Context Area */}
                <div className={`flex ${isMobile ? 'flex-row justify-between w-full' : 'flex-col items-end'} justify-center min-w-[160px] shrink-0 gap-3`}>
                    { /* Year & Visualizer */}
                    <div className={`flex flex-col ${isMobile ? 'items-start' : 'items-end'} w-full gap-1`}>
                        <div className="text-2xl font-mono font-bold text-slate-800 dark:text-slate-200 leading-none">
                            {displayYear}
                        </div>

                        <div className={`${isMobile ? 'w-32' : 'w-full'} h-6 mt-1`}>
                            {aggregation === 'yearly' ? (
                                <div className="w-full h-full rounded bg-amber-200 border border-amber-300 flex items-center justify-center shadow-sm">
                                    <span className="text-[10px] font-bold text-amber-900 tracking-wider">FULL YEAR</span>
                                </div>
                            ) : (
                                <div className="w-full h-full flex gap-1">
                                    <div className={`flex-1 flex items-center justify-center rounded border shadow-sm transition-all duration-300 ${periodIndex === 0
                                        ? 'bg-amber-200 border-amber-300'
                                        : 'bg-slate-200 dark:bg-slate-600 border-slate-300 dark:border-slate-600'
                                        }`}>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${periodIndex === 0 ? 'text-amber-900' : 'text-slate-500 dark:text-slate-400'
                                            }`}>Jan - Jun</span>
                                    </div>

                                    <div className={`flex-1 flex items-center justify-center rounded border shadow-sm transition-all duration-300 ${periodIndex === 1
                                        ? 'bg-amber-200 border-amber-300'
                                        : 'bg-slate-200 dark:bg-slate-600 border-slate-300 dark:border-slate-600'
                                        }`}>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${periodIndex === 1 ? 'text-amber-900' : 'text-slate-500 dark:text-slate-400'
                                            }`}>Jul - Dec</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Segmented Control */}
                    <div className={`grid grid-cols-2 p-1 ${isMobile ? 'w-64' : 'w-full'} bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700`}>
                        {AGGREGATION_OPTIONS.map((option) => {
                            const isActive = aggregation === option.value;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => onAggregationChange(option.value)}
                                    className={`
                                        text-[10px] uppercase font-bold tracking-wider py-1.5 rounded-md transition-all duration-200
                                        ${isActive
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                        }
                                    `}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>

                </div>

            </div>
        </div>
    );
});

// Aggregation Options
const AGGREGATION_OPTIONS = [
    { value: 'yearly', label: 'Yearly', months: 12 },
    { value: '6months', label: 'Semesters', months: 6 },
];

function RegionalConflictChart({
    dataObj,
    width = 800,
    height = 600,
    isMobile = false,
}) {
    const { isDark } = useTheme();

    // State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [tooltipContent, setTooltipContent] = useState(null);
    const [aggregation, setAggregation] = useState('yearly');

    const animationRef = useRef();
    const tooltipRef = useRef();

    // Data Processing
    const { data, geoJson } = dataObj || {};
    const { timeSeriesData, maxVal } = useMemo(() => {
        if (!data || data.length === 0) return { timeSeriesData: [], maxVal: 0 };

        const aggOption = AGGREGATION_OPTIONS.find(o => o.value === aggregation);
        const periodMonths = aggOption?.months || 12;

        const getPeriodKey = (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = d.getMonth();
            if (periodMonths === 12) return `${year}`;
            const periodIndex = Math.floor(month / periodMonths);
            return `${year}-P${periodIndex}`;
        };

        const groups = d3.group(data, d => getPeriodKey(d.date));
        const years = data.map(d => new Date(d.date).getFullYear());
        const minYear = d3.min(years);
        const maxYear = d3.max(years);

        const allPeriods = [];
        for (let year = minYear; year <= maxYear; year++) {
            const periodsPerYear = 12 / periodMonths;
            for (let p = 0; p < periodsPerYear; p++) {
                const key = periodMonths === 12 ? `${year}` : `${year}-P${p}`;
                allPeriods.push({ key, year, periodIndex: p });
            }
        }

        let globalMax = 0;
        const series = allPeriods.map(({ key, year, periodIndex }) => {
            const periodEvents = groups.get(key) || [];
            let regionMap = {};

            if (periodEvents.length > 0) {
                const regionCounts = d3.rollups(periodEvents, v => v.length, d => d.region);
                regionMap = Object.fromEntries(regionCounts);
                const periodMax = d3.max(regionCounts, d => d[1]);
                if (periodMax > globalMax) globalMax = periodMax;
            }

            const startMonth = periodIndex * periodMonths;

            return {
                date: new Date(year, startMonth, 1),
                year: year,
                periodIndex: periodIndex,
                regions: regionMap
            };
        });

        return { timeSeriesData: series, maxVal: globalMax };
    }, [data, aggregation]);

    // Visual
    const colorScale = useMemo(() => {
        const interpolator = d3.interpolateReds;
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

    // Reset animation state when aggregation mode changes
    useEffect(() => {
        queueMicrotask(() => {
            setCurrentIndex(0);
            setIsPlaying(false);
        });
    }, [aggregation]);

    // Event Handlers
    const handleRegionEnter = useCallback((name, value) => setTooltipContent({ name, value }), []);
    const handleRegionLeave = useCallback(() => setTooltipContent(null), []);

    const handleMouseMove = useCallback((e) => {
        if (tooltipRef.current) {
            const x = e.nativeEvent.offsetX + 20;
            const y = e.nativeEvent.offsetY - 20;
            tooltipRef.current.style.transform = `translate(${x}px, ${y}px)`;
        }
    }, []);

    const handleSliderChange = useCallback((e) => {
        const val = parseInt(e.target.value);
        setCurrentIndex(val);
        if (val === timeSeriesData.length - 1) setIsPlaying(false);
    }, [timeSeriesData.length]);

    const handlePrev = useCallback(() => setCurrentIndex(curr => Math.max(0, curr - 1)), []);
    const handleNext = useCallback(() => setCurrentIndex(curr => Math.min(timeSeriesData.length - 1, curr + 1)), [timeSeriesData.length]);
    const handleReset = useCallback(() => { setIsPlaying(false); setCurrentIndex(0); }, []);
    const handlePlayPause = useCallback(() => setIsPlaying(p => !p), []);
    const handleAggregationChange = useCallback((value) => setAggregation(value), []);

    const currentDataSlice = timeSeriesData[currentIndex];
    const progressPercent = timeSeriesData.length > 1 ? (currentIndex / (timeSeriesData.length - 1)) * 100 : 0;

    const sliderLabels = useMemo(() => {
        const count = timeSeriesData.length;
        if (count === 0) return [];

        const yearIndices = [];
        let lastYear = null;
        timeSeriesData.forEach((item, index) => {
            if (item.year !== lastYear) {
                yearIndices.push({ year: item.year, index });
                lastYear = item.year;
            }
        });

        return yearIndices.map(({ year, index }) => {
            const percent = count > 1 ? (index / (count - 1)) * 100 : 0;
            return { text: `${year}`, left: `${percent}%` };
        });
    }, [timeSeriesData]);

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-4 md:gap-6 py-4 md:py-8">

            {/* Map Area */}
            <div className={`relative w-full ${isMobile ? 'h-[550px]' : 'h-[650px]'} flex justify-center overflow-hidden rounded-2xl shadow-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900`}>
                <MapLayer
                    width={width}
                    height={isMobile ? 550 : height}
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

                {/* Tooltip */}
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
                <div className={`absolute right-4 ${isMobile ? 'bottom-4' : 'top-4'} flex flex-col gap-2 p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-gray-300 dark:border-slate-700 text-xs shadow-sm pointer-events-none z-10`}>
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

            {/* Controls */}
            <Controls
                currentIndex={currentIndex}
                isPlaying={isPlaying}
                timeSeriesData={timeSeriesData}
                displayYear={currentDataSlice?.year || ''}
                periodIndex={currentDataSlice?.periodIndex || 0}
                progressPercent={progressPercent}
                sliderLabels={sliderLabels}
                onReset={handleReset}
                onPrev={handlePrev}
                onNext={handleNext}
                onPlayPause={handlePlayPause}
                onSliderChange={handleSliderChange}
                aggregation={aggregation}
                onAggregationChange={handleAggregationChange}
                isDark={isDark}
                isMobile={isMobile}
            />
        </div>
    );
}

export default RegionalConflictChart;