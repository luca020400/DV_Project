import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';



import { steps } from './text/steps';

function GuidedTour({ isOpen, onClose }) {
    const [currentStep, setCurrentStep] = useState(0);

    // Handle body overflow and reset step
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Reset to first step when modal opens
    useEffect(() => {
        if (isOpen) {
            queueMicrotask(() => setCurrentStep(0));
        }
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
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full sm:w-96 border-2 border-blue-400 dark:border-blue-500"
                >
                    {/* Header */}
                    <div className="bg-blue-100 dark:bg-blue-600 p-4 sm:p-5 flex justify-between items-start">
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-700 dark:text-blue-100">
                                Step {currentStep + 1} of {steps.length}
                            </p>
                            <h3 className="text-lg sm:text-xl font-bold mt-1 text-gray-900 dark:text-white">{step.title}</h3>
                        </div>
                        <button
                            onClick={handleFinish}
                            className="flex-shrink-0 ml-3 transition-colors text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-gray-100"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5">
                        <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                            {step.description}
                        </p>
                    </div>

                    {/* Footer - Controls */}
                    <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 sm:p-5 flex justify-between items-center gap-3">
                        {/* Progress dots */}
                        <div className="flex gap-1.5">
                            {steps.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentStep(idx)}
                                    className={`h-2 rounded-full transition-all ${idx === currentStep ? 'bg-blue-500 dark:bg-blue-400 w-6' : 'bg-gray-400 dark:bg-gray-500 w-2'}`}
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
                                    ? 'text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
                                    : 'text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
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
