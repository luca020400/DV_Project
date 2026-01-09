import { useState, useEffect, useCallback, useRef } from 'react';

import { useDarkMode } from './util/DarkMode';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataProviderContext';

import { sections } from './text/sections.js';

import NavBar from './NavBar.jsx';
import Footer from './Footer.jsx';
import Content from './Content.jsx';
import BackToTopButton from './BackToTopButton.jsx';
import SideProgressBar from './SideProgressBar.jsx';
import GuidedTour from './GuidedTour.jsx';

// Constants
const SCROLL_TO_TOP_THRESHOLD = 400;
const OBSERVER_ROOT_MARGIN = '-50% 0px -50% 0px';
const SCROLL_THROTTLE_DELAY = 150;

function ScrollTracker() {
    const [showBackToTop, setShowBackToTop] = useState(() =>
        window.scrollY > SCROLL_TO_TOP_THRESHOLD
    );
    const scrollThrottleRef = useRef(null);

    const handleScroll = useCallback(() => {
        setShowBackToTop(window.scrollY > SCROLL_TO_TOP_THRESHOLD);
    }, []);

    useEffect(() => {
        const throttledScroll = () => {
            if (scrollThrottleRef.current) return;

            scrollThrottleRef.current = true;
            handleScroll();

            setTimeout(() => {
                scrollThrottleRef.current = false;
                handleScroll();
            }, SCROLL_THROTTLE_DELAY);
        };

        window.addEventListener('scroll', throttledScroll);
        return () => window.removeEventListener('scroll', throttledScroll);
    }, [handleScroll]);

    return <BackToTopButton isVisible={showBackToTop} />;
}

function ProgressTracker({ onTourClick, highlightTour }) {
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: OBSERVER_ROOT_MARGIN,
            threshold: 0
        };

        const observerCallback = (entries) => {
            const intersectingSection = entries.find(entry => entry.isIntersecting);
            if (intersectingSection) {
                setActiveSection(intersectingSection.target.id);
            }
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        sections.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, []);

    // Handle edge cases: scrolled above first or below last section
    useEffect(() => {
        const handleEdgeCases = () => {
            const firstElement = document.getElementById(sections[0]?.id);
            const lastElement = document.getElementById(sections[sections.length - 1]?.id);

            if (!firstElement || !lastElement) return;

            const firstRect = firstElement.getBoundingClientRect();
            const lastRect = lastElement.getBoundingClientRect();
            const viewportCenter = window.innerHeight / 2;

            // If first section is below viewport center, we're above all sections (show intro)
            if (firstRect.top > viewportCenter) {
                setActiveSection('intro');
            }

            // If last section is above viewport center, we're below all sections (show last)
            else if (lastRect.bottom < viewportCenter) {
                setActiveSection(sections[sections.length - 1].id);
            }
        };

        handleEdgeCases();

        window.addEventListener('scroll', handleEdgeCases);
        return () => window.removeEventListener('scroll', handleEdgeCases);
    }, []);

    const scrollToSection = useCallback((sectionId) => {
        if (sectionId === 'intro') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, []);

    return (
        <>
            <NavBar
                sections={sections}
                activeSection={activeSection}
                onSectionClick={scrollToSection}
                onTourClick={onTourClick}
                highlightTour={highlightTour}
            />

            <SideProgressBar
                sections={sections}
                activeSection={activeSection}
                onSectionClick={scrollToSection}
            />
        </>
    );
}

export default function SyrianWarDashboard() {
    const [isDark, setIsDark] = useDarkMode();
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [hasSeenTour, setHasSeenTour] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('hasSeenTour') === 'true';
        }
        return false;
    });

    const handleTourOpen = () => {
        setIsTourOpen(true);
        if (!hasSeenTour) {
            setHasSeenTour(true);
            localStorage.setItem('hasSeenTour', 'true');
        }
    };

    return (
        <ThemeProvider isDark={isDark} setIsDark={setIsDark}>
            <DataProvider>
                <GuidedTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />

                <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    <ProgressTracker
                        onTourClick={handleTourOpen}
                        highlightTour={!hasSeenTour}
                    />

                    <Content sections={sections} />

                    <ScrollTracker />

                    <Footer />
                </div>
            </DataProvider>
        </ThemeProvider>
    );
}
