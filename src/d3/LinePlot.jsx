import * as d3 from "d3";
import { useRef, useEffect } from "react";

function LinePlot({
    data,
    width = 1000,
    height = 400,
    marginTop = 20,
    marginRight = 20,
    marginBottom = 20,
    marginLeft = 30,
    onZoomChange,
    disableZoom = false,
}) {
    const svgRef = useRef();
    const gx = useRef();
    const gy = useRef();
    const gChart = useRef();

    const x = d3.scaleLinear([0, data.length - 1], [marginLeft, width - marginRight]);
    const y = d3.scaleLinear(d3.extent(data), [height - marginBottom, marginTop]);
    const line = d3.line((_, i) => x(i), y);

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

        if (!disableZoom) {
            svg.call(zoom);
        } else {
            svg.on('.zoom', null);
        }
    }, [data, x, y, marginBottom, onZoomChange, disableZoom]);

    return (
        <svg ref={svgRef} width={width} height={height} style={{ cursor: disableZoom ? 'default' : 'grab' }}>
            <g ref={gChart}>
                <g ref={gx} transform={`translate(0,${height - marginBottom})`} />
                <g ref={gy} transform={`translate(${marginLeft},0)`} />
                <path fill="none" stroke="currentColor" strokeWidth="1.5" d={line(data)} />
                <g fill="white" stroke="currentColor" strokeWidth="1.5">
                    {data.map((d, i) => (<circle key={i} cx={x(i)} cy={y(d)} r="2.5" />))}
                </g>
            </g>
        </svg>
    );
}

export default LinePlot;
