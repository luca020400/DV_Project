function Content({ isDark, sections }) {
    return (
        <div className="py-12 sm:py-16">
            {/* Hero Section */}
            <div className={`mb-16 py-16 sm:py-24 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">Understanding the Syrian Crisis</h2>
                    <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        A comprehensive data-driven analysis of the Syrian Civil War and its humanitarian impact
                    </p>
                </div>
            </div>

            {/* Content Sections */}
            {sections.map((section, idx) => (
                <section
                    key={section.id}
                    id={section.id}
                    className="mb-20 scroll-mt-20"
                >
                    <div className={`mb-8 py-8 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="w-full h-96 sm:h-[500px] lg:h-[600px] flex items-center justify-center">
                            <div className={`w-full mx-4 sm:mx-auto sm:max-w-7xl h-full rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'}`}>
                                <div className="h-full flex items-center justify-center">
                                    <p className={`text-center text-lg font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        D3 Visualization {idx + 1}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h3 className="text-3xl sm:text-4xl font-bold mb-6">{section.title}</h3>
                        <div className={`space-y-4 text-base sm:text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <p>
                                This section provides detailed analysis and insights related to {section.title.toLowerCase()}.
                                The visualization above presents key data points and trends that help understand the humanitarian
                                and geopolitical dimensions of the Syrian conflict.
                            </p>
                            <p>
                                Comprehensive data collection and visualization techniques are employed to ensure accuracy and
                                clarity in presenting this important information to stakeholders, researchers, and the general public.
                            </p>
                        </div>
                    </div>
                </section>
            ))}
        </div>
    );
}

export default Content;
