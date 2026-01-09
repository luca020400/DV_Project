import { useRef, useEffect, useState, useMemo, useCallback, memo } from 'react';
import { Play, Pause, RotateCcw, Calendar } from 'lucide-react';
import * as d3 from 'd3';

// Event Types
const TYPES = {
    uprising: { color: '#f97316', label: 'Uprising' },
    conflict: { color: '#ef4444', label: 'Conflict' },
    political: { color: '#8b5cf6', label: 'Political' },
    attack: { color: '#dc2626', label: 'Attack' },
    massacre: { color: '#7c3aed', label: 'Massacre' },
    chemical: { color: '#16a34a', label: 'Chemical' },
    isis: { color: '#991b1b', label: 'ISIS Activity' },
    intervention: { color: '#06b6d4', label: 'Intervention' },
    kurdish: { color: '#f59e0b', label: 'Kurdish / SDF' },
    other: { color: '#64748b', label: 'Other' }
};

// City Labels
const CityLayer = memo(({ projection, isMobile }) => {
    const cities = [
        { name: 'Damascus', lat: 33.5131, lng: 36.2919 },
        { name: 'Aleppo', lat: 36.2000, lng: 37.1600 },
        { name: 'Homs', lat: 34.7308, lng: 36.7094 },
        { name: 'Latakia', lat: 35.5167, lng: 35.7833 },
        { name: 'Hama', lat: 35.1333, lng: 36.7500 },
        { name: 'Ar Raqqah', lat: 35.9500, lng: 39.0100 },
        { name: 'Deir ez-Zor', lat: 35.3333, lng: 40.1500 },
        { name: 'Al Hasakah', lat: 36.5117, lng: 40.7422 },
        { name: 'Qamishli', lat: 37.0500, lng: 41.2200 },
        { name: 'Idlib', lat: 35.9333, lng: 36.6333 },
        { name: "Daraa", lat: 32.6189, lng: 36.1021 },
        { name: 'Al Bukamal', lat: 34.4526, lng: 40.8773 },
        { name: "Palmyra", lat: 34.5693, lng: 38.2201 },
    ];

    const fontSize = isMobile ? '8px' : '10px';
    const radius = isMobile ? 1.5 : 2.5;

    return (
        <g className="pointer-events-none select-none">
            {cities.map(city => {
                const [x, y] = projection([city.lng, city.lat]) || [0, 0];
                return (
                    <g key={city.name} transform={`translate(${x},${y})`}>
                        <circle r={radius} className="fill-slate-800 dark:fill-slate-200" opacity={0.8} />
                        <text
                            y={-6}
                            textAnchor="middle"
                            style={{ fontSize, fontFamily: 'monospace' }}
                            className="fill-slate-700 dark:fill-slate-400 font-bold uppercase tracking-wider shadow-sm"
                        >
                            {city.name}
                        </text>
                    </g>
                );
            })}
        </g>
    );
});

// Main Map
const MapLayer = memo(({
    boundedWidth,
    boundedHeight,
    syriaGeoJson,
    neighborsGeoJson,
    pathGenerator,
    projection,
    currentEvents,
    onEventEnter,
    onEventLeave,
    onMouseMove,
    isMobile
}) => {
    return (
        <svg
            width={boundedWidth}
            height={boundedHeight}
            style={{ overflow: 'visible' }}
            onMouseMove={onMouseMove}
        >
            <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Neighbors */}
            <g className="opacity-60">
                {neighborsGeoJson?.features.map((feature, i) => (
                    <path
                        key={`neighbor-${i}`}
                        d={pathGenerator(feature)}
                        className="fill-slate-300 dark:fill-slate-800 stroke-slate-400 dark:stroke-slate-700"
                        strokeWidth={0.5}
                    />
                ))}
            </g>

            {/* Syria Base */}
            <g>
                {syriaGeoJson?.features.map((feature, i) => (
                    <path
                        key={`syria-${i}`}
                        d={pathGenerator(feature)}
                        className="fill-white dark:fill-slate-700 stroke-slate-300 dark:stroke-slate-500"
                        strokeWidth={1}
                    />
                ))}
            </g>

            {/* Cities */}
            <CityLayer projection={projection} isMobile={isMobile} />

            {/* Events */}
            <g>
                {currentEvents.map((event, i) => {
                    if (!event.lng || !event.lat) return null;
                    const [x, y] = projection([event.lng, event.lat]) || [0, 0];
                    const isNew = event.isNew;

                    // Sizes
                    const pulseSize = isMobile ? 12 : 24;
                    const markerSize = isNew ? (isMobile ? 5 : 8) : (isMobile ? 3 : 4);
                    // Colors
                    const typeInfo = TYPES[event.type] || TYPES.other;
                    const color = typeInfo.color;

                    return (
                        <g
                            key={`evt-${event.date}-${i}`}
                            transform={`translate(${x},${y})`}
                            className="cursor-pointer group"
                            onMouseEnter={() => onEventEnter(event)}
                            onMouseLeave={onEventLeave}
                        >
                            {isNew && (
                                <circle r={pulseSize} fill={color} opacity={0.4} className="animate-ping" />
                            )}
                            <circle
                                r={markerSize}
                                fill={color}
                                stroke="white"
                                strokeWidth={1}
                                className={`transition-all duration-500 ${isNew ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                                filter={isNew ? "url(#glow)" : ""}
                            />
                        </g>
                    );
                })}
            </g>
        </svg>
    );
});

// Sidebar
const Sidebar = memo(({
    timelineData,
    currentIndex,
    onEventClick,
    shouldAutoScroll,
    isMobile,
    isPlaying,
    onPlayPause,
    onReset,
}) => {
    const listRef = useRef(null);
    const itemRefs = useRef([]);

    useEffect(() => {
        if (shouldAutoScroll && listRef.current && itemRefs.current[currentIndex]) {
            const container = listRef.current;
            const item = itemRefs.current[currentIndex];

            const itemTop = item.offsetTop;
            const itemHeight = item.offsetHeight;
            const containerHeight = container.offsetHeight;
            const targetScrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);

            container.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });
        }
    }, [currentIndex, shouldAutoScroll]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-gray-300 dark:border-slate-800">
            {/* Header */}
            <div className="p-4 shrink-0 bg-gray-100 dark:bg-slate-900/95 backdrop-blur z-10 border-b border-gray-300 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                        <Calendar size={18} /> Event Log
                    </h3>
                    {isMobile && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onReset}
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                                title="Reset"
                            >
                                <RotateCcw size={16} />
                            </button>
                            <button
                                onClick={onPlayPause}
                                className={`p-2.5 rounded-full transition-all shadow-md flex items-center justify-center ${isPlaying
                                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                                    }`}
                                title={isPlaying ? "Pause" : "Play"}
                            >
                                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Scrollable List */}
            <div
                ref={listRef}
                className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar scroll-smooth"
            >
                {timelineData.map((item, index) => {
                    const isActive = index === currentIndex;
                    const eventDetail = item.events[item.events.length - 1];

                    return (
                        <button
                            key={`${eventDetail.date}-${index}`}
                            ref={el => itemRefs.current[index] = el}
                            onClick={() => onEventClick(index)}
                            className={`
                                w-full text-left p-4 mb-3 rounded-lg transition-all duration-300 border
                                ${isActive
                                    ? 'bg-blue-50 dark:bg-slate-800 border-blue-500 shadow-md ring-1 ring-blue-500/20 text-slate-900 dark:text-white translate-x-1'
                                    : 'bg-transparent text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 opacity-70 hover:opacity-100'
                                }
                            `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-blue-600 dark:text-blue-500'}`}>
                                    {item.fullDate}
                                </span>
                            </div>
                            <div className={`font-semibold text-base mb-1 line-clamp-2 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                {eventDetail.title}
                            </div>
                            {isActive && (
                                <div className="text-sm leading-snug animate-in fade-in slide-in-from-top-1 duration-300 mt-2 pl-2 border-l-2 text-slate-600 dark:text-slate-400 border-gray-300 dark:border-slate-700">
                                    {eventDetail.description}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

// Controls
const Controls = memo(({
    currentIndex,
    isPlaying,
    timelineData,
    currentEvent,
    progressPercent,
    onReset,
    onPlayPause,
    onSliderChange,
    isMobile,
}) => {
    return (
        <div className={`
            flex flex-col gap-3 rounded-xl shadow-xl border backdrop-blur-md transition-colors
            bg-white/90 dark:bg-slate-900/90 border-gray-300 dark:border-slate-700
            ${isMobile ? 'p-3 w-full' : 'p-4 min-w-[320px] max-w-[420px]'}
        `}>
            {/* Buttons & Date */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onReset}
                        className="p-2 rounded-full hover:bg-gray-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                        title="Reset"
                    >
                        <RotateCcw size={16} />
                    </button>
                    <button
                        onClick={onPlayPause}
                        className={`p-2.5 rounded-full transition-all shadow-md flex items-center justify-center ${isPlaying
                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                            }`}
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                    </button>
                </div>

                <div className="flex flex-col items-end text-right min-w-[100px]">
                    <span className={`text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500`}>
                        Date
                    </span>
                    <span className={`font-mono font-bold text-slate-800 dark:text-white ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                        {currentEvent?.label || "2011"}
                    </span>
                </div>
            </div>

            {/* Slider */}
            <div className="relative w-full h-6 flex items-center group pt-1">
                <div className={`absolute w-full h-1.5 rounded-full overflow-hidden bg-gray-300 dark:bg-slate-800`}>
                    <div
                        className="h-full bg-blue-500 transition-all duration-100 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <input
                    type="range"
                    min={0}
                    max={Math.max(0, timelineData.length - 1)}
                    value={currentIndex}
                    onChange={onSliderChange}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                    aria-label="Event timeline slider"
                />
                <div
                    className={`absolute h-4 w-4 bg-white dark:bg-slate-200 rounded-full shadow border-2 border-blue-500 pointer-events-none transition-all duration-100 ease-out z-10 group-hover:scale-110`}
                    style={{ left: `calc(${progressPercent}% - 8px)` }}
                />
            </div>

            {/* Title Preview */}
            <div className="text-xs text-center text-slate-600 dark:text-slate-400 font-medium truncate h-4">
                {currentEvent?.title}
            </div>
        </div>
    );
});

function ConflictEventsChart({
    dataObj,
    width = 1000,
    height = 650,
    marginTop = 20,
    marginRight = 20,
    marginBottom = 20,
    marginLeft = 20,
    isMobile = false,
}) {
    // Dimensions
    const boundedWidth = Math.max(0, width - marginLeft - marginRight);
    const boundedHeight = Math.max(0, height - marginTop - marginBottom);

    // State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [tooltipContent, setTooltipContent] = useState(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const animationRef = useRef();
    const tooltipRef = useRef();

    // Process Data
    const { timelineData } = useMemo(() => {
        const events = dataObj?.events || [];
        const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

        const series = sortedEvents.map((evt, index) => {
            const currentSliceEvents = sortedEvents.slice(0, index + 1).map((e, i) => ({
                ...e,
                isNew: i === index
            }));

            const dateObj = new Date(evt.date);
            const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            const fullDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

            return {
                label,
                fullDate,
                title: evt.title,
                description: evt.description,
                events: currentSliceEvents
            };
        });

        return { timelineData: series };
    }, [dataObj]);

    // Map Configuration
    const projection = useMemo(() => {
        const mapScale = isMobile ? 2500 : 5500;
        const mapCenter = isMobile ? [46, 33] : [38, 35];

        const proj = d3.geoMercator()
            .center(mapCenter)
            .translate([boundedWidth / 2, boundedHeight / 2])
            .scale(mapScale);

        return proj;
    }, [boundedWidth, boundedHeight, isMobile]);

    const pathGenerator = useMemo(() => {
        if (!projection) return null;
        return d3.geoPath().projection(projection);
    }, [projection]);

    // Animation Loop
    useEffect(() => {
        if (isPlaying) {
            animationRef.current = setInterval(() => {
                setShouldAutoScroll(true);
                setCurrentIndex(prev => {
                    if (prev >= timelineData.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => clearInterval(animationRef.current);
    }, [isPlaying, timelineData.length]);

    // Handlers
    const handleEventEnter = useCallback((event) => {
        const dateObj = new Date(event.date);
        const fullDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        setTooltipContent({
            ...event,
            fullDate
        });
    }, []);

    const handleEventLeave = useCallback(() => setTooltipContent(null), []);

    // Tooltip
    const handleMouseMove = useCallback((e) => {
        if (tooltipRef.current) {
            const tooltipRect = tooltipRef.current.getBoundingClientRect();

            const x = e.nativeEvent.offsetX;
            const y = e.nativeEvent.offsetY;

            let top = y;
            let left = x + 30;

            // Bottom Edge Check
            if (top + tooltipRect.height > boundedHeight) {
                top = y - tooltipRect.height / 2 + 10;
            }

            tooltipRef.current.style.transform = `translate(${left}px, ${top}px)`;
        }
    }, [boundedHeight]);

    const handleSliderChange = (e) => {
        setShouldAutoScroll(true);
        const val = parseInt(e.target.value);
        setCurrentIndex(val);
    };

    const handlePlayPause = () => setIsPlaying(p => !p);
    const handleReset = () => {
        setShouldAutoScroll(true);
        setIsPlaying(false);
        setCurrentIndex(0);
    };

    const handleEventClick = (index) => {
        setShouldAutoScroll(false);
        setCurrentIndex(index);
        setIsPlaying(false);
    };

    const currentSlice = timelineData[currentIndex] || { events: [], label: '...' };
    const progressPercent = timelineData.length > 1 ? (currentIndex / (timelineData.length - 1)) * 100 : 0;

    return (
        <div className="flex flex-col lg:flex-row h-[850px] lg:h-[700px] border rounded-2xl overflow-hidden shadow-xl font-sans mt-8 mb-8 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700">

            {/* Event List */}
            <div className="w-full lg:w-80 h-3/6 lg:h-full shrink-0 order-2 lg:order-1 relative">
                <Sidebar
                    timelineData={timelineData}
                    currentIndex={currentIndex}
                    onEventClick={handleEventClick}
                    shouldAutoScroll={shouldAutoScroll}
                    isMobile={isMobile}
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                    onReset={handleReset}
                />
            </div>

            {/* Map Visualization */}
            <div className="relative flex-1 h-3/5 lg:h-full overflow-hidden order-1 lg:order-2 group bg-gray-50 dark:bg-slate-900">
                <div className="w-full h-full relative">
                    <div style={{
                        transform: `translate(${marginLeft}px, ${marginTop}px)`,
                        width: boundedWidth,
                        height: boundedHeight
                    }}>
                        <MapLayer
                            boundedWidth={boundedWidth}
                            boundedHeight={boundedHeight}
                            syriaGeoJson={dataObj.syriaGeoJson}
                            neighborsGeoJson={dataObj.neighborsGeoJson}
                            pathGenerator={pathGenerator}
                            projection={projection}
                            currentEvents={currentSlice.events}
                            onEventEnter={handleEventEnter}
                            onEventLeave={handleEventLeave}
                            onMouseMove={handleMouseMove}
                            isMobile={isMobile}
                        />
                    </div>

                    {/* Floating Tooltip */}
                    <div
                        ref={tooltipRef}
                        className={`absolute top-0 left-0 pointer-events-none px-4 py-3 rounded-lg shadow-2xl max-w-xs z-50 border transition-opacity duration-200 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 ${tooltipContent ? 'opacity-100' : 'opacity-0'}`}
                    >
                        {tooltipContent && (
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    {tooltipContent.fullDate}
                                </div>
                                <div className="font-bold text-lg leading-tight text-slate-800 dark:text-white mb-2">
                                    {tooltipContent.title}
                                </div>
                                <div className={`text-sm text-slate-600 dark:text-slate-300 leading-snug`}>
                                    {tooltipContent.description}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Legend */}
                    <div className={`absolute left-4 top-4 flex flex-col gap-2 p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-gray-300 dark:border-slate-700 text-xs shadow-sm pointer-events-none z-10 transition-opacity duration-300 ${isMobile ? 'opacity-0' : 'opacity-100'}`}>
                        <div className="font-bold text-slate-500 uppercase tracking-wider mb-1">Event Types</div>
                        {Object.entries(TYPES).map(([id, type]) => (
                            <div key={id} className="flex items-center gap-2">
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: type.color }}
                                ></span>
                                <span className="text-slate-700 dark:text-slate-300">{type.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Controls */}
                    {!isMobile && (
                        <div className="absolute z-20 bottom-6 right-6">
                            <Controls
                                currentIndex={currentIndex}
                                isPlaying={isPlaying}
                                timelineData={timelineData}
                                currentEvent={currentSlice}
                                progressPercent={progressPercent}
                                onReset={handleReset}
                                onPlayPause={handlePlayPause}
                                onSliderChange={handleSliderChange}
                                isMobile={isMobile}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ConflictEventsChart;