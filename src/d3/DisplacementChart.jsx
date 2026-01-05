import { useRef, useEffect, useState, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import * as d3 from 'd3';

function DisplacementChart({
    data,
    width = 1200,
    height = 650,
    marginTop = 40,
    marginRight = 40,
    marginBottom = 50,
    marginLeft = 80,
    isMobile = false,
}) {
    const { isDark } = useTheme();

    // Refs
    const svgRef = useRef();
    const containerRef = useRef();
    const tooltipRef = useRef();
    const gx = useRef();
    const gy = useRef();
    const gChart = useRef();

    // State
    const [containerSize, setContainerSize] = useState({ width, height });
    const [hoveredData, setHoveredData] = useState(null);

    const chartWidth = containerSize.width;
    const chartHeight = containerSize.height;
    const innerWidth = chartWidth - marginLeft - marginRight;
    const innerHeight = chartHeight - marginTop - marginBottom;

    // Order of keys for the stack (bottom to top in the negative section)
    const refugeeKeys = [
        'turkey', 'lebanon', 'jordan', 'germany', 'iraq',
        'europe', 'africa', 'asia', 'americas', 'oceania', 'other'
    ];

    // Extended Palette
    const colorPalette = {
        idp: '#f97316',      // Orange (Internal)
        turkey: '#3b82f6',   // Blue
        lebanon: '#0ea5e9',  // Sky
        jordan: '#6366f1',   // Indigo
        germany: '#ec4899',  // Pink
        iraq: '#8b5cf6',     // Violet
        europe: '#10b981',   // Emerald
        africa: '#eab308',   // Yellow
        asia: '#f59e0b',     // Amber
        americas: '#f43f5e', // Rose
        oceania: '#06b6d4',  // Cyan
        other: '#64748b',    // Slate
    };

    const labels = {
        idp: 'Internally Displaced',
        turkey: 'Turkey',
        lebanon: 'Lebanon',
        jordan: 'Jordan',
        germany: 'Germany',
        iraq: 'Iraq',
        europe: 'Europe',
        africa: 'Africa',
        asia: 'Asia',
        americas: 'Americas',
        oceania: 'Oceania',
        other: 'Other'
    };

    // Data Processing
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        return data.map(d => ({
            ...d,
            date: new Date(d.date),
            turkey: d['türkiye'] || d.turkey || 0,
        }));
    }, [data]);

    // Visual Styles
    const themeStyles = {
        background: isDark ? 'bg-slate-800' : 'bg-white',
        textMain: isDark ? 'text-gray-100' : 'text-gray-900',
        textSub: isDark ? 'text-gray-400' : 'text-gray-600',
        border: isDark ? 'border-slate-700' : 'border-transparent',
        axisColor: isDark ? '#9ca3af' : '#374151',
        gridColor: isDark ? '#334155' : '#e2e8f0',
        tooltipBg: isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-900 text-white',
        zeroLine: isDark ? '#fff' : '#000',
    };

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

        // Visually shrinks the chart areas.
        return d3.scaleLinear()
            .domain([-maxRefugees * 1.33, maxIDP * 1.33])
            .range([chartHeight - marginBottom, marginTop]);
    }, [chartData, chartHeight, marginBottom, marginTop]);

    // Main Rendering Effect
    useEffect(() => {
        if (chartData.length === 0) return;

        const gChartEl = d3.select(gChart.current);
        const gxEl = d3.select(gx.current);
        const gyEl = d3.select(gy.current);
        const svg = d3.select(svgRef.current);

        // Cleanup
        gChartEl.selectAll('*').remove();

        const zeroY = yScale(0);

        // Grid Lines
        const yTicks = yScale.ticks(8);
        gChartEl.append('g')
            .selectAll('line')
            .data(yTicks)
            .enter().append('line')
            .attr('x1', marginLeft).attr('x2', chartWidth - marginRight)
            .attr('y1', d => yScale(d)).attr('y2', d => yScale(d))
            .attr('stroke', themeStyles.gridColor)
            .attr('stroke-dasharray', '3,3')
            .attr('opacity', 0.5);

        // Zero Line (The Horizon)
        gChartEl.append('line')
            .attr('x1', marginLeft).attr('x2', chartWidth - marginRight)
            .attr('y1', zeroY).attr('y2', zeroY)
            .attr('stroke', themeStyles.zeroLine)
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.8);

        // Draw IDPs (Positive Y - Going UP)
        const areaIDP = d3.area()
            .x(d => xScale(d.date))
            .y0(zeroY)
            .y1(d => yScale(d.idp))
            .curve(d3.curveMonotoneX);

        gChartEl.append('path')
            .datum(chartData)
            .attr('fill', colorPalette.idp)
            .attr('opacity', 0.8)
            .attr('d', areaIDP);

        // Draw Refugees (Negative Y - Going DOWN)
        const stack = d3.stack().keys(refugeeKeys);
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
            .attr('fill', d => colorPalette[d.key])
            .attr('opacity', 0.9)
            .attr('d', areaRefugees)
            .attr('stroke', isDark ? '#1e293b' : '#fff')
            .attr('stroke-width', 0.5);

        // Interaction Setup
        const bisect = d3.bisector(d => d.date).left;

        // Vertical Hover Line
        const cursorLine = gChartEl.append('line')
            .attr('stroke', themeStyles.axisColor)
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4,4')
            .style('opacity', 0)
            .style('pointer-events', 'none');

        // Mouse Leave Handler
        const handleMouseLeave = () => {
            setHoveredData(null);
            cursorLine.style('opacity', 0);
            d3.select(tooltipRef.current).style('display', 'none');
        };

        // Interaction Overlay
        gChartEl.append('rect')
            .attr('x', marginLeft).attr('y', marginTop)
            .attr('width', innerWidth).attr('height', innerHeight)
            .attr('fill', 'transparent')
            .style('cursor', 'crosshair')
            .on('mousemove', (event) => {
                const [x] = d3.pointer(event, svgRef.current);
                const date = xScale.invert(x);
                const i = bisect(chartData, date);
                const d = chartData[i];

                if (d) {
                    setHoveredData(d);
                    cursorLine
                        .attr('x1', x).attr('x2', x)
                        .attr('y1', marginTop).attr('y2', chartHeight - marginBottom)
                        .style('opacity', 1);

                    const bounds = containerRef.current.getBoundingClientRect();
                    const [relX] = d3.pointer(event, containerRef.current);

                    const tooltipX = bounds.left + relX + 20;
                    const tooltipY = bounds.top + yScale(0);

                    const finalX = relX > innerWidth * 0.6 ? tooltipX - 220 : tooltipX;

                    d3.select(tooltipRef.current)
                        .style('display', 'block')
                        .style('left', finalX + 'px')
                        .style('top', tooltipY + 'px');
                }
            })
            .on('mouseleave', handleMouseLeave);

        // X Axis (Time)
        gxEl.call(
            d3.axisBottom(xScale)
                .ticks(width < 600 ? 5 : 8)
                .tickSizeOuter(0)
                .tickPadding(12)
        )
            .selectAll('text')
            .attr('fill', themeStyles.axisColor)
            .style('font-size', '14px')
            .style('font-weight', '500');

        gxEl.select('.domain').remove();
        gxEl.selectAll('line').attr('stroke', themeStyles.axisColor).attr('opacity', 0.2);

        // Y Axis
        gyEl.call(
            d3.axisLeft(yScale)
                .ticks(12)
                .tickFormat(d => Math.abs(d / 1000000) + 'M')
        )
            .selectAll('text')
            .attr('fill', themeStyles.axisColor)
            .style('font-size', '12px');

        gyEl.select('.domain').remove();
        gyEl.selectAll('line').remove();

        svg.on('mouseleave', handleMouseLeave);
        return () => svg.on('mouseleave', null);

    }, [chartData, xScale, yScale, themeStyles, isDark, chartWidth, chartHeight, innerWidth, innerHeight, width]);


    return (
        <div className="w-full flex flex-col gap-6 p-6">
            <div
                ref={containerRef}
                className={`relative w-full ${themeStyles.background} rounded-xl shadow-lg border ${themeStyles.border} overflow-hidden`}
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

                    <text
                        x={marginLeft + 10} y={marginTop + 20}
                        fill={colorPalette.idp}
                        fontWeight="bold"
                        fontSize="12"
                    >
                        ↑ INTERNAL (IDPs)
                    </text>
                    <text
                        x={marginLeft + 10} y={chartHeight - marginBottom - 20}
                        fill={colorPalette.turkey}
                        fontWeight="bold"
                        fontSize="12"
                    >
                        ↓ EXTERNAL (Refugees)
                    </text>
                </svg>

                {/* Tooltip */}
                <div
                    ref={tooltipRef}
                    className={`fixed z-50 px-4 py-3 rounded-lg shadow-xl border text-sm pointer-events-none hidden ${themeStyles.tooltipBg} ${themeStyles.border}`}
                    style={{ minWidth: '180px', transform: 'translateY(-50%)' }}
                >
                    {hoveredData && (
                        <div>
                            <div className="font-bold border-b pb-2 mb-2 border-gray-500/30 text-center">
                                {d3.timeFormat('%b %Y')(hoveredData.date)}
                            </div>

                            <div className="mb-3">
                                <div className="text-xs uppercase tracking-wider opacity-60 mb-1">Internal</div>
                                <div className="flex justify-between items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorPalette.idp }} />
                                        <span>IDPs</span>
                                    </div>
                                    <span className="font-mono font-bold">{(hoveredData.idp / 1000000).toFixed(2)}M</span>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs uppercase tracking-wider opacity-60 mb-1">External</div>
                                {refugeeKeys.map(key => {
                                    const val = hoveredData[key];
                                    if (!val) return null;
                                    return (
                                        <div key={key} className="flex justify-between items-center gap-4 text-xs mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorPalette[key] }} />
                                                <span className="capitalize">{labels[key]}</span>
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

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorPalette.idp }}></span>
                    <span className={themeStyles.textSub}>Internally Displaced</span>
                </div>
                {refugeeKeys.map(key => (
                    <div key={key} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorPalette[key] }}></span>
                        <span className={themeStyles.textSub}>{labels[key]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DisplacementChart;