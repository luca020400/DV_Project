import { useState } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';

function Navbar({ sections, activeSection, onSectionClick }) {
    const { isDark, setIsDark } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSectionClick = (sectionId) => {
        onSectionClick(sectionId);
        setIsMenuOpen(false);
    };

    const getButtonClass = (sectionId, isBlock = false) => {
        const baseClass = `px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${isBlock ? 'block w-full text-left' : ''}`;
        const activeClass = activeSection === sectionId ? 'bg-red-500 text-white' : '';
        const inactiveClass = activeSection !== sectionId
            ? isDark
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-100'
            : '';
        return `${baseClass} ${activeClass} ${inactiveClass}`;
    };

    const activeTitle = sections.find(s => s.id === activeSection)?.title;

    return (
        <nav className={`sticky top-0 z-50 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-lg`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                            Syrian Civil War
                        </h1>
                    </div>

                    {/* Current section indicator - desktop only, centered */}
                    {activeTitle && (
                        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center">
                            <span className={`text-xl font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {activeTitle}
                            </span>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                            aria-label="Toggle dark mode"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className={`lg:hidden absolute top-full left-0 w-full border-b shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-4">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => handleSectionClick(section.id)}
                                    className={getButtonClass(section.id, true)}
                                >
                                    {section.title}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
