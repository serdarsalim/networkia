"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Theme = "light" | "dark";

type Contact = {
  id: string;
  initials: string;
  name: string;
  tags: string[];
  lastContact: string;
  daysAgo: number;
  status?: "overdue" | "today" | "upcoming";
  daysOverdue?: number;
};

export default function Dashboard() {
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

  const overdueContacts: Contact[] = [
    {
      id: "1",
      initials: "SC",
      name: "Sarah Chen",
      tags: ["Close Friend"],
      lastContact: "Dec 1",
      daysAgo: 43,
      status: "overdue",
      daysOverdue: 5,
    },
    {
      id: "2",
      initials: "MJ",
      name: "Mike Johnson",
      tags: ["Work"],
      lastContact: "Jan 8",
      daysAgo: 5,
      status: "overdue",
      daysOverdue: 2,
    },
    {
      id: "3",
      initials: "ED",
      name: "Emma Davis",
      tags: ["Family"],
      lastContact: "Dec 20",
      daysAgo: 24,
      status: "today",
    },
  ];

  const allContacts: Contact[] = [
    {
      id: "4",
      initials: "EN",
      name: "Edward Norton",
      tags: ["Film", "Environment"],
      lastContact: "Jan 10",
      daysAgo: 3,
    },
    {
      id: "5",
      initials: "DB",
      name: "Dan Brown",
      tags: ["Acquaintance", "Conference"],
      lastContact: "Jan 13",
      daysAgo: 0,
    },
    {
      id: "1",
      initials: "SC",
      name: "Sarah Chen",
      tags: ["Close Friend", "Tech"],
      lastContact: "Dec 1",
      daysAgo: 43,
      status: "overdue",
    },
  ];

  const circles = [
    { name: "Close Friends", count: 24 },
    { name: "Family", count: 18 },
    { name: "Work", count: 89 },
    { name: "Acquaintances", count: 114 },
  ];

  const recentActivity = [
    { text: "Added note to Edward Norton", time: "2h ago" },
    { text: "Met Dan Brown at conference", time: "5h ago" },
    { text: "Updated Sarah Chen profile", time: "1d ago" },
    { text: "Coffee with Mike", time: "3d ago" },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 transition-colors duration-300">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <h1
            className={`text-3xl font-bold ${
              theme === "light" ? "text-gray-900" : "text-gray-100"
            }`}
          >
            Networkia
          </h1>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="🔍 Search..."
              className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                theme === "light"
                  ? "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
                  : "border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400 focus:border-cyan-500"
              } focus:outline-none`}
            />
            <button
              onClick={toggleTheme}
              className={`px-4 py-2 rounded-lg transition-all duration-200 text-xl ${
                theme === "light"
                  ? "bg-gray-100 hover:bg-gray-200 hover:scale-105"
                  : "bg-gray-800 hover:bg-gray-700 hover:scale-105"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                theme === "light"
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-cyan-600 hover:bg-cyan-500 text-white"
              }`}
            >
              + New
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* All Contacts */}
          <div
            className={`rounded-2xl p-6 border transition-all duration-300 ${
              theme === "light"
                ? "bg-white border-gray-200 shadow-sm"
                : "bg-gray-800 border-gray-700 shadow-xl"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-xs font-bold uppercase tracking-wider ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                👥 All Contacts
              </h2>
              <select
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 ${
                  theme === "light"
                    ? "border-gray-300 bg-white text-gray-900"
                    : "border-gray-600 bg-gray-800 text-gray-100"
                } focus:outline-none`}
              >
                <option>Sort: Last Contact</option>
                <option>Sort: Name</option>
                <option>Sort: Added Date</option>
              </select>
            </div>

            {/* Filter */}
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Show:
              </span>
              <button
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  theme === "light"
                    ? "bg-blue-500 text-white"
                    : "bg-cyan-600 text-white"
                }`}
              >
                All
              </button>
              <button
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  theme === "light"
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Overdue
              </button>
              <div
                className={`h-3 w-px ${
                  theme === "light" ? "bg-gray-300" : "bg-gray-600"
                }`}
              ></div>
              <button
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  theme === "light"
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Close
              </button>
              <button
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  theme === "light"
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Work
              </button>
              <button
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  theme === "light"
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Family
              </button>
            </div>

            {/* Contact List */}
            <div className="space-y-2">
              {allContacts.map((contact) => (
                <Link
                  key={contact.id}
                  href="/chardemo2"
                  className={`block p-3 rounded-xl transition-all duration-200 ${
                    theme === "light"
                      ? "hover:bg-gray-50"
                      : "hover:bg-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          theme === "light"
                            ? "bg-gradient-to-br from-blue-400 to-purple-500"
                            : "bg-gradient-to-br from-blue-500 to-purple-600"
                        }`}
                      >
                        {contact.initials}
                      </div>
                      <div>
                        <div
                          className={`font-semibold text-sm mb-0.5 ${
                            theme === "light" ? "text-gray-900" : "text-gray-100"
                          }`}
                        >
                          {contact.name}
                        </div>
                        <div className="flex items-center gap-2">
                          {contact.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className={`text-xs ${
                                theme === "light"
                                  ? "text-gray-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {tag}
                              {idx < contact.tags.length - 1 && " • "}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`text-xs ${
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        {contact.lastContact}
                      </div>
                      {contact.status === "overdue" && (
                        <div className="text-base">🔴</div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div
            className={`rounded-2xl p-5 border transition-all duration-300 h-fit ${
              theme === "light"
                ? "bg-white border-gray-200 shadow-sm"
                : "bg-gray-800 border-gray-700 shadow-xl"
            }`}
          >
            <h2
              className={`text-xs font-bold uppercase tracking-wider mb-4 ${
                theme === "light" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              📝 Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className={`text-sm ${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  }`}
                >
                  {activity.text}{" "}
                  <span
                    className={`${
                      theme === "light" ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    - {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className={`mt-16 border-t ${
          theme === "light"
            ? "bg-gray-50 border-gray-200"
            : "bg-gray-900 border-gray-800"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              <a
                href="#"
                className={`text-sm transition-colors ${
                  theme === "light"
                    ? "text-gray-600 hover:text-blue-600"
                    : "text-gray-400 hover:text-cyan-400"
                }`}
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className={`text-sm transition-colors ${
                  theme === "light"
                    ? "text-gray-600 hover:text-blue-600"
                    : "text-gray-400 hover:text-cyan-400"
                }`}
              >
                Terms of Service
              </a>
            </div>
            <p
              className={`text-xs ${
                theme === "light" ? "text-gray-500" : "text-gray-500"
              }`}
            >
              © 2026 Networkia. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
