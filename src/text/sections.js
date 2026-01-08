export const sections = [
    {
        id: 'section1',
        title: 'A Decade of Loss',
        subtitle: 'A forensic accounting of the human cost across Syria (2011-2021)',
        description: [
            'Ignited by peaceful protests in March 2011, the conflict metastasized into a defining humanitarian catastrophe. This chart visualizes the relentless pulse of violence, tracking monthly casualty counts that surged to tragic heights—surpassing 6,000 deaths per month—during the conflict\'s most kinetic phases in late 2012 and 2013.',
            'The data is disaggregated by key governorates, revealing the shifting geography of the war. From the urban battlegrounds of Aleppo (yellow) and Damascus (red) to the rural fronts of Idlib, Daraa, and Homs, distinct regional patterns emerge. Notably, the "Other" category (blue) highlights how violence spread beyond major centers to areas like Raqqa and Deir ez-Zor as the war evolved.',
            'Crucial turning points are annotated directly on the timeline, contextualizing the death toll against events such as the Battle of Aleppo (Jul 2012), the Ghouta Chemical Attack (Aug 2013), the rise of the ISIS Caliphate (Jun 2014), the Russian Intervention (Sep 2015), and the eventual Idlib Ceasefire (Mar 2020).',
            'Use the dashboard controls to analyze the data: toggle between "Line Chart" and "Stacked Area" views to see cumulative vs. comparative trends, and filter by "Civilian" or "Combatant" status to understand the demographic impact. Hover over any peak to see the precise breakdown of lives lost during that month.'
        ],
        visualization: {
            title: 'Regional Casualty Trends by Governorate (2011-2021)',
            component: 'CasualtyTrendChart'
        },
        sourceData: ['ucdp', 'wikipedia_timeline']
    },
    {
        id: 'section2',
        title: 'A Nation Uprooted',
        subtitle: 'Inside the largest displacement crisis of the modern era',
        description: [
            'This mirrored visualization lays bare the dual geography of Syrian displacement. The upper horizon (orange) represents the staggering scale of Internally Displaced Persons (IDPs)—a population that surged rapidly in the war\'s early years and remains tragically high, with over 6.47 million people still displaced within Syria\'s borders in 2025. This "mountain" of internal displacement consistently dwarfs the external figures below, highlighting that the majority of those who lost their homes never made it out of the country.',
            'Below the axis, the chart descends into the complex stratification of the global refugee crisis. Turkey (light blue) serves as the primary sanctuary, hosting 2.65 million refugees—nearly half the external total. The visualization further breaks down the diaspora into distinct flows: referencing significant populations in Lebanon (0.72M), Germany (0.76M), and Jordan (0.51M), alongside communities in Iraq, the broader European continent, and Africa.',
            'The "2025" data snapshot serves as a grim reminder of permanence: fourteen years after the first protests, the total external refugee count stands at 5.65 million, proving that for millions of Syrians, displacement has evolved from a temporary emergency into a generational reality.'
        ],
        visualization: {
            title: 'Internal vs. External Displacement Over Time',
            component: 'DisplacementChart'
        },
        sourceData: ['unhcr']
    },
    {
        id: 'section3',
        title: 'Mapping the Conflict',
        subtitle: 'A geospatial archive of the war\'s intensity and spread',
        description: [
            'This interactive visualization transforms abstract statistics into a geographic narrative, visualizing the density of conflict incidents across Syria\'s governorates. It reveals the unequal burden of the war, highlighting how specific regions became focal points of violence while others remained relatively insulated during different phases.',
            'The true power of this data lies in its temporal depth. By animating the timeline from 2011 to 2020, you can witness the migration of the conflict\'s epicenter. Watch as the footprint of violence morphs from localized unrest into a nationwide conflagration, consuming distinct regions like Raqqa or Eastern Ghouta in different, deadly cycles.'
        ],
        visualization: {
            title: 'Interactive Event Map & Timeline',
            component: 'RegionalConflictMap'
        },
        sourceData: ['gdelt', 'acled']
    },
    {
        id: 'section4',
        title: 'Economic Collapse',
        subtitle: 'The silent devastation of Syria\'s financial and social systems',
        description: [
            'This dashboard exposes the catastrophic economic implosion that paralleled the violence. The top row illustrates a financial freefall: GDP Output (blue) collapsed from a pre-war peak of $76 billion in 2011 to just $12 billion by 2020. This ruin is mirrored in the currency markets, where the Exchange Rate (purple) spiked exponentially from 48 SYP to 878 SYP per dollar, while inflation (red) surged unpredictably, destabilizing basic commerce.',
            'The bottom row translates these financial abstractions into human suffering. Infrastructure collapse is evident in the Power Supply (yellow) graph, which tracks a decline from 24-hour availability to near-zero reliable hours. Similarly, Water Access (teal) has been cut by half. The inevitable result is plotted in orange: a relentless rise in Food Insecurity, which now affects the majority of the population as systems of support disintegrate.'
        ],
        visualization: {
            title: 'Economic & Humanitarian Indicators Dashboard',
            component: 'EconomicIndicators'
        },
        sourceData: ['worldbank', 'imf', 'icrc', 'undp']
    },
    {
        id: 'section5',
        title: 'Timeline Analysis',
        subtitle: 'Deconstructing the chain of events',
        description: [
            'This interactive archive anchors the conflict\'s chronology to its geography. The log on the left functions as a detailed historical ledger, scrolling through the war\'s defining moments—from the initial uprisings to the complex web of foreign interventions. It culminates in the economic strangulation of the Caesar Act, marking a shift from the battlefield to financial warfare.',
            'By navigating to specific dates—such as the death of Baghdadi or the Idlib ceasefires—viewers can pinpoint exactly where history turned. The map reveals the fragmented reality of the country, illustrating how different regions faced distinct types of violence, from chemical attacks to conventional warfare, often simultaneously.'
        ],
        visualization: {
            title: 'Conflict Timeline and Key Events',
            component: 'TimelineChart'
        },
        sourceData: ['wikipedia_timeline']
    }
];
