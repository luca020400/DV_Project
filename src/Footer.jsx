function Footer() {
    return (
        <footer className="py-12 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 dark:from-gray-800 to-gray-100 dark:to-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="text-center md:text-left">
                        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                            Data Visualization Project
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Academic year 2025/2026
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            University of Genoa
                        </p>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                            Luca Stefani
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Student ID: S5163797
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
