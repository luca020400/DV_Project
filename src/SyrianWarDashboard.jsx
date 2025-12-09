import { useState, useEffect } from 'react';

import { useDarkMode } from './util/DarkMode.js';

import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import Content from './Content.jsx';
import BackToTopButton from './BackToTopButton.jsx';

export default function SyrianWarDashboard() {
    const [isDark, setIsDark] = useDarkMode();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [activeSection, setActiveSection] = useState('');

    const sections = [
        { id: 'section1', title: 'Casualties Overview' },
        { id: 'section2', title: 'Displacement Crisis' },
        { id: 'section3', title: 'Regional Conflict' },
        { id: 'section4', title: 'Economic Impact' },
        { id: 'section5', title: 'Timeline Analysis' }
    ];

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };

        handleScroll();

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        sections.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => {
            observer.disconnect();
        };
    }, [sections]);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    };

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

                <Content isDark={isDark} sections={sections} />

                <BackToTopButton isDark={isDark} isVisible={showBackToTop} />

                <Footer isDark={isDark} />
            </div>
        </div>
    );
}
