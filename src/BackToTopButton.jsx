import { ChevronUp } from 'lucide-react';

function BackToTopButton({ isVisible }) {
    if (!isVisible) return null;

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 rounded-full shadow-lg transition-all hover:scale-110 bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white"
            aria-label="Back to top"
        >
            <ChevronUp size={24} />
        </button>
    );
}

export default BackToTopButton;
