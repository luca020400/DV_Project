import * as d3 from 'd3';

import casualties_data_url from './casualties_data.json?url';
import displacement_data_url from './displacement_data.json?url';
import conflict_data_url from './conflict_data.json?url';
import geojson_url from './geo/syria.json?url';

class DataRegistry {
    constructor() {
        // Listeners for state changes
        this.listeners = [];

        // URLs for fetching data - now supports multiple named URLs per data type
        this.urls = {
            casualtyTrendData: casualties_data_url,
            displacementData: displacement_data_url,
            regionalConflictData: {
                data: conflict_data_url,
                geoJson: geojson_url,
            },
            economicIndicatorsData: undefined,
            timelineData: undefined,
        };

        // Initialize data only with defaults for categories without URLs
        this.data = {
            casualtyTrendData: null,
            displacementData: null,
            regionalConflictData: null,
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

    async fetchData(key, urlsObj) {
        this.setLoading(key, true);
        this.setError(key, null);

        try {
            if (typeof urlsObj === 'string') {
                const response = await fetch(urlsObj);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                this.setData(key, data);
                return data;
            } else {
                const fetchPromises = Object.entries(urlsObj).map(async ([name, url]) => {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    return [name, data];
                });

                const fetchResults = await Promise.all(fetchPromises);
                const results = Object.fromEntries(fetchResults);
                this.setData(key, results);
                return results;
            }
        } catch (error) {
            this.setError(key, error.message);
            console.error(`Error fetching ${key}:`, error);
        } finally {
            this.setLoading(key, false);
        }
    }

    // Fetch all data sets
    async fetchAllData() {
        const urls = Object.entries(this.urls).filter(([, urlsObj]) => urlsObj !== undefined);

        const fetchPromises = urls.map(
            ([key, urlsObj]) => this.fetchData(key, urlsObj)
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
