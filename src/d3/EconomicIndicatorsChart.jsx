import { useRef, useState, useMemo, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Info, ArrowLeft, Maximize2 } from 'lucide-react';

import * as d3 from 'd3';

const METRICS = [
    {
        key: 'gdp',
        title: 'GDP Output',
        subtitle: 'Billions (USD)',
        description: 'Total economic output measured in billions of US dollars, adjusted for inflation. Indicates the overall size and growth of the economy.',
        color: '#3b82f6',
        type: 'money'
    },
    {
        key: 'inflation',
        title: 'Inflation Rate',
        subtitle: 'Year-over-Year (%)',
        description: 'Year-over-year increase in the general price level of goods and services. Higher rates indicate rapid currency devaluation.',
        note: 'Chart scale may not start at 0%.',
        color: '#ef4444',
        type: 'percent',
        customDomain: [0, 75]
    },
    {
        key: 'currency',
        title: 'Exchange Rate',
        subtitle: 'Syrian Pounds (SYP) / $1 USD',
        description: 'How many Syrian Pounds you need to buy one US Dollar. A rising rate indicates currency weakening.',
        color: '#8b5cf6',
        type: 'number'
    },
    {
        key: 'waterAccess',
        title: 'Water Access',
        subtitle: '% of Population',
        description: 'Percentage of people with reliable access to clean, safe drinking water and sanitation facilities.',
        color: '#06b6d4',
        type: 'percent',
        customDomain: [0, 100]
    },
    {
        key: 'electricity',
        title: 'Power Supply',
        subtitle: 'Average Hours per Day',
        description: 'Average number of hours per day that households have access to reliable electricity from the grid.',
        color: '#eab308',
        type: 'number',
        customDomain: [0, 24]
    },
    {
        key: 'foodInsecurity',
        title: 'Food Insecurity',
        subtitle: '% of Population',
        description: 'Percentage of people who lack reliable access to sufficient, nutritious food for an active and healthy life.',
        color: '#f97316',
        type: 'percent',
        customDomain: [0, 100]
    }
];

const SECTION_INFO = {
    humanitarian: {
        note: 'Data gaps during conflict periods have been filled through careful interpolation and estimation based on available trends.'
    }
};

const SingleChart = ({
    data,
    metric,
    width,
    height,
    isDark,
    isFocused,
    onClick
}) => {
    const [localHoverDate, setLocalHoverDate] = useState(null);
    const svgRef = useRef();

    // Layout Logic
    const margin = isFocused
        ? { top: 0, right: 0, bottom: 28, left: 0 }
        : { top: 8, right: 0, bottom: 20, left: 40 };

    const headerHeight = isFocused ? 50 : 48;

    const chartHeight = Math.max(0, height - headerHeight - margin.bottom - margin.top);
    const chartWidth = Math.max(0, width - margin.left - margin.right);

    // Scales
    const yScale = useMemo(() => {
        if (!data || data.length === 0) return d3.scaleLinear();

        if (metric.customDomain) {
            return d3.scaleLinear()
                .domain(metric.customDomain)
                .range([chartHeight, 0]);
        }

        const validValues = data.map(d => d[metric.key]).filter(v => v != null);
        if (validValues.length === 0) return d3.scaleLinear().range([chartHeight, 0]);

        const min = d3.min(validValues);
        const max = d3.max(validValues);

        return d3.scaleLinear()
            .domain([Math.max(0, min * 0.9), max * 1.1])
            .range([chartHeight, 0]);
    }, [data, metric.key, chartHeight, metric.customDomain]);

    const xScale = useMemo(() => {
        if (!data || data.length === 0) return d3.scaleTime();
        return d3.scaleTime()
            .domain(d3.extent(data, d => d.year))
            .range([0, chartWidth]);
    }, [data, chartWidth]);

    const areaGenerator = useMemo(() => {
        return d3.area()
            .defined(d => d[metric.key] != null)
            .x(d => xScale(d.year))
            .y0(chartHeight)
            .y1(d => yScale(d[metric.key]))
            .curve(d3.curveMonotoneX);
    }, [xScale, yScale, metric.key, chartHeight]);

    const lineGenerator = useMemo(() => {
        return d3.line()
            .defined(d => d[metric.key] != null)
            .x(d => xScale(d.year))
            .y(d => yScale(d[metric.key]))
            .curve(d3.curveMonotoneX);
    }, [xScale, yScale, metric.key]);

    const activeData = useMemo(() => {
        if (!localHoverDate || !data) return null;
        const index = d3.bisector(d => d.year).center(data, localHoverDate);
        const d = data[index];
        if (!d || d[metric.key] == null) return null;

        return {
            x: xScale(d.year),
            y: yScale(d[metric.key]),
            val: d[metric.key],
            year: d.year
        };
    }, [localHoverDate, data, xScale, yScale, metric.key]);

    const xTicks = useMemo(() => {
        if (!data || data.length === 0) return [];
        if (isFocused) {
            return xScale.ticks(width / 120);
        }
        return [data[0].year, data[data.length - 1].year];
    }, [data, isFocused, xScale, width]);

    const yTicks = useMemo(() => {
        if (isFocused) return yScale.ticks(8);
        const domain = yScale.domain();
        return [domain[0], (domain[0] + domain[1]) / 2, domain[1]];
    }, [yScale, isFocused]);

    const formatVal = (val) => {
        if (val == null || isNaN(val)) return 'N/A';
        if (metric.type === 'money') return `$${val.toFixed(1)}B`;
        if (metric.type === 'percent') return `${Math.round(val)}%`;
        if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
        return Math.round(val).toLocaleString();
    };

    const gridColor = isDark ? '#334155' : '#cbd5e1';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    return (
        <div
            className={`relative flex flex-col transition-all duration-300 ease-out ${!isFocused ? 'cursor-zoom-in hover:scale-[1.01]' : ''}`}
            style={{ width, height }}
            onClick={!isFocused ? onClick : undefined}
        >
            <div className={`flex items-center justify-between mb-2 flex-shrink-0 ${isFocused ? 'h-auto' : 'h-[48px]'}`}>
                <div className="pr-4 min-w-0 flex-1">
                    <div className={`font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider truncate ${isFocused ? 'text-2xl mb-2' : 'text-sm mb-1'}`}>
                        {metric.title}
                    </div>

                    <div className={`font-mono transition-colors duration-200 text-gray-600 dark:text-gray-400 ${isFocused ? 'text-lg' : 'text-xs'} flex flex-wrap items-baseline gap-2 min-h-[16px]`}>
                        <span className="truncate">
                            {metric.subtitle}
                        </span>

                        {activeData && (
                            <span className={`text-blue-500 font-bold whitespace-nowrap animate-in fade-in duration-200 ${isFocused ? 'text-xl ml-2' : ''}`}>
                                — {d3.timeFormat('%Y')(activeData.year)}: {formatVal(activeData.val)}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    {!isFocused && <Maximize2 size={16} className="text-gray-600 dark:text-gray-400 opacity-0 group-hover:opacity-50 transition-opacity" />}

                    <div className="group/info relative">
                        <Info size={isFocused ? 20 : 16} className="text-gray-600 dark:text-gray-400 cursor-help opacity-60 hover:opacity-100 transition-opacity" />
                        <div className="absolute right-0 top-8 w-64 p-4 rounded text-sm z-20 opacity-0 group-hover/info:opacity-100 pointer-events-none transition-opacity shadow-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200">
                            <p className="mb-2">{metric.description}</p>
                            {metric.note && <p className="text-xs text-slate-600 dark:text-slate-300">{metric.note}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative flex-grow min-h-0">
                <svg
                    ref={svgRef}
                    width={width}
                    height={chartHeight + margin.top + margin.bottom}
                    className="overflow-visible touch-none block"
                    onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left - margin.left;
                        if (x < 0 || x > chartWidth) return;

                        const date = xScale.invert(x);
                        setLocalHoverDate(date);
                    }}
                    onMouseLeave={() => setLocalHoverDate(null)}
                >
                    <defs>
                        <linearGradient id={`grad-${metric.key}`} x1="0" x2="0" y1="0" y2="1">
                            <stop
                                offset="0%"
                                stopColor={metric.color}
                                stopOpacity={isDark ? (isFocused ? 0.35 : 0.45) : (isFocused ? 0.3 : 0.45)}
                            />
                            <stop offset="100%" stopColor={metric.color} stopOpacity={0.0} />
                        </linearGradient>
                    </defs>

                    <g transform={`translate(${margin.left}, ${margin.top})`}>
                        {yTicks.map((tick) => {
                            const isGrid = !isFocused;

                            return (
                                <g key={tick}>
                                    <line
                                        x1={0} x2={chartWidth}
                                        y1={yScale(tick)} y2={yScale(tick)}
                                        stroke={gridColor}
                                        strokeWidth={1}
                                        strokeDasharray={isFocused ? "0" : (metric.customDomain ? "2,2" : "4,4")}
                                        opacity={isFocused ? 0.2 : 0.5}
                                    />

                                    <text
                                        x={isGrid ? -8 : -12}
                                        y={yScale(tick)}
                                        dy={isGrid ? 4 : 4}
                                        textAnchor="end"
                                        fontSize={isFocused ? 12 : 10}
                                        fill={textColor}
                                        fontFamily="monospace"
                                        opacity={isFocused ? 1 : 0.8}
                                        style={{ pointerEvents: 'none' }}
                                    >
                                        {formatVal(tick)}
                                    </text>
                                </g>
                            );
                        })}

                        <path d={areaGenerator(data)} fill={`url(#grad-${metric.key})`} />
                        <path d={lineGenerator(data)} fill="none" stroke={metric.color} strokeWidth={isFocused ? 3 : 2} />

                        <g transform={`translate(0, ${chartHeight + 16})`}>
                            {xTicks.map((tick, i) => {
                                let anchor = 'middle';
                                if (!isFocused && i === 0) anchor = 'start';
                                if (!isFocused && i === xTicks.length - 1) anchor = 'end';

                                return (
                                    <text
                                        key={i}
                                        x={xScale(tick)}
                                        textAnchor={anchor}
                                        fontSize={isFocused ? 13 : 11}
                                        fontFamily="monospace"
                                        fill={textColor}
                                    >
                                        {d3.timeFormat('%Y')(tick)}
                                    </text>
                                );
                            })}
                        </g>

                        {activeData && (
                            <g>
                                <line
                                    x1={activeData.x} x2={activeData.x}
                                    y1={0} y2={chartHeight}
                                    stroke={isDark ? '#cbd5e1' : '#475569'}
                                    strokeWidth={1}
                                    strokeDasharray="4,4"
                                    opacity={0.6}
                                />
                                <circle
                                    cx={activeData.x}
                                    cy={activeData.y}
                                    r={isFocused ? 6 : 5}
                                    fill={isDark ? '#1e293b' : '#ffffff'}
                                    stroke={metric.color}
                                    strokeWidth={2}
                                />
                            </g>
                        )}

                        <line
                            x1={0} x2={chartWidth}
                            y1={chartHeight} y2={chartHeight}
                            stroke={gridColor}
                            strokeWidth={1}
                        />
                    </g>
                </svg>
            </div>
        </div>
    );
};

function EconomicIndicatorsCharts({
    data,
    width = 1400,
    height = 800,
    marginTop = 40,
    marginRight = 40,
    marginBottom = 50,
    marginLeft = 80,
    isMobile = false,
}) {
    const { isDark } = useTheme();
    const [focusedKey, setFocusedKey] = useState(null);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setFocusedKey(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const validData = useMemo(() => {
        return data.map(d => ({
            ...d,
            year: new Date(d.year)
        }));
    }, [data]);

    const boundedWidth = Math.max(0, width - marginLeft - marginRight);
    const boundedHeight = Math.max(0, height - marginTop - marginBottom);

    const gapX = 40;
    const gapY = 32;
    const cols = isMobile ? 1 : (boundedWidth < 600 ? 2 : 3);

    const gridCellWidth = Math.floor((boundedWidth - (gapX * (cols - 1))) / cols);

    const totalChromeHeight = 220;
    const availableHeightForCharts = Math.max(0, boundedHeight - totalChromeHeight);
    const gridCellHeight = availableHeightForCharts / 2;

    const focusedChartWidth = Math.min(boundedWidth, 1000);
    const focusedChartHeight = boundedHeight - 120;

    return (
        <div
            className="relative w-full flex flex-col overflow-hidden"
            style={{
                height: height,
                paddingTop: marginTop,
                paddingRight: marginRight,
                paddingBottom: marginBottom,
                paddingLeft: marginLeft
            }}
        >
            {focusedKey ? (
                // Focused View
                <div className="w-full h-full flex flex-col items-center animate-in fade-in duration-300">
                    <div style={{ width: focusedChartWidth }} className="flex flex-col h-full">
                        <button
                            onClick={() => setFocusedKey(null)}
                            className="mb-4 flex-shrink-0 flex items-center gap-2 text-base font-bold text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors w-fit"
                        >
                            <ArrowLeft size={20} /> Back to Overview
                        </button>

                        <div className="flex-grow min-h-0">
                            <SingleChart
                                metric={METRICS.find(m => m.key === focusedKey)}
                                data={validData}
                                width={focusedChartWidth}
                                height={focusedChartHeight}
                                isDark={isDark}
                                isFocused={true}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                // Grid View
                <div className="flex flex-col gap-12 h-full justify-start animate-in fade-in duration-300">

                    {/* Economic Indicators */}
                    <div>
                        <div className="mb-6 pb-2 border-b border-gray-300 dark:border-gray-600">
                            <h2 className="text-lg font-bold tracking-wider text-gray-900 dark:text-gray-100 pl-1">
                                ECONOMIC INDICATORS
                            </h2>
                        </div>
                        <div
                            className="grid"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${cols}, ${gridCellWidth}px)`,
                                columnGap: gapX,
                                rowGap: gapY,
                                justifyContent: 'center',
                                margin: '0 auto'
                            }}
                        >
                            {METRICS.slice(0, 3).map((metric) => (
                                <div key={metric.key} className="group rounded-xl -m-6 p-6 transition-colors duration-200 flex flex-col hover:bg-black/5 dark:hover:bg-white/5">
                                    <SingleChart
                                        metric={metric}
                                        data={validData}
                                        width={gridCellWidth}
                                        height={gridCellHeight}
                                        isDark={isDark}
                                        isFocused={false}
                                        onClick={() => setFocusedKey(metric.key)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Humanitarian Indicators */}
                    <div>
                        <div className="mb-8 pb-4 border-b border-gray-300 dark:border-gray-600">
                            <h2 className="text-lg font-bold tracking-wider text-gray-900 dark:text-gray-100 pl-1 mb-2">
                                HUMANITARIAN INDICATORS
                            </h2>
                            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
                                {SECTION_INFO.humanitarian.note}
                            </p>
                        </div>
                        <div
                            className="grid"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${cols}, ${gridCellWidth}px)`,
                                columnGap: gapX,
                                rowGap: gapY,
                                justifyContent: 'center',
                                margin: '0 auto'
                            }}
                        >
                            {METRICS.slice(3, 6).map((metric) => (
                                <div key={metric.key} className="group rounded-xl -m-6 p-6 transition-colors duration-200 flex flex-col hover:bg-black/5 dark:hover:bg-white/5">
                                    <SingleChart
                                        metric={metric}
                                        data={validData}
                                        width={gridCellWidth}
                                        height={gridCellHeight}
                                        isDark={isDark}
                                        isFocused={false}
                                        onClick={() => setFocusedKey(metric.key)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EconomicIndicatorsCharts;
