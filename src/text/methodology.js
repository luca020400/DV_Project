export const methodology = {
    dataCleaningImputation: {
        title: 'Data Cleaning',
        items: [
            {
                source: 'UCDP Casualty Data',
                description: 'Filtered events from July 2010 to January 2021 to match conflict timeline. Regional names normalized to standardized categories (Aleppo, Damascus, Idlib, Daraa, Homs, Other). Casualties separated into civilian and combatant categories based on UCDP classification.'
            },
            {
                source: 'UNHCR Displacement Data',
                description: 'Filtered by country of origin (Syria). Country codes mapped to continents using ISO3 standards.'
            },
            {
                source: 'World Bank Economic Data',
                description: 'GDP, inflation, and exchange rate data extracted for Syria from 2011-2020 with the World Bank API.'
            },
            {
                source: 'Humanitarian Indicators',
                description: 'Water access, electricity availability, and food insecurity metrics were NOT from official datasets. These values were researched and interpolated from OCHA crisis assessments, UNICEF reports, WFP situation reports, and academic literature on Syrian infrastructure during conflict.'
            },
            {
                source: 'Event Timeline Data',
                description: '75 significant events manually curated from Wikipedia\'s Syrian Civil War timeline. Geographic coordinates assigned based on reported event locations. Event types classified into 9 categories for visual differentiation.'
            }
        ]
    },
    dataProcessingAnalysis: {
        title: 'Data Processing & Analysis Pipeline',
        items: [
            {
                step: 'Raw Data Collection',
                description: 'CSV exports from UCDP, UNHCR, and World Bank APIs. Manual event curation from Wikipedia timeline. GeoJSON boundaries for Syria and neighboring regions.'
            },
            {
                step: 'Python Preprocessing',
                description: 'Custom Python scripts (extract_ucdp.py, extract_unhcr.py, extract_gdp.py, etc.) transform raw CSVs into structured JSON. Scripts handle filtering, aggregation, normalization, and merging of datasets.'
            },
            {
                step: 'Temporal Aggregation',
                description: 'Daily event data aggregated to monthly summaries for casualty trends. Displacement data aggregated annually. Economic indicators maintained at yearly granularity.'
            },
            {
                step: 'Geographic Processing',
                description: 'Regional conflict intensity mapped to GeoJSON features. Event coordinates validated and corrected for map visualization accuracy.'
            },
            {
                step: 'JSON Export',
                description: 'Final datasets exported to src/data/ directory in JSON format optimized for D3.js visualization components.'
            }
        ]
    },
    limitations: {
        title: 'Limitations & Constraints',
        items: [
            {
                type: 'Data Gaps',
                description: 'UCDP focuses on organized conflict events; casualties from unorganized violence or undocumented incidents may not be captured. Economic data post-2011 is sparse due to conflict conditions disrupting official reporting.'
            },
            {
                type: 'Attribution Uncertainty',
                description: 'Casualty attribution in conflict zones is inherently challenging. Reported figures represent documented counts and have margins of error. Distinction between civilian and combatant deaths relies on UCDP classification methodology.'
            },
            {
                type: 'Humanitarian Estimates',
                description: 'Water access, electricity, and food insecurity metrics are interpolated estimates, not official measurements. These should be interpreted as indicative trends rather than precise statistics.'
            },
            {
                type: 'Temporal Coverage',
                description: 'Dashboard primarily covers 2011-2020. Events after 2020 are not included (except for displacement data).'
            },
            {
                type: 'Geographic Scope',
                description: 'Regional aggregation simplifies complex local dynamics. Deaths in disputed or transitional areas classified as "Other" may obscure important patterns.'
            },
            {
                type: 'Source Bias',
                description: 'Different organizations use different methodologies for data collection. Cross-source comparisons should account for varying definitions and reporting standards.'
            }
        ]
    }
};
