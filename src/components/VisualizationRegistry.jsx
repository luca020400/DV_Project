// Import all visualization components
import LinePlot from '../d3/LinePlot';
import ScatterPlot from '../d3/ScatterPlot';

// Registry mapping component names to actual components
export const visualizationRegistry = {
    CasualtyTrendChart: LinePlot,
    DisplacementChart: ScatterPlot,
    RegionalConflictMap: LinePlot,
    EconomicIndicators: LinePlot,
    TimelineChart: LinePlot,
};

// Helper to get component
export const getVisualizationComponent = (componentName) => {
    return visualizationRegistry[componentName]
};
