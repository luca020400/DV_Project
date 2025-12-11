import { useState, useEffect } from 'react';

import dataRegistry from '../data/DataRegistry';

/**
 * Custom hook for accessing visualization data
 * @param {string} dataKey - The key of the data to fetch (e.g., 'casualtyTrendData')
 * @returns {object} { data, isLoading, error }
 */
export function useVisualizationData(dataKey) {
    const [data, setData] = useState(dataRegistry.getData(dataKey));
    const [isLoading, setIsLoading] = useState(dataRegistry.isLoading(dataKey));
    const [error, setError] = useState(dataRegistry.getError(dataKey));

    useEffect(() => {
        const currentData = dataRegistry.getData(dataKey);
        const currentLoading = dataRegistry.isLoading(dataKey);
        const currentError = dataRegistry.getError(dataKey);

        setData(currentData);
        setIsLoading(currentLoading);
        setError(currentError);
    }, [dataKey]);

    return { data, isLoading, error };
}
