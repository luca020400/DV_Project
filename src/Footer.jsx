import { useTheme } from './contexts/ThemeContext';

function Footer() {
    const { isDark } = useTheme();

    return (
        <footer className={`py-12 border-t ${isDark ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900' : 'border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100'}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="text-center md:text-left">
                        <h3 className={`font-semibold text-lg mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                            Data Visualization Project
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Academic year 2025/2026
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            University of Genoa
                        </p>
                    </div>
                    <div className="text-center md:text-right">
                        <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                            Luca Stefani
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Student ID: S5163797
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
