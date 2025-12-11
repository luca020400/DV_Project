// Shared theme utility functions for dark/light mode styling

export const getBgClass = (isDark) => isDark ? 'bg-gray-800' : 'bg-gray-50';
export const getTextClass = (isDark) => isDark ? 'text-gray-300' : 'text-gray-700';
export const getCardBgClass = (isDark) => isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200';
