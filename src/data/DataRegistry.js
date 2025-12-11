import * as d3 from 'd3';

import testDataUrl from './test.json?url';

class DataRegistry {
    constructor() {
        // Listeners for state changes
        this.listeners = [];

        // URLs for fetching data
        this.urls = {
            casualtyTrendData: testDataUrl,
            displacementData: undefined,
            regionalConflictData: undefined,
            economicIndicatorsData: undefined,
            timelineData: undefined,
        };

        // Initialize data only with defaults for categories without URLs
        this.data = {
            casualtyTrendData: this.urls.casualtyTrendData ? null : this.generateDefaultData(),
            displacementData: this.urls.displacementData ? null : this.generateDisplacementData(),
            regionalConflictData: this.urls.regionalConflictData ? null : this.generateDefaultData(),
            economicIndicatorsData: this.urls.economicIndicatorsData ? null : this.generateDefaultData(),
            timelineData: this.urls.timelineData ? null : this.generateDefaultData(),
        };

        // Track loading states
        this.loading = {
            casualtyTrendData: this.urls.casualtyTrendData ? true : false,
            displacementData: this.urls.displacementData ? true : false,
            regionalConflictData: this.urls.regionalConflictData ? true : false,
            economicIndicatorsData: this.urls.economicIndicatorsData ? true : false,
            timelineData: this.urls.timelineData ? true : false,
        };

        // Track errors
        this.errors = {
            casualtyTrendData: null,
            displacementData: null,
            regionalConflictData: null,
            economicIndicatorsData: null,
            timelineData: null,
        };
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener());
    }

    generateDefaultData(length = 200) {
        return d3.ticks(-2, 2, length).map(Math.sin);
    }

    generateDisplacementData(length = 200) {
        return d3.ticks(0, 1000000, length).map(d => Math.random() * d);
    }

    getData(key) {
        return this.data[key];
    }

    isLoading(key) {
        return this.loading[key] || false;
    }

    getError(key) {
        return this.errors[key] || null;
    }

    setData(key, data) {
        if (Object.hasOwn(this.data, key)) {
            this.data[key] = data;

            this.notify();
        }
    }

    setLoading(key, isLoading) {
        if (Object.hasOwn(this.loading, key)) {
            this.loading[key] = isLoading;

            this.notify();
        }
    }

    setError(key, error) {
        if (Object.hasOwn(this.errors, key)) {
            this.errors[key] = error;

            this.notify();
        }
    }

    async fetchData(key, url) {
        this.setLoading(key, true);
        this.setError(key, null);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.setData(key, data);
            return data;
        } catch (error) {
            this.setError(key, error.message);
            console.error(`Error fetching ${key}:`, error);
        } finally {
            this.setLoading(key, false);
        }
    }

    // Fetch all data sets
    async fetchAllData() {
        const urls = Object.entries(this.urls).filter(([, url]) => url !== undefined);

        const fetchPromises = urls.map(
            ([key, url]) => this.fetchData(key, url)
        );

        const results = await Promise.allSettled(fetchPromises);

        const failedFetches = results.filter(result => result.status === 'rejected');
        if (failedFetches.length > 0) {
            console.error(`${failedFetches.length} fetch(es) failed`);
        }

        return results;
    }
}

// Singleton instance
const dataRegistry = new DataRegistry();

export default dataRegistry;
export { DataRegistry };
