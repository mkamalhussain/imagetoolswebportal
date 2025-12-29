"use client";

import Link from 'next/link';
import { modules } from '../../data/modules';
import { audioModules } from '../../data/audioModules';
import { videoModules } from '../../data/videoModules';
import { pdfModules } from '../../data/pdfModules';

export default function HowToClient() {
  // Combine all modules from different categories
  const allTools = [
    ...modules.map(module => ({ ...module, category: 'Image Tools' })),
    ...audioModules.map(module => ({ ...module, category: 'Audio Tools' })),
    ...videoModules.map(module => ({ ...module, category: 'Video Tools' })),
    ...pdfModules.map(module => ({ ...module, category: 'PDF Tools' })),
  ];

  // Group tools by category
  const toolsByCategory = allTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof allTools>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Google AdSense Top Banner */}
        <div className="w-full max-w-4xl mb-16">
          <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
            <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">728x90 Banner Ad</p>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How To Guides
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Master our image, audio, video, and PDF tools with step-by-step guides,
            tips, and visual examples. Learn how to use each tool effectively.
          </p>
        </div>

        {/* Tool Categories */}
        {Object.entries(toolsByCategory).map(([category, tools]) => (
          <div key={category} className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/how-to/${tool.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: tool.icon || '' }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {tool.description}
                      </p>
                      <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300">
                        Learn how to use →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Google AdSense Middle Banner */}
        <div className="w-full max-w-4xl mx-auto my-16">
          <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
            <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">728x90 Banner Ad</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Try Our Tools?</h2>
          <p className="text-lg mb-6 opacity-90">
            Now that you know how to use them, head back and start creating amazing content!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 transition-colors"
            >
              Explore Tools
            </Link>
            <Link
              href="/modules"
              className="inline-flex items-center px-6 py-3 border border-white/20 text-base font-medium rounded-md text-white bg-white/10 hover:bg-white/20 transition-colors"
            >
              All Tools
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
