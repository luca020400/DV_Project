# Syrian Civil War: A Data-Driven Exploration

An interactive data visualization dashboard exploring the human, social, and economic impact of the Syrian Civil War through verified data from humanitarian organizations and research institutions.

**Live Site**: [GitHub Pages](https://luca020400.github.io/DV_Project/)

## Project Overview

This project presents a consolidated, evidence-driven account of the Syrian conflict through interactive visualizations. It examines key aspects including:
- Casualty trends and patterns
- Displacement crisis and refugee movements
- Regional conflict intensity and geographic distribution
- Economic impact and infrastructure damage
- Timeline of key events and their humanitarian consequences

## Data Sources

The data presented in this dashboard comes from publicly available, verified sources:

### 1. Syrian Center for Policy Research (SCPR)
**URL**: https://scpr-syria.org/

**Purpose**: Economic impact assessments and socioeconomic data

### 2. World Bank
**URL**: https://www.worldbank.org/

**Purpose**: Regional economic and development indicators

### 3. Armed Conflict Location & Event Data Project (ACLED)
**URL**: https://acleddata.com/

**Purpose**: Detailed event data on conflict incidents

### 4. Wikipedia - Timeline of the Syrian Civil War
**URL**: https://en.wikipedia.org/wiki/Timeline_of_the_Syrian_civil_war

**Purpose**: Chronological data on key events in the conflict

### 5. Uppsala Conflict Data Program (UCDP)
**URL**: https://ucdp.uu.se/

**Purpose**: Data on conflict-related casualties and events

### 6. UN Refugee Agency (UNHCR)
**URL**: https://www.unhcr.org/

**Purpose**: Data on refugees and internally displaced persons

### 7. Global Database of Events, Language, and Tone (GDELT)
**URL**: https://www.gdeltproject.org/

**Purpose**: Global event data including conflict events

### 8. International Monetary Fund (IMF)
**URL**: https://www.imf.org/

**Purpose**: Economic data and forecasts

### 9. International Committee of the Red Cross (ICRC)
**URL**: https://www.icrc.org/

**Purpose**: Humanitarian impact reports and data

### 10. United Nations Development Programme (UNDP)
**URL**: https://www.undp.org/

**Purpose**: Development indicators and impact assessments

## Data Processing Pipeline

The project includes automated data processing scripts to transform raw datasets into visualization-ready formats.

### Casualty Data Processing

**Script**: `preprocess/extract_ucdp.py`

**Input**: UCDP (Uppsala Conflict Data Program) CSV export with conflict events data

**Processing Steps**:
1. **Temporal Filtering**: Filters data from July 2010 to January 2021 to match the conflict timeline
2. **Regional Normalization**: Maps raw administrative region names to standardized regions:
   - Aleppo, Damascus, Idlib, Daraa, Homs, and Other
3. **Casualty Categorization**: Separates casualties into two types:
   - **Civilian Deaths**: Direct civilian casualties
   - **Combatant Deaths**: Combatants from both sides (deaths_a + deaths_b)
4. **Monthly Aggregation**: Groups daily event data into monthly summaries for trend analysis
5. **JSON Export**: Outputs processed data as `casualties_data.json` for React consumption

### Displacement Data Processing

**Script**: `preprocess/extract_unhcr.py`

**Input**: UNHCR CSV export with refugee and internally displaced person (IDP) statistics by country of origin and asylum

**Processing Steps**:
1. **Data Filtering**: Filters records by country of origin (Syria: SYR) to focus on Syrian displacement crisis
2. **Refugee Counting**: Aggregates refugee and asylum-seeker populations as "Total_External" to distinguish from internally displaced persons
3. **Top Host Country Identification**: Identifies the 5 largest host countries by cumulative refugee/asylum-seeker numbers across all years:
   - Turkey, Lebanon, Jordan, Germany, and Iraq
4. **Continental Aggregation**: Maps non-top-5 host countries to continental categories:
   - Europe, Africa, and Other
   - Uses ISO3 country codes and pycountry_convert library for accurate continent mapping
5. **Annual Aggregation**: Groups displacement data by year, creating yearly snapshots from 2011-2025
6. **JSON Export**: Outputs processed data as `displacement_data.json` containing:
   - **idp**: Internally displaced persons (those displaced within Syria)
   - **totalRefugees**: Total external refugees and asylum-seekers
   - **Country-specific fields**: Individual counts for Turkey, Lebanon, Jordan, Germany, and Iraq
   - **Continental fields**: Aggregated counts for Europe, Africa, and Other regions

### Economic Indicators Data Processing

**Scripts**: 
- `preprocess/extract_gdp.py` - Extracts World Bank GDP data
- `preprocess/extract_inflation.py` - Extracts World Bank inflation data
- `preprocess/extract_exchange.py` - Extracts World Bank exchange rate data

**Inputs**: World Bank API CSV exports with country-level economic indicators

**Processing Steps**:
1. **GDP Processing** (`extract_gdp.py`):
   - Filters for "GDP (current US$)" indicator for Syrian Arab Republic
   - Extracts year-value pairs from 1960-2022
   - Outputs as `src/data/pieces/gdp.json`

2. **Inflation Processing** (`extract_inflation.py`):
   - Filters for "Inflation, GDP deflator (annual %)" indicator for Syrian Arab Republic
   - Extracts year-value pairs from 1961-2022
   - Outputs as `src/data/pieces/inflation.json`

3. **Exchange Rate Processing** (`extract_exchange.py`):
   - Filters for "Official exchange rate (LCU per US$, period average)" indicator
   - Extracts historical Syrian Pound to USD conversion rates
   - Outputs as `src/data/pieces/exchange.json`

4. **Humanitarian Indicators** (`human.json`):
   - **IMPORTANT**: Water access, electricity availability, and food insecurity data are **NOT from official datasets**
   - These metrics have been **researched and interpolated from humanitarian organization reports, and OCHA crisis assessments**
   - Data points include:
     - **Water Access**: Percentage of population with reliable access to clean water and sanitation (International Red Cross and UNICEF reports)
     - **Electricity**: Average daily hours of grid access per household (Conflict reports and news articles)
     - **Food Insecurity**: Percentage of population lacking reliable access to food (WFP assessments and humanitarian situation reports)
   - Missing values have been interpolated from events documented in conflict literature and organizational assessments

5. **Merged Economic Data** (`src/data/economic_data.json`):
   - Combines GDP (billions USD), inflation (%), exchange rate (SYP/USD), and humanitarian indicators
   - Filters to 2011-2020 period matching the conflict timeline

**Chart Component**: `src/d3/EconomicIndicatorsChart.jsx`
- Displays 6 metrics in interactive, zoomable grid layout
- Supports dark/light theme switching
- Includes comparative analysis and trend visualization

### Regional Conflict Chart Data Processing

**Source Data**: 
- Pre-processed casualty data from `src/data/conflict_data.json`
- Conflict events aggregated by region and time period

**Processing Steps**:
1. **Temporal Aggregation**: Groups conflict events into time slices (typically monthly or quarterly)
2. **Regional Distribution**: Aggregates casualty counts by Syrian administrative region
3. **Intensity Scaling**: Normalizes casualty counts to create color-intensity mapping for geographical visualization
4. **Geographic Mapping**: Links regional data to GeoJSON features for map visualization

**Chart Component**: `src/d3/RegionalConflictChart.jsx`
- Interactive animated map showing conflict intensity over time
- Playback controls for temporal progression
- Regional hover tooltips with casualty statistics
- Color gradient represents conflict intensity by region

## Data Quality & Limitations

This project acknowledges the following limitations in conflict data:

- **Data Gaps**: UCDP data focuses on one-sided violence and organized conflict events. Some casualties from unorganized violence or undocumented incidents may not be captured
- **Attribution Uncertainty**: Casualty attribution in conflict zones is inherently challenging; figures represent reported counts and may have margins of error
- **Scope Limitations**: This dashboard focuses on quantifiable casualties and does not capture all humanitarian impacts
- **Regional Aggregation**: Some deaths occurring in disputed or transitional areas are classified as "Other"

### Humanitarian Indicators Limitations

The following metrics **do not derive from official datasets**:

- **Water Access, Electricity Availability, and Food Insecurity** are estimated from:
  - Academic articles on Syrian infrastructure during conflict
  - Humanitarian organization reports (OCHA, WFP, UNHCR, UNICEF)
  - Crisis assessments and situation reports
  - Infrastructure damage documentation from news articles

## Project Structure

### Key Directories Explained

**`src/text/`**: All content text, labels, and configurations. Modify these files to update content without touching component code.

**`src/data/`**: Data management and fetching. Also data files in JSON format.

**`src/d3/`**: D3.js visualization components. Pure React-D3 integration for interactive charts.

**`src/contexts/`**: React Context API for theme and data management across the app.

## Building and Running

### Prerequisites

- node.js
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/luca020400/DV_Project.git
   cd DV_Project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Development

**Start the development server**
```bash
npm run dev
```

## Technologies Used

- **React**: UI framework
- **Vite**: Build tool and dev server
- **D3.js**: Data visualization library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

## Author

- **Luca Stefani**
- Student ID: S5163797
- University of Genoa
- Academic Year: 2025/2026
