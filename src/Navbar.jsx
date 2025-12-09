import { Menu, X, Moon, Sun } from 'lucide-react';

function Navbar({ isDark, setIsDark, sections, onSectionClick, isMenuOpen, setIsMenuOpen }) {
    return (
        <nav className={`sticky top-0 z-50 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-lg`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-500 to-unige-blu bg-clip-text text-transparent">
                        Syrian Civil War
                    </h1>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex gap-1">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => onSectionClick(section.id)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isDark
                                    ? 'hover:bg-gray-700 text-gray-300'
                                    : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {section.title}
                            </button>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                            aria-label="Toggle dark mode"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className={`lg:hidden pb-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => onSectionClick(section.id)}
                                className={`block w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${isDark
                                    ? 'hover:bg-gray-700 text-gray-300'
                                    : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {section.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
