function TableOfContents({ sections, activeSection, onSectionClick, onClose }) {
    return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-xl max-h-[70vh] overflow-y-auto border-2 border-gray-200 dark:border-gray-700">
            <div className="sticky top-0 bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
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
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeSection === section.id
                                ? 'bg-red-500 dark:bg-red-600 text-white font-semibold'
                                : `hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300`
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${activeSection === section.id
                                    ? 'bg-white text-red-500'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}>
                                {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold">{section.title}</p>
                                <p className={`text-sm ${activeSection === section.id ? 'text-red-100' : 'text-gray-700 dark:text-gray-300'}`}>
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
