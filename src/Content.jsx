import { useState } from "react";

import Hero from "./contents/Hero";
import Sections from "./contents/Sections";
import DataSources from "./contents/DataSources";

function Content({ isDark, sections, sources, hero }) {
    const [flashingId, setFlashingId] = useState(null);

    const scrollToSource = (sourceId) => {
        const element = document.getElementById(`source-${sourceId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setFlashingId(sourceId);
            const timer = setTimeout(() => setFlashingId(null), 1800);
            return () => clearTimeout(timer);
        }
    };

    return (
        <>
            {/* Hero Section */}
            <Hero isDark={isDark} hero={hero} />

            {/* Content Sections */}
            <Sections
                isDark={isDark}
                sections={sections}
                sources={sources}
                onScrollToSource={scrollToSource}
            />

            {/* Data Sources Section */}
            <DataSources isDark={isDark} dataSources={sources} flashingId={flashingId} />
        </>
    );
}

export default Content;
