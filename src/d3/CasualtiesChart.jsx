import { useRef, useEffect, useState, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

import * as d3 from 'd3';

function CasualtiesChart({
    data,
    width = 1200,
    height = 600,
    marginTop = 80,
    marginRight = 40,
    marginBottom = 60,
    marginLeft = 80,
    onZoomChange,
    isMobile = false,
}) {
    const { isDark } = useTheme();

    const svgRef = useRef();
    const containerRef = useRef();
    const tooltipRef = useRef();
    const gx = useRef();
    const gy = useRef();
    const gChart = useRef();
    const [containerSize, setContainerSize] = useState({ width, height });
    const [chartMode, setChartMode] = useState('area');
    const [selectedCasualtyTypes, setSelectedCasualtyTypes] = useState(['Civilian', 'Combatant']);
    const [hoveredPoint, setHoveredPoint] = useState(null);

    const chartWidth = containerSize.width;
    const chartHeight = containerSize.height;
    const innerWidth = chartWidth - marginLeft - marginRight;
    const innerHeight = chartHeight - marginTop - marginBottom;

    // --- Dynamic Styles ---
    const regionColors = useMemo(() => isDark ? {
        Aleppo: '#fbbf24',
        Damascus: '#f43f5e',
        Idlib: '#a78bfa',
        Daraa: '#34d399',
        Homs: '#f472b6',
        Other: '#38bdf8',
    } : {
        Aleppo: '#fbbf24',
        Damascus: '#f87171',
        Idlib: '#a78bfa',
        Daraa: '#34d399',
        Homs: '#f472b6',
        Other: '#60a5fa',
    }, [isDark]);

    const themeStyles = {
        background: isDark ? 'bg-slate-800' : 'bg-white',
        textMain: isDark ? 'text-gray-100' : 'text-gray-900',
        textSub: isDark ? 'text-gray-400' : 'text-gray-600',
        border: isDark ? 'border-slate-700' : 'border-transparent',
        inputBg: isDark ? 'bg-slate-700' : 'bg-white',
        inputBorder: isDark ? 'border-gray-600' : 'border-gray-300',
        accentColor: isDark ? 'bg-orange-500' : 'bg-blue-600',
        axisColor: isDark ? '#9ca3af' : '#374151',
        gridColor: isDark ? '#cbd5e1' : '#e5e7eb',
        tooltipBg: isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-900 text-white',
    };

    // Data Processing
    const processedData = useMemo(() => {
        if (data && data.length > 0) {
            return data.map(d => ({ ...d, date: new Date(d.date) }));
        }
        return [];
    }, [data]);

    const filteredData = useMemo(() => {
        const regions = Object.keys(regionColors);
        return processedData.map(d => {
            const point = { date: d.date, month: d.month };
            regions.forEach(region => {
                point[region] = selectedCasualtyTypes.reduce((sum, type) => {
                    return sum + (d[region]?.[type] || 0);
                }, 0);
            });
            return point;
        });
    }, [processedData, selectedCasualtyTypes, regionColors]);

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
        const [minDate, maxDate] = d3.extent(filteredData, d => d.date);
        const adjustedMinDate = new Date(minDate);
        adjustedMinDate.setMonth(adjustedMinDate.getMonth() - 2);
        return d3.scaleTime([adjustedMinDate, maxDate], [marginLeft, chartWidth - marginRight]);
    }, [filteredData, marginLeft, chartWidth, marginRight]);

    const yScale = useMemo(() => {
        let yMax;
        if (chartMode === 'area') {
            const stackGenerator = d3.stack().keys(Object.keys(regionColors));
            const stackedData = stackGenerator(filteredData);
            yMax = stackedData.length ? d3.max(stackedData[stackedData.length - 1], d => d[1]) : 0;
        } else {
            yMax = d3.max(filteredData, d => Object.keys(regionColors).reduce((sum, region) => sum + (d[region] || 0), 0));
        }
        return d3.scaleLinear([0, yMax * 1.1], [chartHeight - marginBottom, marginTop]);
    }, [filteredData, chartMode, regionColors, chartHeight, marginBottom, marginTop]);

    const events = [
        { date: new Date(2011, 2), label: 'Protests Begin' },
        { date: new Date(2012, 6), label: 'Battle of Aleppo' },
        { date: new Date(2013, 7), label: 'Ghouta Chem. Attack' },
        { date: new Date(2014, 5), label: 'ISIS Caliphate' },
        { date: new Date(2015, 8), label: 'Russian Intervention' },
        { date: new Date(2016, 11), label: 'Fall of Aleppo' },
        { date: new Date(2017, 9), label: 'Raqqa Liberated' },
        { date: new Date(2018, 1), label: 'Eastern Ghouta Battle' },
        { date: new Date(2019, 2), label: 'ISIS Defeat' },
        { date: new Date(2020, 2), label: 'Idlib Ceasefire' },
    ];

    // Axis Rendering Effect
    useEffect(() => {
        const color = themeStyles.axisColor;
        const gxElement = d3.select(gx.current);
        gxElement.call(d3.axisBottom(xScale).ticks(12));
        gxElement.selectAll('text').attr('fill', color).attr('font-size', '12px');
        gxElement.selectAll('line').attr('stroke', color).attr('opacity', 0.3);
        gxElement.selectAll('path').attr('stroke', color).attr('opacity', 0.3);

        const gyElement = d3.select(gy.current);
        gyElement.call(d3.axisLeft(yScale));
        gyElement.selectAll('text').attr('fill', color).attr('font-size', '12px');
        gyElement.selectAll('line').attr('stroke', color).attr('opacity', 0.3);
        gyElement.selectAll('path').attr('stroke', color).attr('opacity', 0.3);
    }, [gx, gy, xScale, yScale, themeStyles.axisColor]);

    // Main Chart Rendering Effect
    useEffect(() => {
        if (!svgRef.current || filteredData.length === 0) return;

        d3.select(tooltipRef.current).style('display', 'none');
        const gChartEl = d3.select(gChart.current);
        gChartEl.selectAll('*').remove();

        // 1. Event Markers with Staggering
        events.forEach((event, index) => {
            const xPos = xScale(event.date);

            // Only render if within visible bounds
            if (xPos >= marginLeft && xPos <= chartWidth - marginRight) {

                // Stagger Logic: Alternate height based on index (even/odd)
                // Even indices stay higher up (marginTop - 45), Odd indices sit lower (marginTop - 15)
                // This creates two "lanes" for text to avoid overlap.
                const isEven = index % 2 === 0;
                const textY = isEven ? marginTop - 45 : marginTop - 15;
                const dateY = textY + 14; // Date sits right below the label

                // Vertical Dashed Line
                gChartEl.append('line')
                    .attr('x1', xPos).attr('x2', xPos)
                    .attr('y1', dateY + 5) // Start line just below the text
                    .attr('y2', chartHeight - marginBottom)
                    .attr('stroke', themeStyles.axisColor)
                    .attr('stroke-width', 1)
                    .attr('stroke-dasharray', '3,3')
                    .attr('opacity', 0.4);

                // Event Label (Title)
                gChartEl.append('text')
                    .attr('x', xPos)
                    .attr('y', textY)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '13px') // Increased font size
                    .attr('font-weight', '600')
                    .attr('fill', isDark ? '#e2e8f0' : '#1f2937') // Lighter text in dark mode
                    .text(event.label);

                // Event Date (Subtitle)
                gChartEl.append('text')
                    .attr('x', xPos)
                    .attr('y', dateY)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '11px') // Smaller date font
                    .attr('fill', themeStyles.axisColor) // Muted color
                    .text(d3.timeFormat("%b %Y")(event.date)); // e.g. "Mar 2011"
            }
        });

        // 2. Data Rendering (Lines or Areas)
        if (chartMode === 'line') {
            Object.entries(regionColors).forEach(([region, color]) => {
                const line = d3.line().x(d => xScale(d.date)).y(d => yScale(d[region]));
                gChartEl.append('path')
                    .datum(filteredData)
                    .attr('fill', 'none')
                    .attr('stroke', color)
                    .attr('stroke-width', 2.5)
                    .attr('opacity', 0.9)
                    .attr('d', line);
            });
        } else {
            const stackGenerator = d3.stack().keys(Object.keys(regionColors));
            const stackedData = stackGenerator(filteredData);
            const area = d3.area()
                .x(d => xScale(d.data.date))
                .y0(d => yScale(d[0]))
                .y1(d => yScale(d[1]));

            gChartEl.selectAll('.area')
                .data(stackedData).enter().append('path')
                .attr('fill', d => regionColors[d.key])
                .attr('opacity', isDark ? 0.8 : 0.7)
                .attr('d', area)
                .on('mouseover', function () { d3.select(this).attr('opacity', 1); })
                .on('mouseleave', function () { d3.select(this).attr('opacity', isDark ? 0.8 : 0.7); });
        }

        // 3. Hover Interaction
        const verticalLine = gChartEl.append('line')
            .attr('stroke', themeStyles.axisColor)
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4,4')
            .style('opacity', 0).style('pointer-events', 'none');

        const bisect = d3.bisector(d => d.date).left;

        gChartEl.append('rect')
            .attr('x', marginLeft).attr('y', marginTop)
            .attr('width', innerWidth).attr('height', innerHeight)
            .attr('fill', 'transparent')
            .on('mousemove', (event) => {
                const [x] = d3.pointer(event);
                const date = xScale.invert(x);
                const i = bisect(filteredData, date);
                const d0 = filteredData[i - 1];
                const d1 = filteredData[i];
                const d = d0 && d1 ? (date - d0.date > d1.date - date ? d1 : d0) : (d1 || d0);
                if (d) {
                    verticalLine
                        .attr('x1', xScale(d.date)).attr('x2', xScale(d.date))
                        .attr('y1', marginTop).attr('y2', chartHeight - marginBottom)
                        .style('opacity', 1);
                    setHoveredPoint({ data: d });

                    const bounds = containerRef.current.getBoundingClientRect();
                    const tooltipX = bounds.left + marginLeft / 2 + x;
                    const tooltipY = bounds.top + marginTop + 10;

                    d3.select(tooltipRef.current)
                        .style('display', 'block')
                        .style('left', tooltipX + 'px')
                        .style('top', tooltipY + 'px');
                }
            })
            .on('mouseleave', () => {
                verticalLine.style('opacity', 0);
                setHoveredPoint(null);
                d3.select(tooltipRef.current).style('display', 'none');
            });

        const svg = d3.select(svgRef.current);
        svg.on('mouseleave', () => {
            verticalLine.style('opacity', 0);
            setHoveredPoint(null);
            d3.select(tooltipRef.current).style('display', 'none');
        });

        if (isMobile) {
            const zoom = d3.zoom().scaleExtent([0.5, 2]).on('zoom', (event) => gChartEl.attr('transform', event.transform));
            svg.call(zoom);
        } else {
            svg.on('.zoom', null);
        }

        return () => svg.on('mouseleave', null);

    }, [filteredData, chartMode, selectedCasualtyTypes, xScale, yScale, chartWidth, chartHeight, regionColors, themeStyles.axisColor, isDark, isMobile]);

    const toggleCasualtyType = (type) => {
        setSelectedCasualtyTypes(prev => prev.includes(type) && prev.length > 1
            ? prev.filter(t => t !== type)
            : [...prev, type].filter((v, i, a) => a.indexOf(v) === i)
        );
    };

    return (
        <div className={`w-full flex flex-col gap-6 p-6`}>
            {/* Controls */}
            <div className={`${themeStyles.background} rounded-xl shadow-lg border ${themeStyles.border} p-5 transition-colors duration-300`}>
                <div className="flex flex-col md:flex-row gap-8 justify-evenly">
                    <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-3 ${themeStyles.textSub}`}>Chart Type</label>
                        <div className={`flex rounded-lg p-1 ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
                            {['line', 'area'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setChartMode(mode)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${chartMode === mode
                                        ? `${themeStyles.accentColor} text-white shadow`
                                        : `${themeStyles.textSub} hover:${themeStyles.textMain}`
                                        }`}
                                >
                                    {mode === 'line' ? 'Line Chart' : 'Stacked Area'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-3 ${themeStyles.textSub}`}>Casualty Type</label>
                        <div className="flex gap-4">
                            {['Civilian', 'Combatant'].map(type => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCasualtyTypes.includes(type)
                                        ? `${themeStyles.accentColor} border-transparent`
                                        : `${themeStyles.inputBorder} ${themeStyles.inputBg}`
                                        }`}>
                                        {selectedCasualtyTypes.includes(type) && (
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedCasualtyTypes.includes(type)}
                                        onChange={() => toggleCasualtyType(type)}
                                    />
                                    <span className={`text-sm transition-colors ${themeStyles.textSub} group-hover:${themeStyles.textMain}`}>{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div
                ref={containerRef}
                className={`flex-1 ${themeStyles.background} rounded-xl shadow-lg border ${themeStyles.border} overflow-hidden relative transition-colors duration-300`}
                style={{ width: '100%', height: '500px' }}
            >
                <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ cursor: 'crosshair' }}
                >
                    <g opacity="0.1">
                        {yScale.ticks(8).map((tick, i) => (
                            <line
                                key={i}
                                x1={marginLeft} x2={chartWidth - marginRight}
                                y1={yScale(tick)} y2={yScale(tick)}
                                stroke={themeStyles.gridColor}
                            />
                        ))}
                    </g>

                    <g ref={gx} transform={`translate(0,${chartHeight - marginBottom})`} />
                    <g ref={gy} transform={`translate(${marginLeft},0)`} />

                    <g ref={gChart} />
                </svg>

                <div
                    ref={tooltipRef}
                    className={`fixed border px-4 py-3 rounded-lg shadow-2xl text-sm pointer-events-none z-50 ${themeStyles.tooltipBg} hidden`}
                >
                    {hoveredPoint && (
                        <div>
                            <div className={`font-bold mb-2 border-b pb-1 ${isDark ? 'border-gray-700' : 'border-gray-600'}`}>{hoveredPoint.data.month}</div>
                            {Object.entries(regionColors).map(([region, color]) => (
                                <div key={region} className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                    <span className="opacity-80 flex-1">{region}</span>
                                    <span className="font-mono font-medium">{hoveredPoint.data[region]?.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-6 justify-center mt-2">
                {Object.entries(regionColors).map(([region, color]) => (
                    <div key={region} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className={`text-sm ${themeStyles.textSub}`}>{region}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CasualtiesChart;