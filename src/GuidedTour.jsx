import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

import { useTheme } from './contexts/ThemeContext';
import { getBgClass, getTextClass } from './contents/themeUtils';

import { steps } from './text/steps';

function GuidedTour({ isOpen, onClose }) {
    const { isDark } = useTheme();
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const step = steps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFinish = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black bg-opacity-60 pointer-events-auto"
                onClick={handleFinish}
            />

            {/* Tour Box - always visible */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[101] pointer-events-auto">
                <div
                    className={`${getBgClass(isDark)} rounded-lg shadow-2xl max-w-md w-full sm:w-96 border-2 ${isDark ? 'border-blue-500' : 'border-blue-400'
                        }`}
                >
                    {/* Header */}
                    <div className={`${isDark ? 'bg-blue-600' : 'bg-blue-100'} p-4 sm:p-5 flex justify-between items-start`}>
                        <div className="flex-1">
                            <p className={`text-sm font-semibold ${isDark ? 'text-blue-100' : 'text-blue-700'}`}>
                                Step {currentStep + 1} of {steps.length}
                            </p>
                            <h3 className={`text-lg sm:text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{step.title}</h3>
                        </div>
                        <button
                            onClick={handleFinish}
                            className={`flex-shrink-0 ml-3 transition-colors ${isDark
                                    ? 'text-white hover:text-gray-100'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5">
                        <p className={`${getTextClass(isDark)} text-sm sm:text-base leading-relaxed`}>
                            {step.description}
                        </p>
                    </div>

                    {/* Footer - Controls */}
                    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-t p-4 sm:p-5 flex justify-between items-center gap-3`}>
                        {/* Progress dots */}
                        <div className="flex gap-1.5">
                            {steps.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentStep(idx)}
                                    className={`h-2 rounded-full transition-all ${isDark
                                            ? idx === currentStep ? 'bg-blue-400 w-6' : 'bg-gray-500 w-2'
                                            : idx === currentStep ? 'bg-blue-500 w-6' : 'bg-gray-400 w-2'
                                        }`}
                                    aria-label={`Go to step ${idx + 1}`}
                                />
                            ))}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrev}
                                disabled={isFirstStep}
                                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium ${isFirstStep
                                        ? isDark
                                            ? 'text-gray-500 bg-gray-700 cursor-not-allowed'
                                            : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                                        : isDark
                                            ? 'text-gray-100 hover:bg-gray-600'
                                            : 'text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <ChevronLeft size={16} />
                                <span className="hidden sm:inline">Back</span>
                            </button>

                            <button
                                onClick={isLastStep ? handleFinish : handleNext}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                            >
                                <span>{isLastStep ? 'Get Started' : 'Next'}</span>
                                {!isLastStep && <ChevronRight size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GuidedTour;
