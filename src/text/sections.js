export const sections = [
    {
        id: 'section1',
        title: 'Casualties Overview',
        subtitle: 'Understanding the human cost of the conflict',
        description: [
            'The Syrian Civil War has resulted in significant loss of life since its inception in 2011. This section examines the casualty figures and trends across different regions and timeframes.',
            'Data comes from international humanitarian organizations and research institutions committed to documenting the impact of the conflict.'
        ],
        visualization: {
            title: 'Casualty Trends Over Time',
            component: 'CasualtyTrendChart'
        },
        sourceData: ['ucdp', 'wikipedia_timeline']
    },
    {
        id: 'section2',
        title: 'Displacement Crisis',
        subtitle: 'The refugee and internally displaced person emergency',
        description: [
            'The conflict has displaced millions of people, creating one of the world\'s largest humanitarian crises. This includes both refugees fleeing to neighboring countries and internally displaced persons.',
            'Understanding displacement patterns is crucial for humanitarian planning and international aid allocation.'
        ],
        visualization: {
            title: 'Displacement by Region and Time',
            component: 'DisplacementChart'
        },
        sourceData: ['unhcr']
    },
    {
        id: 'section3',
        title: 'Regional Conflict',
        subtitle: 'Geographic distribution and conflict intensity',
        description: [
            'Different regions of Syria have experienced varying levels of conflict intensity. This visualization maps the geographic distribution of conflict events.',
            'Understanding regional variations helps explain humanitarian needs and population movements across the country.'
        ],
        visualization: {
            title: 'Regional Conflict Intensity Map',
            component: 'RegionalConflictMap'
        },
        sourceData: ['gdelt', 'acled']
    },
    {
        id: 'section4',
        title: 'Economic Impact',
        subtitle: 'Infrastructure damage and economic consequences',
        description: [
            'The conflict has devastated Syria\'s economy and infrastructure. Economic losses span destroyed buildings, lost productivity, and reduced trade.',
            'This section examines the long-term economic implications and recovery challenges facing the nation.'
        ],
        visualization: {
            title: 'Economic Indicators and Projections',
            component: 'EconomicIndicators'
        },
        sourceData: ['worldbank', 'imf', 'icrc', 'undp']
    },
    {
        id: 'section5',
        title: 'Timeline Analysis',
        subtitle: 'Key events and their humanitarian consequences',
        description: [
            'A chronological view of major events in the Syrian conflict reveals patterns in escalation, deescalation, and humanitarian crisis development.',
            'This timeline helps contextualize the data presented in other sections and understand causal relationships.'
        ],
        visualization: {
            title: 'Conflict Timeline and Key Events',
            component: 'TimelineChart'
        },
        sourceData: ['wikipedia_timeline']
    }
];
