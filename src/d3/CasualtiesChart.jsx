import { useRef, useEffect, useState, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

import * as d3 from 'd3';

const REGION_COLORS = {
    Aleppo: '#fbbf24',
    Damascus: '#f43f5e',
    Idlib: '#a78bfa',
    Daraa: '#34d399',
    Homs: '#f472b6',
    Other: '#38bdf8',
};

const EVENTS = [
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

function CasualtiesChart({
    data,
    width = 1200,
    height = 600,
    marginTop = 80,
    marginRight = 40,
    marginBottom = 60,
    marginLeft = 80,
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
    const [casualtyMode, setCasualtyMode] = useState('Aggregate');
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [hoveredRegion, setHoveredRegion] = useState(null);

    const chartWidth = containerSize.width;
    const chartHeight = containerSize.height;
    const innerWidth = chartWidth - marginLeft - marginRight;
    const innerHeight = chartHeight - marginTop - marginBottom;

    // Data Processing
    const processedData = useMemo(() => {
        if (data && data.length > 0) {
            return data.map(d => ({ ...d, date: new Date(d.date) }));
        }
        return [];
    }, [data]);

    const filteredData = useMemo(() => {
        const regions = Object.keys(REGION_COLORS);
        return processedData.map(d => {
            const point = { date: d.date, month: d.month };
            regions.forEach(region => {
                point[region] = selectedCasualtyTypes.reduce((sum, type) => {
                    return sum + (d[region]?.[type] || 0);
                }, 0);
            });
            return point;
        });
    }, [processedData, selectedCasualtyTypes]);

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
            const stackGenerator = d3.stack().keys(Object.keys(REGION_COLORS));
            const stackedData = stackGenerator(filteredData);
            yMax = stackedData.length ? d3.max(stackedData[stackedData.length - 1], d => d[1]) : 0;
        } else {
            yMax = d3.max(filteredData, d => Object.keys(REGION_COLORS).reduce((sum, region) => sum + (d[region] || 0), 0));
        }
        return d3.scaleLinear([0, yMax * 1.1], [chartHeight - marginBottom, marginTop]);
    }, [filteredData, chartMode, chartHeight, marginBottom, marginTop]);


    // Axis Rendering Effect
    useEffect(() => {
        const color = isDark ? '#9ca3af' : '#374151';
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
    }, [gx, gy, xScale, yScale, isDark]);

    // Main Chart Rendering Effect
    useEffect(() => {
        if (!svgRef.current || filteredData.length === 0) return;

        d3.select(tooltipRef.current).style('display', 'none');
        const gChartEl = d3.select(gChart.current);
        gChartEl.selectAll('*').remove();

        // Tooltip Line
        const bisect = d3.bisector(d => d.date).left;

        const handleMouseMove = (event) => {
            const [x] = d3.pointer(event, svgRef.current);
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
                const [relX, relY] = d3.pointer(event, containerRef.current);

                const tooltip = tooltipRef.current;
                const tooltipWidth = tooltip.offsetWidth || 250;
                const tooltipHeight = tooltip.offsetHeight || 150;

                let tooltipX = bounds.left + relX + 15;
                let tooltipY = bounds.top + relY;

                if (tooltipX + tooltipWidth > window.innerWidth - 10) {
                    tooltipX = bounds.left + relX - tooltipWidth - 15;
                }

                const spaceAbove = relY - marginTop;
                const spaceBelow = (chartHeight - marginBottom) - relY;

                if (spaceAbove > tooltipHeight + 20) {
                    tooltipY = bounds.top + relY - tooltipHeight;
                } else if (spaceBelow > tooltipHeight + 20) {
                    tooltipY = bounds.top + relY + 15;
                } else {
                    tooltipY = bounds.top + relY - tooltipHeight;
                }

                d3.select(tooltipRef.current)
                    .style('display', 'block')
                    .style('left', tooltipX + 'px')
                    .style('top', tooltipY + 'px');
            }
        };

        const handleMouseLeave = () => {
            verticalLine.style('opacity', 0);
            setHoveredPoint(null);
            d3.select(tooltipRef.current).style('display', 'none');
        };

        // Drawn first so lines/areas appear on top
        gChartEl.append('rect')
            .attr('x', marginLeft).attr('y', marginTop)
            .attr('width', innerWidth).attr('height', innerHeight)
            .attr('fill', 'transparent')
            .style('cursor', 'crosshair')
            .on('click', () => {
                setHoveredRegion(null);
            })
            .on('mousemove', handleMouseMove)
            .on('mouseleave', handleMouseLeave);

        // Event Markers
        EVENTS.forEach((event, index) => {
            const xPos = xScale(event.date);
            if (xPos >= marginLeft && xPos <= chartWidth - marginRight) {
                const isEven = index % 2 === 0;
                const textY = isEven ? marginTop - 45 : marginTop - 15;
                const dateY = textY + 14;

                gChartEl.append('line')
                    .attr('x1', xPos).attr('x2', xPos)
                    .attr('y1', dateY + 5)
                    .attr('y2', chartHeight - marginBottom)
                    .attr('stroke', isDark ? '#9ca3af' : '#374151')
                    .attr('stroke-width', 1)
                    .attr('stroke-dasharray', '3,3')
                    .attr('opacity', 0.4);

                gChartEl.append('text')
                    .attr('x', xPos)
                    .attr('y', textY)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '13px')
                    .attr('font-weight', '600')
                    .attr('fill', isDark ? '#e2e8f0' : '#1f2937')
                    .text(event.label);

                gChartEl.append('text')
                    .attr('x', xPos)
                    .attr('y', dateY)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '11px')
                    .attr('fill', isDark ? '#9ca3af' : '#374151')
                    .text(d3.timeFormat("%b %Y")(event.date));
            }
        });

        if (chartMode === 'line') {
            Object.entries(REGION_COLORS).forEach(([region, color]) => {
                const line = d3.line().x(d => xScale(d.date)).y(d => yScale(d[region]));

                // Visible Line
                gChartEl.append('path')
                    .datum(filteredData)
                    .attr('class', 'line-path')
                    .attr('fill', 'none')
                    .attr('stroke', color)
                    .attr('stroke-width', 3)
                    .attr('opacity', 0.9)
                    .attr('d', line)
                    .style('cursor', 'pointer')
                    .on('mousemove', handleMouseMove)
                    .on('click', function (event) {
                        event.stopPropagation();
                        console.log('clicked on line:', region);
                        setHoveredRegion(hoveredRegion === region ? null : region);
                    });
            });

            // Opacity Filter for Lines
            if (hoveredRegion) {
                gChartEl.selectAll('.line-path')
                    .attr('opacity', 1);
                gChartEl.selectAll('.line-path')
                    .attr('data-region', null);
            }

            gChartEl.selectAll('.line-path').remove();

            Object.entries(REGION_COLORS).forEach(([region, color]) => {
                const isDimmed = hoveredRegion && hoveredRegion !== region;
                const line = d3.line().x(d => xScale(d.date)).y(d => yScale(d[region]));

                gChartEl.append('path')
                    .datum(filteredData)
                    .attr('fill', 'none')
                    .attr('stroke', 'transparent')
                    .attr('stroke-width', 15)
                    .attr('d', line)
                    .style('cursor', 'pointer')
                    .on('mousemove', handleMouseMove)
                    .on('click', (event) => {
                        event.stopPropagation();
                        setHoveredRegion(hoveredRegion === region ? null : region);
                    });

                gChartEl.append('path')
                    .datum(filteredData)
                    .attr('class', 'line-path')
                    .attr('fill', 'none')
                    .attr('stroke', color)
                    .attr('stroke-width', 2.5)
                    .attr('opacity', isDimmed ? 0.2 : 0.9)
                    .attr('d', line)
                    .style('pointer-events', 'none');
            });
        } else {
            const stackGenerator = d3.stack().keys(Object.keys(REGION_COLORS));
            const stackedData = stackGenerator(filteredData);
            const area = d3.area()
                .x(d => xScale(d.data.date))
                .y0(d => yScale(d[0]))
                .y1(d => yScale(d[1]));

            gChartEl.selectAll('.area')
                .data(stackedData).enter().append('path')
                .attr('class', 'area')
                .attr('fill', d => REGION_COLORS[d.key])
                .attr('opacity', isDark ? 0.8 : 0.7)
                .attr('d', area)
                .style('cursor', 'pointer')
                .on('mousemove', handleMouseMove)
                .on('click', function (event, d) {
                    event.stopPropagation();
                    setHoveredRegion(hoveredRegion === d.key ? null : d.key);
                });

            if (hoveredRegion) {
                gChartEl.selectAll('.area')
                    .attr('opacity', d => hoveredRegion === d.key ? 1 : 0.2);
            }
        }

        // Vertical line
        const verticalLine = gChartEl.append('line')
            .attr('stroke', isDark ? '#9ca3af' : '#374151')
            .attr('stroke-width', 1.5)
            .attr('stroke-dasharray', '4,4')
            .style('opacity', 0)
            .style('pointer-events', 'none');

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

        // Hide tooltip on scroll
        const handleScroll = () => {
            verticalLine.style('opacity', 0);
            setHoveredPoint(null);
            d3.select(tooltipRef.current).style('display', 'none');
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            svg.on('mouseleave', null);
            window.removeEventListener('scroll', handleScroll);
        };

    }, [filteredData, chartMode, selectedCasualtyTypes, xScale, yScale, chartWidth, chartHeight, isDark, isMobile, hoveredRegion, innerWidth, innerHeight, marginTop, marginBottom, marginLeft, marginRight]);

    const toggleCasualtyType = (type) => {
        setSelectedCasualtyTypes(prev => prev.includes(type) && prev.length > 1
            ? prev.filter(t => t !== type)
            : [...prev, type].filter((v, i, a) => a.indexOf(v) === i)
        );
    };

    return (
        <div className={`w-full flex flex-col gap-6 p-6`}>
            {/* Controls */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-transparent dark:border-slate-700 p-5 transition-colors duration-300">
                <div className="flex flex-col md:flex-row gap-8 justify-evenly">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-3 text-gray-700 dark:text-gray-300">Chart Type</label>
                        <div className="flex rounded-lg p-1 bg-gray-100 dark:bg-slate-700">
                            {['line', 'area'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setChartMode(mode)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${chartMode === mode
                                        ? `bg-blue-600 dark:bg-orange-500 text-white shadow`
                                        : `text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white`
                                        }`}
                                >
                                    {mode === 'line' ? 'Line Chart' : 'Stacked Area'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-3 text-gray-700 dark:text-gray-300">Casualty Type</label>
                        <div className="flex gap-4">
                            {['Aggregate', 'Civilian', 'Combatant'].map(type => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="casualtyType"
                                        value={type}
                                        checked={casualtyMode === type}
                                        onChange={() => {
                                            setCasualtyMode(type);
                                            if (type === 'Aggregate') {
                                                setSelectedCasualtyTypes(['Civilian', 'Combatant']);
                                            } else {
                                                setSelectedCasualtyTypes([type]);
                                            }
                                        }}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm transition-colors text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div
                ref={containerRef}
                className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-transparent dark:border-slate-700 overflow-hidden relative transition-colors duration-300"
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
                                stroke={isDark ? '#cbd5e1' : '#e5e7eb'}
                            />
                        ))}
                    </g>

                    <g ref={gx} transform={`translate(0,${chartHeight - marginBottom})`} />
                    <g ref={gy} transform={`translate(${marginLeft},0)`} />

                    <g ref={gChart} />
                </svg>

                <div
                    ref={tooltipRef}
                    className={`fixed border px-4 py-3 rounded-lg shadow-2xl text-sm pointer-events-none z-50 ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-gray-900 text-white'} hidden`}
                    style={{ width: '180px' }}
                >
                    {hoveredPoint && (
                        <div>
                            <div className="font-bold mb-2 border-b pb-1 border-gray-600 dark:border-gray-700">{hoveredPoint.data.month}</div>
                            {Object.entries(REGION_COLORS).map(([region, color]) => (
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
            <div className="flex flex-wrap gap-6 justify-center mt-2 select-none">
                {Object.entries(REGION_COLORS).map(([region, color]) => (
                    <div
                        key={region}
                        className={`flex items-center gap-2 cursor-pointer transition-opacity duration-200 ${hoveredRegion && hoveredRegion !== region ? 'opacity-30' : 'opacity-100'}`}
                        onMouseEnter={() => setHoveredRegion(region)}
                        onMouseLeave={() => setHoveredRegion(null)}
                    >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{region}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CasualtiesChart;