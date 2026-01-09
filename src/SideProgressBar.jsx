function SideProgressBar({ sections, activeSection, onSectionClick }) {

    // Build complete item list: intro -> sections -> data sources
    const allItems = [
        { id: 'intro', title: 'Intro', subtitle: 'Overview & Features', isCircle: true },
        ...sections,
        { id: 'data-sources', title: 'Data Sources', subtitle: 'Sources & References', isSpecial: true },
    ];

    const activeIndex = allItems.findIndex(item => item.id === activeSection);

    return (
        <div className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-5">
            {/* Progress line container - positioned to align with dot centers */}
            <div className="absolute top-3 bottom-3 left-1/2 -translate-x-1/2 w-1.5 pointer-events-none">
                {/* Background line */}
                <div
                    className="absolute inset-0 bg-gray-300 dark:bg-gray-700 rounded-full"
                />
                {/* Regular sections progress line (red/orange) */}
                <div
                    className="absolute top-0 left-0 right-0 bg-gradient-to-b from-red-500 to-orange-500 rounded-full transition-all duration-300"
                    style={{
                        height: `${allItems.length > 1 ? Math.min(activeIndex / (allItems.length - 1), (allItems.length - 2) / (allItems.length - 1)) * 100 : 0}%`,
                    }}
                />

                {/* Data sources progress line (gray) */}
                <div
                    className="absolute top-0 left-0 right-0 bg-gray-500 dark:bg-gray-400 rounded-full transition-all duration-300"
                    style={{
                        top: `${allItems.length > 1 ? ((allItems.length - 2) / (allItems.length - 1)) * 100 : 0}%`,
                        height: `${allItems.length > 1 ? Math.max(0, (activeIndex / (allItems.length - 1)) * 100 - ((allItems.length - 2) / (allItems.length - 1)) * 100) : 0}%`,
                    }}
                />
            </div>

            {allItems.map((item, index) => {
                const isActive = activeSection === item.id;
                const isPast = index < activeIndex;
                const isCircle = item.isCircle;
                const isSpecial = item.isSpecial;

                return (
                    <div key={item.id} className="relative group flex items-center">
                        <button
                            onClick={() => onSectionClick(item.id)}
                            className={`
                                relative z-10 rounded-full transition-all duration-300
                                focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
                                focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900
                                ${isActive
                                    ? isSpecial
                                        ? 'w-6 h-6 bg-gray-500 dark:bg-gray-400 shadow-lg shadow-gray-500/20'
                                        : isCircle
                                            ? 'w-5 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg shadow-red-500/30'
                                            : 'w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 shadow-lg shadow-red-500/30'
                                    : isPast
                                        ? 'w-5 h-5 bg-gradient-to-r from-red-500 to-orange-500'
                                        : 'w-5 h-5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                }
                            `}
                            aria-label={`Go to ${item.title}`}
                            aria-current={isActive ? 'true' : undefined}
                        />

                        {/* Tooltip */}
                        <div
                            className={`
                                absolute right-full mr-4
                                px-4 py-3 rounded-lg whitespace-nowrap
                                opacity-0 group-hover:opacity-100 pointer-events-none
                                transition-opacity duration-200
                                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                shadow-xl shadow-gray-300/50 dark:shadow-black/30
                                border border-gray-200 dark:border-gray-600
                                ${isActive ? 'ring-2 ring-red-500/50' : ''}
                            `}
                        >
                            <div className="text-sm font-medium">{item.title}</div>
                            <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                                {item.subtitle}
                            </div>
                            {/* Arrow */}
                            <div
                                className="
                                    absolute left-full top-1/2 -translate-y-1/2
                                    border-8 border-transparent
                                    border-l-gray-200 dark:border-l-gray-600
                                "
                            />
                            {/* Inner arrow to match background */}
                            <div
                                className="
                                    absolute left-full top-1/2 -translate-y-1/2 -ml-[1px]
                                    border-8 border-transparent
                                    border-l-white dark:border-l-gray-800
                                "
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default SideProgressBar;
