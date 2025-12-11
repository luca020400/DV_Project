import { useTheme } from './contexts/ThemeContext';

function SideProgressBar({ sections, activeSection, onSectionClick }) {
    const { isDark } = useTheme();

    const activeIndex = sections.findIndex(s => s.id === activeSection);

    return (
        <div className="hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-5">
            {/* Progress line container - positioned to align with dot centers */}
            <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-1.5 pointer-events-none">
                {/* Background line */}
                <div
                    className={`absolute inset-0 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded-full`}
                />
                {/* Filled progress line */}
                <div
                    className="absolute top-0 left-0 right-0 bg-gradient-to-b from-red-500 to-orange-500 rounded-full transition-all duration-300"
                    style={{
                        height: `${sections.length > 1 ? (activeIndex / (sections.length - 1)) * 100 : 0}%`,
                    }}
                />
            </div>

            {sections.map((section, index) => {
                const isActive = activeSection === section.id;
                const isPast = index < activeIndex;

                return (
                    <div key={section.id} className="relative group flex items-center">
                        <button
                            onClick={() => onSectionClick(section.id)}
                            className={`
                                relative z-10 rounded-full transition-all duration-300
                                focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
                                ${isDark ? 'focus-visible:ring-offset-gray-900' : 'focus-visible:ring-offset-white'}
                                ${isActive
                                    ? 'w-7 h-7 bg-gradient-to-r from-red-500 to-orange-500 shadow-lg shadow-red-500/30'
                                    : isPast
                                        ? 'w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500'
                                        : isDark
                                            ? 'w-6 h-6 bg-gray-600 hover:bg-gray-500'
                                            : 'w-6 h-6 bg-gray-300 hover:bg-gray-400'
                                }
                            `}
                            aria-label={`Go to ${section.title}`}
                            aria-current={isActive ? 'true' : undefined}
                        />

                        {/* Tooltip */}
                        <div
                            className={`
                                absolute left-full ml-4
                                px-4 py-2 rounded-lg text-base font-medium whitespace-nowrap
                                opacity-0 group-hover:opacity-100 pointer-events-none
                                transition-opacity duration-200
                                ${isDark
                                    ? 'bg-gray-800 text-gray-100 shadow-xl shadow-black/30 border border-gray-600'
                                    : 'bg-white text-gray-900 shadow-xl shadow-gray-300/50 border border-gray-200'
                                }
                                ${isActive ? 'ring-2 ring-red-500/50' : ''}
                            `}
                        >
                            {section.title}
                            {/* Arrow */}
                            <div
                                className={`
                                    absolute right-full top-1/2 -translate-y-1/2
                                    border-8 border-transparent
                                    ${isDark ? 'border-r-gray-600' : 'border-r-gray-200'}
                                `}
                            />
                            {/* Inner arrow to match background */}
                            <div
                                className={`
                                    absolute right-full top-1/2 -translate-y-1/2 ml-[1px]
                                    border-8 border-transparent
                                    ${isDark ? 'border-r-gray-800' : 'border-r-white'}
                                `}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default SideProgressBar;
