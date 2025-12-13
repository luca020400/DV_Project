import { useTheme } from './contexts/ThemeContext';
import { getBgClass, getTextClass } from './contents/themeUtils';

function TableOfContents({ sections, activeSection, onSectionClick, onClose }) {
    const { isDark } = useTheme();

    return (
        <div className={`${getBgClass(isDark)} rounded-lg shadow-xl max-h-[70vh] overflow-y-auto border-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`sticky top-0 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className="text-lg font-bold">Table of Contents</h3>
            </div>

            <div className="p-4 space-y-2">
                {sections.map((section, idx) => (
                    <button
                        key={section.id}
                        onClick={() => {
                            onSectionClick(section.id);
                            onClose();
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                            activeSection === section.id
                                ? `${isDark ? 'bg-red-600' : 'bg-red-500'} text-white font-semibold`
                                : `${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} ${getTextClass(isDark)}`
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                                activeSection === section.id
                                    ? 'bg-white text-red-500'
                                    : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}>
                                {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold">{section.title}</p>
                                <p className={`text-sm ${activeSection === section.id ? 'text-red-100' : getTextClass(isDark)}`}>
                                    {section.subtitle}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default TableOfContents;
