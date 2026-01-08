import { useRef, useEffect, useState, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import * as d3 from 'd3';

const REFUGEE_KEYS = [
    'turkey', 'lebanon', 'jordan', 'germany', 'iraq',
    'europe', 'africa', 'other'
];

const COLOR_PALETTE = {
    idp: '#f97316',
    turkey: '#3b82f6',
    lebanon: '#0ea5e9',
    jordan: '#6366f1',
    germany: '#ec4899',
    iraq: '#8b5cf6',
    europe: '#10b981',
    africa: '#eab308',
    other: '#64748b',
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

function DisplacementChart({
    data,
    width = 1200,
    height = 650,
    marginTop = 40,
    marginRight = 40,
    marginBottom = 50,
    marginLeft = 80,
}) {
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

    const chartWidth = containerSize.width;
    const chartHeight = containerSize.height;
    const innerWidth = chartWidth - marginLeft - marginRight;
    const innerHeight = chartHeight - marginTop - marginBottom;

    // Data Processing
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
        return data.map(d => ({
            ...d,
            date: new Date(d.date),
            turkey: d['türkiye'],
        }));
    }, [data]);

    // Resize Observer
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

    // Scales
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

    // Main Rendering Effect
    useEffect(() => {
        if (chartData.length === 0) return;

        const gChartEl = d3.select(gChart.current);
        const gyEl = d3.select(gy.current);
        const svg = d3.select(svgRef.current);

        gChartEl.selectAll('*').remove();
        const zeroY = yScale(0);

        // Axis Setup
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

        // Interaction
        const bisect = d3.bisector(d => d.date).left;

        // Tooltip functionality
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

        // Background Interaction Rect
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

        // IDP Area (Top)
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

        // Refugees Areas (Bottom Stack)
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

        // Cursor line
        const cursorLine = gChartEl.append('line')
            .attr('stroke', isDark ? '#9ca3af' : '#374151')
            .attr('stroke-width', 1.5)
            .attr('stroke-dasharray', '4,4')
            .style('pointer-events', 'none');

        // Y axes
        gyEl.call(
            d3.axisLeft(yScale).ticks(12).tickFormat(d => Math.abs(d / 1000000) + 'M')
        )
            .selectAll('text').attr('fill', isDark ? '#9ca3af' : '#374151').style('font-size', '12px');

        gyEl.select('.domain').remove();
        gyEl.selectAll('line').remove();

        svg.on('mouseleave', handleMouseLeave);

        // Hide tooltip on scroll
        const handleScroll = () => {
            handleMouseLeave();
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            svg.on('mouseleave', null);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [chartData, xScale, yScale, isDark, chartWidth, chartHeight, hoveredRegion, innerWidth, innerHeight, marginTop, marginBottom, marginLeft, marginRight]);

    return (
        <div className="w-full flex flex-col gap-6 p-6">
            <div
                ref={containerRef}
                className="relative w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-transparent dark:border-slate-700 overflow-hidden"
                style={{ height: height }}
            >
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

                    {/* Static Labels */}
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

                {/* Tooltip */}
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

                            {/* IDP Section */}
                            <div className={`mb-3 transition-opacity duration-200 ${hoveredRegion && hoveredRegion !== 'idp' ? 'opacity-40' : 'opacity-100'}`}>
                                <div className="text-xs uppercase tracking-wider opacity-60 mb-1">Internal</div>
                                <div className="flex justify-between items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLOR_PALETTE.idp }} />
                                        <span className={hoveredRegion === 'idp' ? 'font-bold text-white' : ''}>IDPs</span>
                                    </div>
                                    <span className="font-mono font-bold">{(hoveredData.idp / 1000000).toFixed(2)}M</span>
                                </div>
                            </div>

                            {/* Refugee Section */}
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
                                            <span className="font-mono">{(val / 1000000).toFixed(2)}M</span>
                                        </div>
                                    );
                                })}
                                <div className="border-t border-gray-500/30 mt-1 pt-1 flex justify-between items-center font-bold text-xs">
                                    <span>Total Ext.</span>
                                    <span>{(hoveredData.totalRefugees / 1000000).toFixed(2)}M</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Legend (Interactive) */}
            <div className="flex flex-wrap justify-center gap-6 text-sm select-none">
                <div
                    className={`flex items-center gap-2 cursor-pointer transition-opacity duration-200 ${hoveredRegion && hoveredRegion !== 'idp' ? 'opacity-30' : 'opacity-100'}`}
                    onMouseEnter={() => setHoveredRegion('idp')}
                    onMouseLeave={() => setHoveredRegion(null)}
                >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_PALETTE.idp }}></span>
                    <span className="text-gray-600 dark:text-gray-400">Internally Displaced</span>
                </div>
                {REFUGEE_KEYS.map(key => (
                    <div
                        key={key}
                        className={`flex items-center gap-2 cursor-pointer transition-opacity duration-200 ${hoveredRegion && hoveredRegion !== key ? 'opacity-30' : 'opacity-100'}`}
                        onMouseEnter={() => setHoveredRegion(key)}
                        onMouseLeave={() => setHoveredRegion(null)}
                    >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_PALETTE[key] }}></span>
                        <span className="text-gray-600 dark:text-gray-400">{LABELS[key]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DisplacementChart;