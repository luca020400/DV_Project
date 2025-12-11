import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import dataRegistry from '../data/DataRegistry';

const DataProviderContext = createContext(undefined);

export function DataProvider({ children }) {
    const [registryState, setRegistryState] = useState({
        data: { ...dataRegistry.data },
        loading: { ...dataRegistry.loading },
        errors: { ...dataRegistry.errors },
    });

    // Sync state from registry
    const syncState = useCallback(() => {
        setRegistryState({
            data: { ...dataRegistry.data },
            loading: { ...dataRegistry.loading },
            errors: { ...dataRegistry.errors },
        });
    }, []);

    // Fetch data for a specific key
    const fetchData = useCallback(async (key, url) => {
        const result = await dataRegistry.fetchData(key, url);
        syncState();
        return result;
    }, [syncState]);

    // Fetch all data
    const fetchAllData = useCallback(async (urls = {}) => {
        const result = await dataRegistry.fetchAllData(urls);
        syncState();
        return result;
    }, [syncState]);

    // Set data directly
    const setData = useCallback((key, data) => {
        dataRegistry.setData(key, data);
        syncState();
    }, [syncState]);

    // Initialize and fetch data on mount
    useEffect(() => {
        // TODO: Replace empty dict with actual API endpoint URLs
        // Example: fetchAllData({
        //   casualtyTrendData: 'https://api.example.com/casualties',
        //   displacementData: 'https://api.example.com/displacement',
        // })
        fetchAllData({});
    }, [fetchAllData]);

    const value = {
        data: registryState.data,
        loading: registryState.loading,
        errors: registryState.errors,
        fetchData,
        fetchAllData,
        setData,
    };

    return (
        <DataProviderContext.Provider value={value}>
            {children}
        </DataProviderContext.Provider>
    );
}

export function useDataProvider() {
    const context = useContext(DataProviderContext);
    if (context === undefined) {
        throw new Error('useDataProvider must be used within a DataProvider');
    }
    return context;
}

export function useVisualizationData(dataKey) {
    const { data, loading, errors } = useDataProvider();

    return {
        data: data[dataKey],
        isLoading: loading[dataKey] || false,
        error: errors[dataKey] || null,
    };
}
