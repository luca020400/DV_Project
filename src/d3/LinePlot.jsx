import { useRef, useEffect, useState } from 'react';

import * as d3 from 'd3';

function LinePlot({
    data,
    width = 1000,
    height = 400,
    marginTop = 40,
    marginRight = 40,
    marginBottom = 40,
    marginLeft = 70,
    onZoomChange,
    isMobile = false,
}) {
    const svgRef = useRef();
    const containerRef = useRef();
    const gx = useRef();
    const gy = useRef();
    const gChart = useRef();
    const [containerSize, setContainerSize] = useState({ width: width, height: height });

    const chartWidth = containerSize.width;
    const chartHeight = containerSize.height;

    const x = d3.scaleLinear([0, data.length - 1], [marginLeft, chartWidth - marginRight]);
    const y = d3.scaleLinear(d3.extent(data), [chartHeight - marginBottom, marginTop]);
    const line = d3.line((_, i) => x(i), y);

    // Handle container resize
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(() => {
            setContainerSize({
                width: container.clientWidth,
                height: container.clientHeight,
            });
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => void d3.select(gx.current).call(d3.axisBottom(x)), [gx, x]);
    useEffect(() => void d3.select(gy.current).call(d3.axisLeft(y)), [gy, y]);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);

        const zoom = d3.zoom()
            .scaleExtent([0.5, 2])
            .on('zoom', (event) => {
                const { transform } = event;
                d3.select(gChart.current).attr('transform', transform);

                if (onZoomChange) {
                    onZoomChange(transform.k);
                }
            });

        if (isMobile) {
            svg.call(zoom);
        } else {
            svg.on('.zoom', null);
        }
    }, [data, x, y, chartHeight, marginBottom, onZoomChange, isMobile]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ cursor: isMobile ? 'grab' : 'default', touchAction: 'pinch-zoom' }}
            >
                <g ref={gChart}>
                    <g ref={gx} transform={`translate(0,${chartHeight - marginBottom})`} />
                    <g ref={gy} transform={`translate(${marginLeft},0)`} />
                    <path fill="none" stroke="currentColor" strokeWidth="1.5" d={line(data)} />
                    <g fill="white" stroke="currentColor" strokeWidth="1.5">
                        {data.map((d, i) => (<circle key={i} cx={x(i)} cy={y(d)} r="2.5" />))}
                    </g>
                </g>
            </svg>
        </div>
    );
}

export default LinePlot;
