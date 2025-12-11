import { useState, useEffect, useCallback, useRef } from 'react';

import { useDarkMode } from './util/DarkMode';
import { ThemeProvider } from './contexts/ThemeContext';

import { sections } from './text/sections.js';
import { sources } from "./text/sources.js";
import { hero } from './text/hero.js';
import dataRegistry from './data/DataRegistry.js';

import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import Content from './Content.jsx';
import BackToTopButton from './BackToTopButton.jsx';
import SideProgressTracker from './SideProgressTracker.jsx';

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
                handleScroll();
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

    // Handle edge cases: scrolled above first or below last section
    useEffect(() => {
        const handleEdgeCases = () => {
            const firstElement = document.getElementById(sections[0]?.id);
            const lastElement = document.getElementById(sections[sections.length - 1]?.id);

            const firstRect = firstElement.getBoundingClientRect();
            const lastRect = lastElement.getBoundingClientRect();
            const viewportCenter = window.innerHeight / 2;

            // If first section is below viewport center, we're above all sections
            if (firstRect.top > viewportCenter) {
                setActiveSection(sections[0].id);
            }

            // If last section is above viewport center, we're below all sections
            else if (lastRect.bottom < viewportCenter) {
                setActiveSection(sections[sections.length - 1].id);
            }
        };

        handleEdgeCases();

        window.addEventListener('scroll', handleEdgeCases);
        return () => window.removeEventListener('scroll', handleEdgeCases);
    }, []);

    // Fetch all visualization data on component mount
    useEffect(() => {
        // TODO: Replace empty dict with actual API endpoint URLs
        // Example: dataRegistry.fetchAllData({
        //   casualtyTrendData: 'https://api.example.com/casualties',
        //   displacementData: 'https://api.example.com/displacement',
        //   ...
        // })
        dataRegistry.fetchAllData({});
    }, []);

    const scrollToSection = useCallback((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    }, []);

    return (
        <ThemeProvider isDark={isDark} setIsDark={setIsDark}>
            <div className={isDark ? 'dark' : ''}>
                <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
                    <Navbar
                        sections={sections}
                        activeSection={activeSection}
                        onSectionClick={scrollToSection}
                        isMenuOpen={isMenuOpen}
                        setIsMenuOpen={setIsMenuOpen}
                    />

                    <Content sections={sections} sources={sources} hero={hero} />

                    <SideProgressTracker
                        sections={sections}
                        activeSection={activeSection}
                        onSectionClick={scrollToSection}
                    />

                    <BackToTopButton isVisible={showBackToTop} />

                    <Footer />
                </div>
            </div>
        </ThemeProvider>
    );
}
