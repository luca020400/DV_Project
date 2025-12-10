import { useState, useEffect, useCallback } from 'react';

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
        // Update state when data changes
        const currentData = dataRegistry.getData(dataKey);
        const currentLoading = dataRegistry.isLoading(dataKey);
        const currentError = dataRegistry.getError(dataKey);

        setData(currentData);
        setIsLoading(currentLoading);
        setError(currentError);
    }, [dataKey]);

    const refetch = useCallback(async (url) => {
        if (!url) {
            console.warn(`No URL provided for ${dataKey}`);
            return;
        }

        const newData = await dataRegistry.fetchData(dataKey, url);
        setData(newData);
        setIsLoading(dataRegistry.isLoading(dataKey));
        setError(dataRegistry.getError(dataKey));
    }, [dataKey]);

    return { data, isLoading, error, refetch };
}
