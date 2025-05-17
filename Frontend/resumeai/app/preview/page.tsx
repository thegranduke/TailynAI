import { useState } from 'react';

export default function Preview() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Left Sidebar - Editor */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Edit Resume
          </h2>

          {/* Projects Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Projects
            </h3>
            <div className="space-y-4">
              {/* Project Item */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <textarea
                  className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
                  rows={4}
                  placeholder="Project description..."
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <button className="text-sm text-red-600 hover:text-red-500">
                    Delete
                  </button>
                  <button className="text-sm text-blue-600 hover:text-blue-500">
                    Replace
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Experience Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Experience
            </h3>
            <div className="space-y-4">
              {/* Experience Item */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <textarea
                  className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
                  rows={4}
                  placeholder="Experience description..."
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <button className="text-sm text-red-600 hover:text-red-500">
                    Delete
                  </button>
                  <button className="text-sm text-blue-600 hover:text-blue-500">
                    Replace
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {/* Skill Tags */}
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full">
                React
              </span>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full">
                TypeScript
              </span>
              {/* Add more skills */}
            </div>
          </div>
        </div>

        {/* Right Side - Resume Preview */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Resume Preview
            </h2>

            {/* Resume Content */}
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  John Doe
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Software Engineer
                </p>
              </div>

              {/* Projects */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Projects
                </h3>
                {/* Project items will be rendered here */}
              </div>

              {/* Experience */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Experience
                </h3>
                {/* Experience items will be rendered here */}
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Skills
                </h3>
                {/* Skills will be rendered here */}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center mt-8">
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Generate Resume PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 