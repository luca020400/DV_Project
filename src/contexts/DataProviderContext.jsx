import { createContext, useContext, useState, useCallback, useEffect } from 'react';
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

    // Fetch all data
    const fetchAllData = useCallback(async () => {
        const result = await dataRegistry.fetchAllData();
        syncState();
        return result;
    }, [syncState]);

    const value = {
        data: registryState.data,
        loading: registryState.loading,
        errors: registryState.errors,
        fetchAllData,
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
