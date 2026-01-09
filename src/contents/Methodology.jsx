import { Database, Cog, AlertTriangle } from 'lucide-react';
import { methodology } from '../text/methodology.js';

function Methodology() {
    return (
        <section className="scroll-mt-20" id="methodology">
            <div className="py-16 sm:py-24 bg-white dark:bg-gray-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl sm:text-5xl font-bold mb-6">Methodology</h2>
                    <p className="text-lg sm:text-xl mb-12 max-w-2xl text-gray-600 dark:text-gray-300">
                        Transparency in our data processing approach and acknowledgment of limitations
                    </p>

                    {/* Data Cleaning & Imputation */}
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <h3 className="text-2xl font-bold">{methodology.dataCleaningImputation.title}</h3>
                        </div>
                        <div className="space-y-4">
                            {methodology.dataCleaningImputation.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-6 rounded-xl border-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                >
                                    <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">
                                        {item.source}
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Data Processing & Analysis Pipeline */}
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <Cog className="w-6 h-6 text-green-600 dark:text-green-400" />
                            <h3 className="text-2xl font-bold">{methodology.dataProcessingAnalysis.title}</h3>
                        </div>
                        <div className="relative">
                            {/* Pipeline visualization */}
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-green-200 dark:bg-green-800" />
                            <div className="space-y-6">
                                {methodology.dataProcessingAnalysis.items.map((item, index) => (
                                    <div key={index} className="relative pl-12">
                                        {/* Pipeline node */}
                                        <div className="absolute left-2 top-6 w-5 h-5 rounded-full bg-green-500 dark:bg-green-400 border-4 border-white dark:border-gray-900" />
                                        <div className="p-6 rounded-xl border-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                            <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">
                                                Step {index + 1}: {item.step}
                                            </h4>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Limitations */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            <h3 className="text-2xl font-bold">{methodology.limitations.title}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {methodology.limitations.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-6 rounded-xl border-2 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                                >
                                    <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-2">
                                        {item.type}
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Methodology;
