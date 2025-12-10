import { useState, useEffect, useCallback, useRef } from 'react';

import { useDarkMode } from './util/DarkMode';

import { sections } from './data/sectionsData';
import { dataSources } from "./data/dataSources";

import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import Content from './Content.jsx';
import BackToTopButton from './BackToTopButton.jsx';

// Constants
const SCROLL_TO_TOP_THRESHOLD = 400;
const OBSERVER_ROOT_MARGIN = '-50% 0px -50% 0px';
const SCROLL_THROTTLE_DELAY = 150;

export default function SyrianWarDashboard() {
    const [isDark, setIsDark] = useDarkMode();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const scrollThrottleRef = useRef(null);

    // Throttled scroll handler
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
            }, SCROLL_THROTTLE_DELAY);
        };

        handleScroll();
        window.addEventListener('scroll', throttledScroll);
        return () => window.removeEventListener('scroll', throttledScroll);
    }, [handleScroll]);

    // Intersection observer for active section tracking
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

    const scrollToSection = useCallback((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    }, []);

    return (
        <div className={isDark ? 'dark' : ''}>
            <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
                <Navbar
                    isDark={isDark}
                    setIsDark={setIsDark}
                    sections={sections}
                    activeSection={activeSection}
                    onSectionClick={scrollToSection}
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                />

                <Content isDark={isDark} sections={sections} dataSources={dataSources} />

                <BackToTopButton isDark={isDark} isVisible={showBackToTop} />

                <Footer isDark={isDark} />
            </div>
        </div>
    );
}
