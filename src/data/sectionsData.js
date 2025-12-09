export const sections = [
    {
        id: 'section1',
        title: 'Casualties Overview',
        subtitle: 'Understanding the human cost of the conflict',
        introduction: [
            'The Syrian Civil War has resulted in significant loss of life since its inception in 2011. This section examines the casualty figures and trends across different regions and timeframes.',
            'Data comes from international humanitarian organizations and research institutions committed to documenting the impact of the conflict.'
        ],
        visualization: {
            title: 'Casualty Trends Over Time'
        },
        sourceData: ['SOHR (Syrian Observatory for Human Rights)', 'UN Office for the Coordination of Humanitarian Affairs']
    },
    {
        id: 'section2',
        title: 'Displacement Crisis',
        subtitle: 'The refugee and internally displaced person emergency',
        introduction: [
            'The conflict has displaced millions of people, creating one of the world\'s largest humanitarian crises. This includes both refugees fleeing to neighboring countries and internally displaced persons.',
            'Understanding displacement patterns is crucial for humanitarian planning and international aid allocation.'
        ],
        visualization: {
            title: 'Displacement by Region and Time'
        },
        sourceData: ['UNHCR (UN Refugee Agency)', 'World Health Organization', 'International Organization for Migration']
    },
    {
        id: 'section3',
        title: 'Regional Conflict',
        subtitle: 'Geographic distribution and conflict intensity',
        introduction: [
            'Different regions of Syria have experienced varying levels of conflict intensity. This visualization maps the geographic distribution of conflict events.',
            'Understanding regional variations helps explain humanitarian needs and population movements across the country.'
        ],
        visualization: {
            title: 'Regional Conflict Intensity Map'
        },
        sourceData: ['Airwars', 'UCDP (Uppsala Conflict Data Program)', 'Acled (Armed Conflict Location & Event Data)']
    },
    {
        id: 'section4',
        title: 'Economic Impact',
        subtitle: 'Infrastructure damage and economic consequences',
        introduction: [
            'The conflict has devastated Syria\'s economy and infrastructure. Economic losses span destroyed buildings, lost productivity, and reduced trade.',
            'This section examines the long-term economic implications and recovery challenges facing the nation.'
        ],
        visualization: {
            title: 'Economic Indicators and Projections'
        },
        sourceData: ['World Bank', 'Syrian Center for Policy Research', 'IMF (International Monetary Fund)']
    },
    {
        id: 'section5',
        title: 'Timeline Analysis',
        subtitle: 'Key events and their humanitarian consequences',
        introduction: [
            'A chronological view of major events in the Syrian conflict reveals patterns in escalation, deescalation, and humanitarian crisis development.',
            'This timeline helps contextualize the data presented in other sections and understand causal relationships.'
        ],
        visualization: {
            title: 'Conflict Timeline and Key Events'
        },
        sourceData: ['Wikipedia conflict timeline', 'BBC News archives', 'International Crisis Group']
    }
];
