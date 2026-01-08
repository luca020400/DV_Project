export const sections = [
    {
        id: 'section1',
        title: 'A Decade of Loss',
        subtitle: 'A forensic accounting of the human cost across Syria (2011-2021)',
        description: [
            'It began with teenagers spray-painting protest slogans on a school wall in Daraa. Within weeks, peaceful demonstrations had spread across the country. Within months, the government\'s brutal crackdown had ignited a civil war. Within years, that war would kill hundreds of thousands and draw in foreign powers from across the globe.',
            'The violence did not fall evenly. Aleppo—once Syria\'s largest city and economic heart—became synonymous with urban warfare, its ancient souks reduced to rubble. Damascus saw car bombs pierce its historic quarters. Idlib, Homs, and Daraa each endured their own sieges and offensives. Even remote regions like Raqqa and Deir ez-Zor, initially far from the fighting, would become battlegrounds as ISIS carved out its caliphate.',
            'The timeline reads like a catalog of horrors: the Battle of Aleppo in 2012, the Ghouta chemical attack that killed over 1,400 in a single night, the rise and fall of ISIS, Russian airstrikes that turned the tide for Assad. At the conflict\'s deadliest peaks, more than 6,000 people were dying every month—200 lives extinguished daily, every day, for months on end.',
            'By the time the Idlib ceasefire brought an uneasy quiet in 2020, the war had claimed an estimated 500,000 lives. Behind that number are half a million individual stories that ended too soon—doctors and teachers, children and grandparents, revolutionaries and bystanders caught in the crossfire of history.'
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
            'Before the war, Syria was home to 21 million people. Today, more than half have been forced to flee their homes—a staggering exodus that represents the largest displacement crisis since World War II. The scale defies comprehension: if Syrian refugees formed their own country, it would be larger than Denmark or Finland.',
            'The geography of exile tells a story of desperation and proximity. Turkey alone absorbed 2.65 million refugees, transforming border towns into sprawling camps almost overnight. Lebanon, a country of just 4 million, now hosts over 700,000 Syrians—imagine if Italy suddenly absorbed 10 million people. Jordan, Germany, and Iraq each shelter hundreds of thousands more.',
            'Yet the largest displaced population never crossed a border at all. Over 6 million Syrians remain internally displaced—refugees in their own country, often moving multiple times as front lines shifted. Many fled Aleppo only to face bombing in Idlib. Others escaped rural violence for cities that would themselves become battlegrounds.',
            'Fourteen years later, return remains a distant dream for most. The homes they fled are rubble. The communities they knew have scattered across continents. For an entire generation of Syrian children, "home" exists only in their parents\' memories.'
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
            'The war did not rage uniformly across Syria. Some governorates became synonymous with destruction—Aleppo, Idlib, Rural Damascus—while others experienced relative calm, at least for a time. The geography of violence shifted constantly, following front lines, sieges, and military campaigns.',
            'From 2011 to 2020, the conflict\'s epicenter migrated across the country. What began as localized unrest in Daraa spread into a nationwide conflagration, consuming distinct regions in different, deadly cycles. Raqqa fell silent under ISIS rule, then erupted again during liberation. Eastern Ghouta endured years of siege before a final, devastating offensive.',
            'Explore the timeline to see how the map transforms year by year—watch the violence spread, intensify, and shift as the war evolved.'
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
            'Wars are fought with weapons, but they are lost through economics. Syria\'s GDP collapsed from $67 billion in 2010 to barely $12 billion by 2020—an 82% freefall that erased decades of development in just a few years. For comparison, this is as if Italy\'s entire economy shrank to the size of Sardinia\'s alone.',
            'The Syrian pound tells the story of a currency in freefall. Before the war, 48 pounds bought one dollar. By 2020, that figure had exploded past 800. Savings evaporated overnight. A lifetime of work became worthless paper. Inflation swung wildly, making it impossible for families to plan even a week ahead—the price of bread could double between morning and evening.',
            'But the true measure of collapse isn\'t found in exchange rates. It\'s in the hours a family waits for electricity that may never come. It\'s in the walk to find clean water that used to flow from every tap. Before the war, Syrians had 21-hour power and near-universal water access. Today, blackouts last days, and half the population lacks reliable clean water.',
            'The result is a hunger crisis in a land that once exported food. Over half of Syrians now face food insecurity—not because crops won\'t grow, but because the systems that moved food from farm to table have been shattered. The economy didn\'t just shrink; it collapsed into subsistence.'
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
            'The Syrian war was not one conflict but many, layered atop each other. A popular uprising became a civil war, then a proxy war, then a battleground for global powers. The Arab Spring protests of 2011 gave way to foreign interventions, the rise and fall of ISIS, and ultimately the economic strangulation of the Caesar Act—a shift from battlefield to financial warfare.',
            'Each turning point reshaped the country\'s fate: the chemical attacks that crossed red lines, the Russian intervention that saved Assad, the death of Baghdadi that marked ISIS\'s collapse. Different regions faced distinct horrors—chemical weapons in Ghouta, barrel bombs in Aleppo, siege warfare in Homs—often simultaneously, in a fragmented country fighting multiple wars at once.',
            'Scroll through the event log to trace the war\'s arc, and watch how each moment left its mark on the map.'
        ],
        visualization: {
            title: 'Conflict Timeline and Key Events',
            component: 'TimelineChart'
        },
        sourceData: ['wikipedia_timeline']
    }
];
