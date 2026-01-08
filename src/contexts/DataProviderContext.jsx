/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import dataRegistry from '../data/DataRegistry';

const DataProviderContext = createContext(undefined);

export function DataProvider({ children }) {
    const [registryState, setRegistryState] = useState({
        data: { ...dataRegistry.data },
        loading: { ...dataRegistry.loading },
        errors: { ...dataRegistry.errors },
    });

    useEffect(() => {
        const unsubscribe = dataRegistry.subscribe(() => {
            setRegistryState({
                data: { ...dataRegistry.data },
                loading: { ...dataRegistry.loading },
                errors: { ...dataRegistry.errors },
            });
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const loadData = async () => {
            await dataRegistry.fetchAllData();
        };

        loadData();
    }, []);

    const value = {
        data: registryState.data,
        loading: registryState.loading,
        errors: registryState.errors,
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
        isLoading: loading[dataKey],
        error: errors[dataKey],
    };
}
