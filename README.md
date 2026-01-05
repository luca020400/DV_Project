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

All data presented in this dashboard comes from publicly available, verified sources:

### 1. UN Office for the Coordination of Humanitarian Affairs (OCHA)
**URL**: https://www.unocha.org/

**Purpose**: Primary source for displacement and humanitarian crisis data

**Data Points Used**:
- Displacement figures and trends
- Humanitarian needs assessments
- Refugee and internally displaced person (IDP) statistics

### 2. Airwars
**URL**: https://airwars.org/

**Purpose**: Comprehensive database of airstrikes and conflict incidents

**Data Points Used**:
- Airstrike frequency and locations
- Incident classifications and severity
- Temporal distribution of events

### 3. Syrian Center for Policy Research (SCPR)
**URL**: https://scpr-syria.org/

**Purpose**: Economic impact assessments and socioeconomic data

**Data Points Used**:
- Economic loss estimates
- Infrastructure damage assessments
- Socioeconomic impact metrics

### 4. World Bank
**URL**: https://www.worldbank.org/

**Purpose**: Regional economic and development indicators

**Data Points Used**:
- GDP and economic growth estimates
- Development indicators
- Regional comparative analysis

### 5. Armed Conflict Location & Event Data Project (ACLED)
**URL**: https://acleddata.com/

**Purpose**: Detailed event data on conflict incidents

**Data Points Used**:
- Event locations and classifications
- Fatality estimates
- Actor involvement and conflict dynamics

### 6. Wikipedia - Timeline of the Syrian Civil War
**URL**: https://en.wikipedia.org/wiki/Timeline_of_the_Syrian_civil_war

**Purpose**: Chronological data on key events in the conflict

**Data Points Used**:
- Major event dates and descriptions
- Political and military turning points
- Humanitarian crisis milestones

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

## Data Quality & Limitations

This project acknowledges the following limitations in conflict data:

- **Data Gaps**: UCDP data focuses on one-sided violence and organized conflict events. Some casualties from unorganized violence or undocumented incidents may not be captured
- **Attribution Uncertainty**: Casualty attribution in conflict zones is inherently challenging; figures represent reported counts and may have margins of error
- **Scope Limitations**: This dashboard focuses on quantifiable casualties and does not capture displacement
- **Regional Aggregation**: Some deaths occurring in disputed or transitional areas are classified as "Other"

## Project Structure

### Key Directories Explained

**`src/text/`**: All content text, labels, and configurations. Modify these files to update content without touching component code.

**`src/data/`**: Data management and fetching. Also data files in JSON format.

**`src/d3/`**: D3.js visualization components. Pure React-D3 integration for interactive charts.

**`src/contexts/`**: React Context API for theme and data management across the app.

## Building and Running

### Prerequisites

- Node.js
- npm (Node Package Manager)

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

- **React 19**: UI framework
- **Vite**: Build tool and dev server
- **D3.js v7**: Data visualization library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

## Author

- **Luca Stefani**
- Student ID: S5163797
- University of Genoa
- Academic Year: 2025/2026