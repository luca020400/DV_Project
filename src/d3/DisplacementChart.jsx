import { useRef, useEffect, useState, useMemo, memo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
    BarChart3, Globe, Play, Pause, SkipBack, SkipForward
} from 'lucide-react';
import * as d3 from 'd3';

const REFUGEE_KEYS = [
    'turkey', 'lebanon', 'jordan', 'germany', 'iraq',
    'europe', 'africa', 'other'
];

const TOP_DESTINATIONS = ['turkey', 'lebanon', 'jordan', 'germany', 'iraq'];

const COLOR_PALETTE = {
    idp: '#f43f5e',
    turkey: '#a78bfa',
    lebanon: '#fbbf24',
    jordan: '#34d399',
    germany: '#f472b6',
    iraq: '#38bdf8',
    europe: '#fca5a5',
    africa: '#fdba74',
    other: '#c4b5fd',
};

const LABELS = {
    idp: 'Internally Displaced',
    turkey: 'Turkey',
    lebanon: 'Lebanon',
    jordan: 'Jordan',
    germany: 'Germany',
    iraq: 'Iraq',
    europe: 'Europe',
    africa: 'Africa',
    other: 'Other'
};

const SYRIA_COORDS = [38.9968, 34.8021];
const DESTINATION_COORDS = {
    turkey: [35.2433, 38.9637],
    lebanon: [35.8623, 33.8547],
    jordan: [36.2384, 30.5852],
    germany: [10.4515, 51.1657],
    iraq: [43.6793, 33.2232],
};

// Dynamic Formatter
const formatCount = (num) => {
    if (!num) return '0';
    const absNum = Math.abs(num);
    if (absNum >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    }
    if (absNum >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toLocaleString();
};

const getMaxRefugeeCount = (data) => {
    let max = 0;
    data.forEach(row => {
        TOP_DESTINATIONS.forEach(dest => {
            const key = dest === 'turkey' ? 'türkiye' : dest;
            if (row[key] > max) max = row[key];
        });
    });
    return max;
};

const GlobeMigrationView = memo(({ data, isDark, width = 800, height = 600, worldGeoJson, isMobile = false }) => {
    const svgRef = useRef();
    const [hoveredPath, setHoveredPath] = useState(null);
    const [animationProgress, setAnimationProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Start at end of dataset
    const [currentIndex, setCurrentIndex] = useState(0);

    const animationRef = useRef();
    const timerRef = useRef();

    const maxCount = useMemo(() => getMaxRefugeeCount(data || []), [data]);

    // Increased scale for better visibility
    const radiusScale = useMemo(() => {
        return d3.scaleSqrt()
            .domain([0, maxCount])
            .range([4, 24]);
    }, [maxCount]);

    const currentYearData = useMemo(() => {
        return data[currentIndex];
    }, [data, currentIndex]);

    const prevYearData = useMemo(() => {
        return data[currentIndex - 1];
    }, [data, currentIndex]);

    // Calculate Trends and Totals
    const destData = useMemo(() => {
        const t = {};
        TOP_DESTINATIONS.forEach(key => {
            const dataKey = key === 'turkey' ? 'türkiye' : key;
            const current = currentYearData[dataKey] || 0;
            const prev = prevYearData ? (prevYearData[dataKey] || 0) : current;
            const diff = current - prev;

            t[key] = {
                value: current,
                diff: diff,
                trend: Math.abs(diff) < 100 ? 0 : (diff > 0 ? 1 : -1)
            };
        });
        return t;
    }, [currentYearData, prevYearData]);

    const projection = useMemo(() => {
        return d3.geoOrthographic()
            .scale(Math.min(width, height) * 1.2)
            .center([0, 0])
            .rotate([-SYRIA_COORDS[0], -SYRIA_COORDS[1]])
            .translate([width / 2, height / 2]);
    }, [width, height]);

    const pathGenerator = useMemo(() => {
        return d3.geoPath().projection(projection);
    }, [projection]);

    // Animation Loop
    useEffect(() => {
        let elapsed = 0;
        const animate = () => {
            elapsed += 0.0166;
            setAnimationProgress(elapsed % 1);

            if (isPlaying && elapsed % 1 < 0.0166) {
                setCurrentIndex(prev => {
                    if (prev >= data.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }

            animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationRef.current);
    }, [data.length, isPlaying]);

    const handleScrub = (e) => {
        const val = parseInt(e.target.value, 10);
        setCurrentIndex(val);
        setIsPlaying(false);
    };

    const togglePlay = () => {
        if (currentIndex >= data.length - 1 && !isPlaying) {
            setCurrentIndex(0);
        }
        setIsPlaying(!isPlaying);
    };

    const migrationPaths = useMemo(() => {
        return TOP_DESTINATIONS.map(key => {
            const dest = DESTINATION_COORDS[key];
            const interpolator = d3.geoInterpolate(SYRIA_COORDS, dest);
            const points = [];
            for (let t = 0; t <= 1; t += 0.02) points.push(interpolator(t));

            return {
                key,
                start: SYRIA_COORDS,
                end: dest,
                interpolator,
                lineString: {
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: points }
                }
            };
        });
    }, []);

    const graticule = useMemo(() => d3.geoGraticule()(), []);

    const currentYearLabel = new Date(currentYearData.date).getFullYear();

    const syriaPoint = projection(SYRIA_COORDS);

    return (
        <div className="relative w-full h-full group">
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox={`0 0 ${width} ${height}`}
                className="transition-colors duration-500"
            >
                {/* World */}
                <g className="world-countries">
                    {worldGeoJson.features.map((feature, i) => {
                        return (
                            <path
                                key={`country-${i}`}
                                d={pathGenerator(feature)}
                                fill={isDark ? '#334155' : '#cbd5e1'}
                                stroke={isDark ? '#475569' : '#94a3b8'}
                                strokeWidth={0.5}
                                opacity={0.8}
                                className="transition-colors duration-500"
                            />
                        )
                    })}
                </g>

                {/* Grid */}
                <path
                    d={pathGenerator(graticule)}
                    fill="none"
                    stroke={isDark ? '#232d3b' : '#8e959d'}
                    strokeWidth={0.5}
                    opacity={0.5}
                />

                {/* Connections & Flows */}
                {migrationPaths.map(({ key, lineString, interpolator, end }) => {
                    const pathD = pathGenerator(lineString);
                    const isHovered = hoveredPath === key;

                    const stats = destData[key];
                    const value = stats ? stats.value : 0;
                    const radius = radiusScale(value);
                    const showParticle = value > 0;

                    const currentPoint = interpolator(animationProgress);
                    const projectedPoint = projection(currentPoint);
                    const endProjected = projection(end);

                    const centerPoint = projection.invert([width / 2, height / 2]);
                    const isPathVisible = d3.geoDistance(currentPoint, centerPoint) < Math.PI / 2;
                    const isEndVisible = d3.geoDistance(end, centerPoint) < Math.PI / 2;

                    return (
                        <g key={key}>
                            {/* Static Connection */}
                            {pathD && value > 0 && (
                                <path
                                    d={pathD}
                                    fill="none"
                                    stroke={COLOR_PALETTE[key]}
                                    strokeWidth={isHovered ? 2.5 : 2}
                                    strokeDasharray="3,3"
                                    opacity={isHovered ? 0.8 : 0.4}
                                    className="transition-all duration-300"
                                />
                            )}

                            {/* Active Particle */}
                            {isPathVisible && projectedPoint && showParticle && (
                                <circle
                                    cx={projectedPoint[0]}
                                    cy={projectedPoint[1]}
                                    r={4}
                                    fill={COLOR_PALETTE[key]}
                                    stroke={isDark ? "#1e293b" : "white"}
                                    strokeWidth={1.5}
                                />
                            )}

                            {/* Destination Circle */}
                            {isEndVisible && endProjected && value > 0 && (
                                <g
                                    onMouseEnter={() => setHoveredPath(key)}
                                    onMouseLeave={() => setHoveredPath(null)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <circle
                                        cx={endProjected[0]}
                                        cy={endProjected[1]}
                                        r={isHovered ? radius + 6 : radius + 3}
                                        fill={COLOR_PALETTE[key]}
                                        opacity={isHovered ? 0.3 : 0.2}
                                        className="transition-all duration-500 ease-out"
                                    />
                                    <circle
                                        cx={endProjected[0]}
                                        cy={endProjected[1]}
                                        r={Math.max(3, radius * 0.5)}
                                        fill={COLOR_PALETTE[key]}
                                        stroke={isDark ? "#1e293b" : "white"}
                                        strokeWidth={1.5}
                                        className="transition-all duration-500 ease-out"
                                    />
                                    {isHovered && (
                                        <g transform={`translate(${endProjected[0]}, ${endProjected[1] - radius - 14})`}>
                                            <rect
                                                x="-50" y="-24" width="100" height="36"
                                                rx="6" fill={isDark ? 'black' : 'white'}
                                                opacity="0.9"
                                            />
                                            <text
                                                textAnchor="middle"
                                                dy="-7"
                                                className={`text-sm font-bold ${isDark ? 'fill-white' : 'fill-slate-900'}`}
                                            >
                                                {LABELS[key]}
                                            </text>
                                            <text
                                                textAnchor="middle"
                                                dy="8"
                                                className={`text-[12px] uppercase tracking-wider ${isDark ? 'fill-gray-300' : 'fill-gray-600'}`}
                                            >
                                                {formatCount(value)}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            )}
                        </g>
                    );
                })}

                {/* Syria Marker */}
                <g>
                    <circle cx={syriaPoint[0]} cy={syriaPoint[1]} r={6} fill="#ef4444" stroke={isDark ? '#1e293b' : 'white'} strokeWidth={1.5} />
                </g>
            </svg>

            {/* Timeline Controls */}
            <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-lg p-4 rounded-2xl shadow-xl backdrop-blur-md border transition-colors duration-300 ${isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-white/90 border-gray-200'
                }`}>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={togglePlay}
                                className={`p-2 rounded-full hover:scale-110 transition-transform ${isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                aria-label={isPlaying ? "Pause timeline" : "Play timeline"}
                            >
                                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                            </button>

                            <div>
                                <div className={`text-xs uppercase font-bold tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Timeline
                                </div>
                                <div className={`text-xl font-black font-mono leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {currentYearLabel}
                                </div>
                            </div>
                        </div>

                        <div className={`text-right ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            <span className="text-xs">Total External Refugees</span>
                            <div className="font-mono font-bold text-lg">
                                {formatCount(currentYearData.totalRefugees)}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                            className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                            disabled={currentIndex === 0}
                            aria-label="Go to previous year"
                        >
                            <SkipBack size={16} />
                        </button>

                        <input
                            type="range"
                            min={0}
                            max={data.length - 1}
                            value={currentIndex}
                            onChange={handleScrub}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                            aria-label="Timeline slider"
                        />

                        <button
                            onClick={() => setCurrentIndex(Math.min(data.length - 1, currentIndex + 1))}
                            className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                            aria-label="Go to next year"
                            disabled={currentIndex === data.length - 1}
                        >
                            <SkipForward size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Destination List (Stats) - hidden on mobile */}
            {!isMobile && (
                <div className={`absolute right-4 top-4 p-4 rounded-xl shadow-lg border backdrop-blur-sm transition-colors duration-300 w-52 ${isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-gray-200'
                    }`}>
                    <h3 className={`text-xs font-bold mb-3 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Population Stock ({currentYearLabel})
                    </h3>
                    <div className="space-y-2">
                        {TOP_DESTINATIONS.map(key => {
                            const stats = destData[key];
                            const total = stats ? stats.value : 0;
                            const trend = stats ? stats.trend : 0;
                            const isHovered = hoveredPath === key;
                            const barWidth = (radiusScale(total) / 24) * 100;

                            return (
                                <div
                                    key={key}
                                    className={`group flex flex-col gap-1 p-1.5 rounded-lg cursor-pointer transition-colors duration-200 ${isHovered ? (isDark ? 'bg-slate-800' : 'bg-slate-100') : ''
                                        }`}
                                    onMouseEnter={() => setHoveredPath(key)}
                                    onMouseLeave={() => setHoveredPath(null)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLOR_PALETTE[key] }} />
                                            <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {LABELS[key]}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {trend === 1 && (
                                                <span className="text-[10px] text-green-500 font-bold">↗</span>
                                            )}
                                            {trend === -1 && (
                                                <span className="text-[10px] text-red-500 font-bold">↘</span>
                                            )}
                                            <span className={`text-xs font-mono font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                {formatCount(total)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${barWidth}%`,
                                                backgroundColor: COLOR_PALETTE[key]
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
});

const ViewSwitcher = memo(({ activeView, onViewChange, isDark }) => {
    const views = [
        { id: 'chart', label: 'Chart View', icon: BarChart3 },
        { id: 'globe', label: 'Globe View', icon: Globe },
    ];

    return (
        <div className={`flex items-center gap-2 p-1 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-gray-100'
            }`}>
            {views.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => onViewChange(id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeView === id
                        ? isDark
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white text-blue-700 shadow-md'
                        : isDark
                            ? 'text-gray-300 hover:text-white hover:bg-slate-700'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
                        }`}
                >
                    <Icon size={18} />
                    <span className="hidden sm:inline">{label}</span>
                </button>
            ))}
        </div>
    );
});

function DisplacementChart({
    dataObj,
    width = 1200,
    height = 650,
    marginTop = 40,
    marginRight = 40,
    marginBottom = 50,
    marginLeft = 80,
    isMobile = false,
}) {
    const { data, worldGeoJson } = dataObj || {};
    const { isDark } = useTheme();

    const svgRef = useRef();
    const containerRef = useRef();
    const tooltipRef = useRef();
    const gx = useRef();
    const gy = useRef();
    const gChart = useRef();

    const [containerSize, setContainerSize] = useState({ width, height });
    const [hoveredData, setHoveredData] = useState(null);
    const [hoveredRegion, setHoveredRegion] = useState(null);
    const [activeView, setActiveView] = useState('globe');

    const chartWidth = containerSize.width;
    const chartHeight = containerSize.height;
    const innerWidth = chartWidth - marginLeft - marginRight;
    const innerHeight = chartHeight - marginTop - marginBottom;

    const chartData = useMemo(() => {
        if (!data || !Array.isArray(data) || data.length === 0) return [];
        return data.map(d => ({
            ...d,
            date: new Date(d.date),
            turkey: d['türkiye'],
        }));
    }, [data]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const resizeObserver = new ResizeObserver(() => {
            setContainerSize({
                width: Math.max(400, container.clientWidth),
                height: Math.max(300, container.clientHeight),
            });
        });
        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, []);

    const xScale = useMemo(() => {
        if (chartData.length === 0) return d3.scaleTime();
        const [min, max] = d3.extent(chartData, d => d.date);
        return d3.scaleTime([min, max], [marginLeft, chartWidth - marginRight]);
    }, [chartData, marginLeft, chartWidth, marginRight]);

    const yScale = useMemo(() => {
        if (chartData.length === 0) return d3.scaleLinear();
        const maxIDP = d3.max(chartData, d => d.idp);
        const maxRefugees = d3.max(chartData, d => d.totalRefugees);
        return d3.scaleLinear()
            .domain([-maxRefugees * 1.33, maxIDP * 1.33])
            .range([chartHeight - marginBottom, marginTop]);
    }, [chartData, chartHeight, marginBottom, marginTop]);

    useEffect(() => {
        if (chartData.length === 0) return;

        const gChartEl = d3.select(gChart.current);
        const gyEl = d3.select(gy.current);
        const svg = d3.select(svgRef.current);

        gChartEl.selectAll('*').remove();
        const zeroY = yScale(0);

        const yTicks = yScale.ticks(12);
        gChartEl.append('g')
            .selectAll('line')
            .data(yTicks)
            .enter().append('line')
            .attr('x1', marginLeft).attr('x2', chartWidth - marginRight)
            .attr('y1', d => yScale(d)).attr('y2', d => yScale(d))
            .attr('stroke', isDark ? '#334155' : '#e2e8f0')
            .attr('stroke-dasharray', '3,3')
            .attr('opacity', 0.5);

        gChartEl.append('line')
            .attr('x1', marginLeft).attr('x2', chartWidth - marginRight)
            .attr('y1', zeroY).attr('y2', zeroY)
            .attr('stroke', isDark ? '#fff' : '#000')
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.8);

        const bisect = d3.bisector(d => d.date).left;

        const updateTooltip = (event) => {
            const [x] = d3.pointer(event, svgRef.current);
            const date = xScale.invert(x);
            const i = bisect(chartData, date);
            const d = chartData[i];

            if (d) {
                setHoveredData(d);
                cursorLine
                    .attr('x1', x).attr('x2', x)
                    .attr('y1', marginTop).attr('y2', chartHeight - marginBottom);

                const bounds = containerRef.current.getBoundingClientRect();
                const [relX] = d3.pointer(event, containerRef.current);
                const tooltipX = bounds.left + relX + 20;
                const tooltipY = bounds.top + marginTop + (innerHeight / 2);
                const finalX = relX > innerWidth * 0.6 ? tooltipX - 220 : tooltipX;

                d3.select(tooltipRef.current)
                    .style('display', 'block')
                    .style('left', finalX + 'px')
                    .style('top', tooltipY + 'px');
            }
        };

        const handleMouseLeave = () => {
            setHoveredData(null);
            setHoveredRegion(null);
            d3.select(tooltipRef.current).style('display', 'none');
        };

        gChartEl.append('rect')
            .attr('x', marginLeft).attr('y', marginTop)
            .attr('width', innerWidth).attr('height', innerHeight)
            .attr('fill', 'transparent')
            .style('cursor', 'crosshair')
            .on('mousemove', (event) => {
                updateTooltip(event);
                setHoveredRegion(null);
            })
            .on('mouseleave', handleMouseLeave);

        const areaIDP = d3.area()
            .x(d => xScale(d.date))
            .y0(zeroY)
            .y1(d => yScale(d.idp))
            .curve(d3.curveMonotoneX);

        gChartEl.append('path')
            .datum(chartData)
            .attr('class', 'chart-area')
            .attr('fill', COLOR_PALETTE.idp)
            .attr('d', areaIDP)
            .style('cursor', 'crosshair')
            .style('transition', 'opacity 0.2s ease')
            .attr('opacity', hoveredRegion && hoveredRegion !== 'idp' ? 0.3 : 0.9)
            .on('mouseenter', () => setHoveredRegion('idp'))
            .on('mousemove', updateTooltip);

        const stack = d3.stack().keys(REFUGEE_KEYS);
        const series = stack(chartData);

        const areaRefugees = d3.area()
            .x(d => xScale(d.data.date))
            .y0(d => yScale(-d[0]))
            .y1(d => yScale(-d[1]))
            .curve(d3.curveMonotoneX);

        gChartEl.selectAll('.refugee-layer')
            .data(series)
            .enter().append('path')
            .attr('class', 'refugee-layer')
            .attr('fill', d => COLOR_PALETTE[d.key])
            .attr('d', areaRefugees)
            .style('cursor', 'crosshair')
            .style('transition', 'opacity 0.2s ease')
            .attr('opacity', d => hoveredRegion && hoveredRegion !== d.key ? 0.3 : 0.9)
            .on('mouseenter', (e, d) => setHoveredRegion(d.key))
            .on('mousemove', updateTooltip);

        const cursorLine = gChartEl.append('line')
            .attr('stroke', isDark ? '#9ca3af' : '#374151')
            .attr('stroke-width', 1.5)
            .attr('stroke-dasharray', '4,4')
            .style('pointer-events', 'none');

        // Apply formatter to Y-Axis
        gyEl.call(
            d3.axisLeft(yScale).ticks(12).tickFormat(d => formatCount(d))
        )
            .selectAll('text').attr('fill', isDark ? '#9ca3af' : '#374151').style('font-size', '12px');

        gyEl.select('.domain').remove();
        gyEl.selectAll('line').remove();

        svg.on('mouseleave', handleMouseLeave);

        const handleScroll = () => {
            handleMouseLeave();
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            svg.on('mouseleave', null);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [chartData, xScale, yScale, isDark, chartWidth, chartHeight, hoveredRegion, innerWidth, innerHeight, marginTop, marginBottom, marginLeft, marginRight, activeView]);

    return (
        <div className="w-full flex flex-col gap-6 p-6">
            <div className="flex justify-center">
                <ViewSwitcher
                    activeView={activeView}
                    onViewChange={setActiveView}
                    isDark={isDark}
                />
            </div>

            <div
                ref={containerRef}
                className="relative w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-transparent dark:border-slate-700 overflow-hidden"
                style={{ height: height }}
            >
                {activeView === 'chart' ? (
                    <>
                        <svg
                            ref={svgRef}
                            width="100%"
                            height="100%"
                            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                            preserveAspectRatio="xMidYMid meet"
                        >
                            <g ref={gx} transform={`translate(0,${chartHeight - marginBottom})`} />
                            <g ref={gy} transform={`translate(${marginLeft},0)`} />
                            <g ref={gChart} />

                            <text
                                x={marginLeft + 10} y={marginTop + 20}
                                fill={COLOR_PALETTE.idp}
                                fontWeight="bold"
                                fontSize="12"
                                opacity={hoveredRegion && hoveredRegion !== 'idp' ? 0.3 : 1}
                            >
                                ↑ INTERNAL (IDPs)
                            </text>
                            <text
                                x={marginLeft + 10} y={chartHeight - marginBottom - 20}
                                fill={COLOR_PALETTE.turkey}
                                fontWeight="bold"
                                fontSize="12"
                                opacity={hoveredRegion && hoveredRegion === 'idp' ? 0.3 : 1}
                            >
                                ↓ EXTERNAL (Refugees)
                            </text>
                        </svg>

                        <div
                            ref={tooltipRef}
                            className="fixed z-50 px-4 py-3 rounded-lg shadow-xl border text-sm pointer-events-none hidden bg-gray-900 dark:bg-slate-900 border-slate-600 text-white"
                            style={{ minWidth: '180px', transform: 'translateY(-50%)' }}
                        >
                            {hoveredData && (
                                <div>
                                    <div className="font-bold border-b pb-2 mb-2 border-gray-500/30 text-center">
                                        {d3.timeFormat('%Y')(hoveredData.date)}
                                    </div>

                                    <div className={`mb-3 transition-opacity duration-200 ${hoveredRegion && hoveredRegion !== 'idp' ? 'opacity-40' : 'opacity-100'}`}>
                                        <div className="text-xs uppercase tracking-wider opacity-60 mb-1">Internal</div>
                                        <div className="flex justify-between items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLOR_PALETTE.idp }} />
                                                <span className={hoveredRegion === 'idp' ? 'font-bold text-white' : ''}>IDPs</span>
                                            </div>
                                            <span className="font-mono font-bold">{formatCount(hoveredData.idp)}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs uppercase tracking-wider opacity-60 mb-1">External</div>
                                        {REFUGEE_KEYS.map(key => {
                                            const val = hoveredData[key];
                                            if (!val) return null;

                                            const isDimmed = hoveredRegion && hoveredRegion !== key;
                                            const isActive = hoveredRegion === key;

                                            return (
                                                <div key={key} className={`flex justify-between items-center gap-4 text-xs mb-1 transition-opacity duration-200 ${isDimmed ? 'opacity-40' : 'opacity-100'}`}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLOR_PALETTE[key] }} />
                                                        <span className={`capitalize ${isActive ? 'font-bold text-white scale-105' : ''}`}>{LABELS[key]}</span>
                                                    </div>
                                                    <span className="font-mono">{formatCount(val)}</span>
                                                </div>
                                            );
                                        })}
                                        <div className="border-t border-gray-500/30 mt-1 pt-1 flex justify-between items-center font-bold text-xs">
                                            <span>Total Ext.</span>
                                            <span>{formatCount(hoveredData.totalRefugees)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <GlobeMigrationView
                        data={chartData}
                        isDark={isDark}
                        width={chartWidth}
                        height={chartHeight}
                        worldGeoJson={worldGeoJson}
                        isMobile={isMobile}
                    />
                )}
            </div>

            {activeView === 'chart' && (
                <div className="flex flex-wrap justify-center gap-6 text-sm select-none">
                    <div
                        className={`flex items-center gap-2 cursor-pointer transition-opacity duration-200 ${hoveredRegion && hoveredRegion !== 'idp' ? 'opacity-30' : 'opacity-100'}`}
                        onMouseEnter={() => setHoveredRegion('idp')}
                        onMouseLeave={() => setHoveredRegion(null)}
                    >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_PALETTE.idp }}></span>
                        <span className="text-gray-700 dark:text-gray-300">Internally Displaced</span>
                    </div>
                    {REFUGEE_KEYS.map(key => (
                        <div
                            key={key}
                            className={`flex items-center gap-2 cursor-pointer transition-opacity duration-200 ${hoveredRegion && hoveredRegion !== key ? 'opacity-30' : 'opacity-100'}`}
                            onMouseEnter={() => setHoveredRegion(key)}
                            onMouseLeave={() => setHoveredRegion(null)}
                        >
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_PALETTE[key] }}></span>
                            <span className="text-gray-700 dark:text-gray-300">{LABELS[key]}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DisplacementChart;