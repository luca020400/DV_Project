import { useCallback, useState } from "react";

import Hero from "./contents/Hero";
import FeatureCards from "./contents/FeatureCards";
import Sections from "./contents/Sections";
import DataSources from "./contents/DataSources";

import { sources } from "./text/sources.js";

function Content({ sections }) {
    const [flashingId, setFlashingId] = useState(null);

    const scrollToSource = useCallback((sourceId) => {
        const element = document.getElementById(`source-${sourceId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setFlashingId(sourceId);
            setTimeout(() => setFlashingId(null), 1800);
        }
    }, []);

    return (
        <>
            {/* Hero Section */}
            <Hero />

            {/* Feature Cards Section */}
            <FeatureCards />

            {/* Content Sections */}
            <Sections
                sections={sections}
                sources={sources}
                onScrollToSource={scrollToSource}
            />

            {/* Data Sources Section */}
            <DataSources dataSources={sources} flashingId={flashingId} />
        </>
    );
}

export default Content;
