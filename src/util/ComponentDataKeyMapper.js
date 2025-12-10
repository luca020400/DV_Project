/**
 * Utility class for mapping visualization components to their data keys
 */
class ComponentDataKeyMapper {
    constructor() {
        this.map = {
            CasualtyTrendChart: 'casualtyTrendData',
            DisplacementChart: 'displacementData',
            RegionalConflictMap: 'regionalConflictData',
            EconomicIndicators: 'economicIndicatorsData',
            TimelineChart: 'timelineData',
        };
    }

    /**
     * Get the data key for a given component name
     * @param {string} componentName - The name of the visualization component
     * @returns {string} The corresponding data key
     */
    getDataKey(componentName) {
        return this.map[componentName];
    }
}

// Singleton instance
const componentDataKeyMapper = new ComponentDataKeyMapper();

export default componentDataKeyMapper;
export { ComponentDataKeyMapper };
