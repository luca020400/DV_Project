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

1. **Data Collection**: Download datasets from the above sources in CSV/JSON formats.

## Methodological Limitations

Document known limitations and biases in the data:

- [ ] **Data Gaps**: Identify time periods or geographic areas with incomplete coverage
- [ ] **Attribution Uncertainty**: Document how uncertain causality is handled
- [ ] **Reporting Bias**: Note potential biases in different sources
- [ ] **Temporal Lag**: Explain delays in data reporting
- [ ] **Scope Limitations**: Define what is and isn't included

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