function Footer({ isDark }) {
    return (
        <footer className={`mt-16 py-8 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    © 2025 Syrian Civil War Analysis. Data-driven visualization project.
                </p>
            </div>
        </footer>
    );
}

export default Footer;
