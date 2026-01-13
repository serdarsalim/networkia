"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Theme = "light" | "dark";

export default function CharacterDemo() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              theme === "light"
                ? "hover:bg-gray-100 text-gray-700"
                : "hover:bg-gray-800 text-gray-300"
            }`}
          >
            ← Back to Contacts
          </Link>
          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-lg transition-colors text-xl ${
              theme === "light"
                ? "bg-gray-200 hover:bg-gray-300"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Hero Card - Character centered */}
        <div
          className={`rounded-xl p-8 mb-6 border-2 ${
            theme === "light"
              ? "bg-white border-gray-300"
              : "bg-gray-800 border-gray-700"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            {/* Character Photo */}
            <div
              className={`w-32 h-32 rounded-full mb-4 border-4 ${
                theme === "light" ? "border-blue-500" : "border-cyan-500"
              } overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500`}
            >
              <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold">
                SC
              </div>
            </div>

            {/* Name and Title */}
            <div className="mb-2">
              <h1 className="text-3xl font-bold mb-1">Sarah Chen</h1>
              <p
                className={`text-lg ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                }`}
              >
                Product Manager
              </p>
              <p
                className={`text-sm ${
                  theme === "light" ? "text-gray-500" : "text-gray-500"
                }`}
              >
                📍 San Francisco, CA
              </p>
            </div>

            {/* Level Badge */}
            <div
              className={`absolute top-8 right-8 px-3 py-1 rounded-full text-sm font-bold ${
                theme === "light"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-cyan-900 text-cyan-200"
              }`}
            >
              Lv. 8
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Network
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Tech
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Climate
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                Friend
              </span>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Stats */}
          <div className="space-y-6">
            {/* Contact Info Panel */}
            <div
              className={`rounded-xl p-6 border-2 ${
                theme === "light"
                  ? "bg-white border-gray-300"
                  : "bg-gray-800 border-gray-700"
              }`}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider mb-4 text-gray-500">
                Contact Info
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">📧 Email</div>
                  <div className="text-sm font-medium">
                    sarah.chen@tesla.com
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">📞 Phone</div>
                  <div className="text-sm font-medium">+1 (555) 123-4567</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">💼 Company</div>
                  <div className="text-sm font-medium">Tesla</div>
                  <div className="text-xs text-gray-500">
                    Climate Tech Division
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">🌐 LinkedIn</div>
                  <div className="text-sm font-medium text-blue-600">
                    /in/sarahchen
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Panel */}
            <div
              className={`rounded-xl p-6 border-2 ${
                theme === "light"
                  ? "bg-white border-gray-300"
                  : "bg-gray-800 border-gray-700"
              }`}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider mb-4 text-gray-500">
                Quick Stats
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">⏰ Added</span>
                  <span className="text-sm font-medium">Jan 15, 2023</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">🔄 Last Contact</span>
                  <span className="text-sm font-medium">3 days ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">📊 Interactions</span>
                  <span className="text-sm font-medium">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">📅 Known for</span>
                  <span className="text-sm font-medium">1.2 years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">⭐ Connection</span>
                  <span className="text-sm font-medium text-green-600">
                    Strong
                  </span>
                </div>
              </div>
              <button
                className={`mt-4 w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  theme === "light"
                    ? "bg-gray-100 hover:bg-gray-200"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                View Analytics
              </button>
            </div>
          </div>

          {/* Right Main Area - Character Bio */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Impression Panel */}
            <div
              className={`rounded-xl p-6 border-2 ${
                theme === "light"
                  ? "bg-white border-gray-300"
                  : "bg-gray-800 border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  My Impression
                </h2>
                <button
                  className={`text-sm px-3 py-1 rounded-lg ${
                    theme === "light"
                      ? "text-blue-600 hover:bg-blue-50"
                      : "text-cyan-400 hover:bg-gray-700"
                  }`}
                >
                  Edit
                </button>
              </div>
              <div
                className={`text-sm leading-relaxed ${
                  theme === "light" ? "text-gray-700" : "text-gray-300"
                }`}
              >
                <p className="mb-3">
                  Super passionate about climate tech. Always has interesting
                  startup ideas but can be a bit all-over-the-place with
                  execution.
                </p>
                <p className="mb-3">
                  Great listener and gives honest feedback without
                  sugarcoating. Can be intense when talking about work stuff,
                  but that's what makes conversations interesting.
                </p>
                <p>
                  One of the smartest people I know. Worth keeping in close
                  contact for both personal friendship and professional
                  collaboration opportunities.
                </p>
              </div>
            </div>

            {/* Background & Notes Panel */}
            <div
              className={`rounded-xl p-6 border-2 ${
                theme === "light"
                  ? "bg-white border-gray-300"
                  : "bg-gray-800 border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Background & Notes
                </h2>
                <button
                  className={`text-sm px-3 py-1 rounded-lg ${
                    theme === "light"
                      ? "text-blue-600 hover:bg-blue-50"
                      : "text-cyan-400 hover:bg-gray-700"
                  }`}
                >
                  Edit
                </button>
              </div>
              <div
                className={`text-sm space-y-4 ${
                  theme === "light" ? "text-gray-700" : "text-gray-300"
                }`}
              >
                <div>
                  <h3 className="font-semibold mb-2">How We Met</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Met at TechCrunch Disrupt 2023</li>
                    <li>Previously worked at Google as PM (5 years)</li>
                    <li>Stanford CS grad, Class of 2015</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Family</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Married to David (software engineer at Stripe)</li>
                    <li>2 kids: Emma (5), Noah (3)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Interests</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Hiking - does weekend trips to Yosemite</li>
                    <li>Climate activism and sustainability</li>
                    <li>Reading sci-fi novels (big fan of Kim Stanley Robinson)</li>
                    <li>Specialty coffee enthusiast</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Interaction Log Panel */}
            <div
              className={`rounded-xl p-6 border-2 ${
                theme === "light"
                  ? "bg-white border-gray-300"
                  : "bg-gray-800 border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Interaction Log
                </h2>
                <button
                  className={`text-sm px-4 py-2 rounded-lg font-medium ${
                    theme === "light"
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-cyan-600 hover:bg-cyan-500 text-white"
                  }`}
                >
                  + Add New
                </button>
              </div>

              <div className="space-y-4">
                {/* Interaction Entry 1 */}
                <div
                  className={`p-4 rounded-lg border ${
                    theme === "light"
                      ? "bg-gray-50 border-gray-200"
                      : "bg-gray-900 border-gray-700"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚔️</span>
                      <div>
                        <div className="font-semibold text-sm">
                          Coffee Meeting
                        </div>
                        <div className="text-xs text-gray-500">
                          Jan 10, 2024
                        </div>
                      </div>
                    </div>
                    <button
                      className={`text-xs px-2 py-1 rounded ${
                        theme === "light"
                          ? "text-blue-600 hover:bg-blue-50"
                          : "text-cyan-400 hover:bg-gray-800"
                      }`}
                    >
                      Edit
                    </button>
                  </div>
                  <p
                    className={`text-sm ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    Caught up on her new role at Tesla. She's leading the
                    charging infrastructure project and is super excited about
                    it. Discussed potential collaboration on a climate tech side
                    project.
                  </p>
                </div>

                {/* Interaction Entry 2 */}
                <div
                  className={`p-4 rounded-lg border ${
                    theme === "light"
                      ? "bg-gray-50 border-gray-200"
                      : "bg-gray-900 border-gray-700"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚔️</span>
                      <div>
                        <div className="font-semibold text-sm">
                          Dinner at Mission Chinese
                        </div>
                        <div className="text-xs text-gray-500">Dec 5, 2023</div>
                      </div>
                    </div>
                    <button
                      className={`text-xs px-2 py-1 rounded ${
                        theme === "light"
                          ? "text-blue-600 hover:bg-blue-50"
                          : "text-cyan-400 hover:bg-gray-800"
                      }`}
                    >
                      Edit
                    </button>
                  </div>
                  <p
                    className={`text-sm ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    Celebrated her promotion! She recommended "The Ministry for
                    the Future" book. Had a long conversation about AI ethics
                    and climate models.
                  </p>
                </div>

                {/* Interaction Entry 3 */}
                <div
                  className={`p-4 rounded-lg border ${
                    theme === "light"
                      ? "bg-gray-50 border-gray-200"
                      : "bg-gray-900 border-gray-700"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚔️</span>
                      <div>
                        <div className="font-semibold text-sm">
                          Quick phone call
                        </div>
                        <div className="text-xs text-gray-500">Nov 2, 2023</div>
                      </div>
                    </div>
                    <button
                      className={`text-xs px-2 py-1 rounded ${
                        theme === "light"
                          ? "text-blue-600 hover:bg-blue-50"
                          : "text-cyan-400 hover:bg-gray-800"
                      }`}
                    >
                      Edit
                    </button>
                  </div>
                  <p
                    className={`text-sm ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    She asked for feedback on her Tesla offer. Discussed
                    pros/cons of moving from Google. I recommended taking it -
                    seemed like a great opportunity for her.
                  </p>
                </div>

                {/* Load More */}
                <button
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                    theme === "light"
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  }`}
                >
                  Load More History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
