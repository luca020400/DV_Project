import { useState } from "react";

import Hero from "./contents/Hero";
import Sections from "./contents/Sections";
import DataSources from "./contents/DataSources";

function Content({ sections, sources, hero }) {
    const [flashingId, setFlashingId] = useState(null);

    const scrollToSource = (sourceId) => {
        const element = document.getElementById(`source-${sourceId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setFlashingId(sourceId);
            setTimeout(() => setFlashingId(null), 1800);
        }
    };

    return (
        <>
            {/* Hero Section */}
            <Hero hero={hero} />

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
