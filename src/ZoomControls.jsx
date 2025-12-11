import { useTheme } from './contexts/ThemeContext';

function ZoomControls({ zoom, defaultZoom, onZoomIn, onZoomOut, onReset }) {
    const { isDark } = useTheme();

    return (
        <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
                onClick={onZoomOut}
                disabled={zoom <= 0.5}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark
                    ? 'bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-100'
                    : 'bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900'
                    }`}
                title="Zoom Out"
            >
                − Zoom Out
            </button>

            <div className={`px-4 py-2 rounded-lg font-medium min-w-24 text-center ${isDark ? 'bg-gray-700 text-gray-100' : 'bg-gray-300 text-gray-900'
                }`}>
                {Math.round(zoom * 100)}%
            </div>

            <button
                onClick={onZoomIn}
                disabled={zoom >= 2}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark
                    ? 'bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-100'
                    : 'bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900'
                    }`}
                title="Zoom In"
            >
                + Zoom In
            </button>

            <button
                onClick={onReset}
                disabled={zoom === defaultZoom}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark
                    ? 'bg-blue-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-100'
                    : 'bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white'
                    }`}
                title="Reset Zoom"
            >
                ↺ Reset
            </button>
        </div>
    );
}

export default ZoomControls;
