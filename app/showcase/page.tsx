"use client";

import { useTheme } from "@/app/theme-context";

// Sample data
const checkIns = [
  { name: "Sefa Sener", lastMet: "Last met", time: "Today", nextIn: "" },
  { name: "Oguz Selcuk", lastMet: "Last met", time: "Today", nextIn: "" },
  { name: "Burak Gorbil", lastMet: "Last met Today", time: "", nextIn: "in 3d" },
  { name: "Muaz Esen", lastMet: "Last met 1w ago", time: "", nextIn: "in 6d" },
];

const recentActivity = [
  { title: "test entry", contact: "Burak Gorbil", time: "Today" },
  { title: "We talk about this and that", contact: "Ahmet Ovacin", time: "1d ago" },
  { title: "He's definitely interested to found a professional services company for DACH", contact: "Muaz Esen", time: "1d ago" },
  { title: "I still have the chance to find Master students for Ireland from Malaysia", contact: "Burak Gorbil", time: "1d ago" },
];

const contacts = [
  { name: "Sermin Pekkan", title: "", city: "Yozgat", lastContact: "1d ago", tags: ["Just Met"] },
];

export default function ShowcasePage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "light" ? "bg-gray-50" : "bg-gray-950"
      }`}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 border-b px-6 py-4 flex items-center justify-between bg-inherit">
        <h1
          className={`text-xl font-bold ${
            theme === "light" ? "text-gray-900" : "text-gray-100"
          }`}
        >
          UI Showcase - Design Suggestions
        </h1>
        <button
          onClick={toggleTheme}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            theme === "light"
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-gray-800 text-gray-200 hover:bg-gray-700"
          }`}
        >
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {/* Section: Check-ins */}
        <section>
          <h2
            className={`text-lg font-semibold mb-6 ${
              theme === "light" ? "text-gray-800" : "text-gray-200"
            }`}
          >
            Check-ins Card
          </h2>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Current */}
            <div>
              <p
                className={`text-xs uppercase tracking-wider mb-3 ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Current
              </p>
              <div
                className={`rounded-2xl p-5 border ${
                  theme === "light"
                    ? "bg-white border-gray-200"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <h3
                  className={`text-xs font-bold uppercase tracking-wider mb-4 ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Check-ins
                </h3>
                <div className="space-y-3">
                  {checkIns.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <span
                          className={`font-medium ${
                            theme === "light" ? "text-gray-900" : "text-gray-100"
                          }`}
                        >
                          {item.name}
                        </span>
                        <span
                          className={`text-sm ml-2 ${
                            theme === "light" ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          · {item.lastMet}
                        </span>
                      </div>
                      <span
                        className={`text-sm ${
                          theme === "light" ? "text-gray-600" : "text-gray-300"
                        }`}
                      >
                        {item.time || item.nextIn}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggested */}
            <div>
              <p
                className={`text-xs uppercase tracking-wider mb-3 ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Suggested
              </p>
              <div
                className={`rounded-2xl p-6 border ${
                  theme === "light"
                    ? "bg-white border-gray-200"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <div className="flex items-center gap-2 mb-5">
                  <svg
                    className={`w-4 h-4 ${
                      theme === "light" ? "text-gray-400" : "text-gray-500"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider ${
                      theme === "light" ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Check-ins
                  </h3>
                </div>
                <div className="space-y-0">
                  {checkIns.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 py-2 px-3 -mx-3 rounded-lg cursor-pointer transition-colors ${
                        theme === "light"
                          ? "hover:bg-gray-50"
                          : "hover:bg-gray-750 hover:bg-opacity-50"
                      }`}
                    >
                      <span
                        className={`font-medium text-sm ${
                          theme === "light" ? "text-gray-900" : "text-gray-100"
                        }`}
                      >
                        {item.name}
                      </span>
                      <span
                        className={`text-xs ${
                          theme === "light" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        ·
                      </span>
                      <span
                        className={`text-xs ${
                          theme === "light" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        {item.nextIn || item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Recent Activity */}
        <section>
          <h2
            className={`text-lg font-semibold mb-6 ${
              theme === "light" ? "text-gray-800" : "text-gray-200"
            }`}
          >
            Recent Activity Card
          </h2>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Current */}
            <div>
              <p
                className={`text-xs uppercase tracking-wider mb-3 ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Current
              </p>
              <div
                className={`rounded-2xl p-5 border ${
                  theme === "light"
                    ? "bg-white border-gray-200"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <h3
                  className={`text-xs font-bold uppercase tracking-wider mb-4 ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {recentActivity.map((item, idx) => (
                    <div
                      key={idx}
                      className={`text-sm ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      {item.title} · {item.contact} -{" "}
                      <span
                        className={
                          theme === "light" ? "text-gray-500" : "text-gray-400"
                        }
                      >
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggested */}
            <div>
              <p
                className={`text-xs uppercase tracking-wider mb-3 ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Suggested
              </p>
              <div
                className={`rounded-2xl p-6 border ${
                  theme === "light"
                    ? "bg-white border-gray-200"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <div className="flex items-center gap-2 mb-5">
                  <svg
                    className={`w-4 h-4 ${
                      theme === "light" ? "text-gray-400" : "text-gray-500"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider ${
                      theme === "light" ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Recent Activity
                  </h3>
                </div>
                <div className="space-y-0.5">
                  {recentActivity.map((item, idx) => (
                    <div
                      key={idx}
                      className={`py-3 px-3 -mx-3 rounded-lg cursor-pointer transition-colors ${
                        theme === "light"
                          ? "hover:bg-gray-50"
                          : "hover:bg-gray-750 hover:bg-opacity-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            idx === 0
                              ? theme === "light"
                                ? "bg-blue-500"
                                : "bg-blue-400"
                              : theme === "light"
                              ? "bg-gray-300"
                              : "bg-gray-600"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm leading-snug ${
                              theme === "light" ? "text-gray-800" : "text-gray-200"
                            }`}
                          >
                            {item.title.length > 60
                              ? item.title.substring(0, 60) + "..."
                              : item.title}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              theme === "light" ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {item.contact}{" "}
                            <span
                              className={
                                theme === "light" ? "text-gray-300" : "text-gray-600"
                              }
                            >
                              ·
                            </span>{" "}
                            {item.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Tags/Filters */}
        <section>
          <h2
            className={`text-lg font-semibold mb-6 ${
              theme === "light" ? "text-gray-800" : "text-gray-200"
            }`}
          >
            Circle Tags / Filters
          </h2>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Current */}
            <div>
              <p
                className={`text-xs uppercase tracking-wider mb-3 ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Current
              </p>
              <div
                className={`rounded-2xl p-5 border ${
                  theme === "light"
                    ? "bg-white border-gray-200"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500 text-white">
                    Just Met
                  </span>
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                      theme === "light"
                        ? "border-gray-300 text-gray-700"
                        : "border-gray-600 text-gray-300"
                    }`}
                  >
                    Friend
                  </span>
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                      theme === "light"
                        ? "border-gray-300 text-gray-700"
                        : "border-gray-600 text-gray-300"
                    }`}
                  >
                    Work
                  </span>
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                      theme === "light"
                        ? "border-gray-300 text-gray-700"
                        : "border-gray-600 text-gray-300"
                    }`}
                  >
                    New
                  </span>
                </div>
              </div>
            </div>

            {/* Suggested */}
            <div>
              <p
                className={`text-xs uppercase tracking-wider mb-3 ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Suggested (more subtle, refined)
              </p>
              <div
                className={`rounded-2xl p-5 border ${
                  theme === "light"
                    ? "bg-white border-gray-200"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      theme === "light"
                        ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200"
                        : "bg-blue-900/40 text-blue-300 ring-1 ring-blue-800"
                    }`}
                  >
                    Just Met
                  </span>
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer ${
                      theme === "light"
                        ? "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                    }`}
                  >
                    Friend
                  </span>
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer ${
                      theme === "light"
                        ? "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                    }`}
                  >
                    Work
                  </span>
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer ${
                      theme === "light"
                        ? "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                    }`}
                  >
                    New
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Contact Table Row */}
        <section>
          <h2
            className={`text-lg font-semibold mb-6 ${
              theme === "light" ? "text-gray-800" : "text-gray-200"
            }`}
          >
            Contact Table
          </h2>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Current */}
            <div>
              <p
                className={`text-xs uppercase tracking-wider mb-3 ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Current
              </p>
              <div
                className={`rounded-2xl border overflow-hidden ${
                  theme === "light"
                    ? "bg-white border-gray-200"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <table className="w-full">
                  <thead>
                    <tr
                      className={`text-left text-sm ${
                        theme === "light" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      <th className="px-5 py-3 font-medium">Name</th>
                      <th className="px-5 py-3 font-medium">Title</th>
                      <th className="px-5 py-3 font-medium">City</th>
                      <th className="px-5 py-3 font-medium">Last contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact, idx) => (
                      <tr
                        key={idx}
                        className={`${
                          theme === "light"
                            ? "border-t border-gray-100"
                            : "border-t border-gray-700"
                        }`}
                      >
                        <td className="px-5 py-4">
                          <span
                            className={`font-medium ${
                              theme === "light" ? "text-gray-900" : "text-gray-100"
                            }`}
                          >
                            {contact.name}
                          </span>
                        </td>
                        <td
                          className={`px-5 py-4 ${
                            theme === "light" ? "text-gray-600" : "text-gray-400"
                          }`}
                        >
                          {contact.title || "-"}
                        </td>
                        <td
                          className={`px-5 py-4 ${
                            theme === "light" ? "text-gray-600" : "text-gray-400"
                          }`}
                        >
                          {contact.city}
                        </td>
                        <td
                          className={`px-5 py-4 ${
                            theme === "light" ? "text-gray-600" : "text-gray-400"
                          }`}
                        >
                          {contact.lastContact}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Suggested */}
            <div>
              <p
                className={`text-xs uppercase tracking-wider mb-3 ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Suggested (subtle header, hover states)
              </p>
              <div
                className={`rounded-2xl border overflow-hidden ${
                  theme === "light"
                    ? "bg-white border-gray-200"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <table className="w-full">
                  <thead>
                    <tr
                      className={`text-left text-xs uppercase tracking-wider ${
                        theme === "light"
                          ? "bg-gray-50 text-gray-500"
                          : "bg-gray-850 text-gray-500"
                      }`}
                    >
                      <th className="px-5 py-3 font-semibold">Name</th>
                      <th className="px-5 py-3 font-semibold">Title</th>
                      <th className="px-5 py-3 font-semibold">City</th>
                      <th className="px-5 py-3 font-semibold">Last contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact, idx) => (
                      <tr
                        key={idx}
                        className={`cursor-pointer transition-colors ${
                          theme === "light"
                            ? "border-t border-gray-100 hover:bg-gray-50"
                            : "border-t border-gray-700 hover:bg-gray-750"
                        }`}
                      >
                        <td className="px-5 py-4">
                          <span
                            className={`font-medium ${
                              theme === "light" ? "text-gray-900" : "text-gray-100"
                            }`}
                          >
                            {contact.name}
                          </span>
                        </td>
                        <td
                          className={`px-5 py-4 text-sm ${
                            theme === "light" ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          {contact.title || (
                            <span className="opacity-40">—</span>
                          )}
                        </td>
                        <td
                          className={`px-5 py-4 text-sm ${
                            theme === "light" ? "text-gray-600" : "text-gray-300"
                          }`}
                        >
                          {contact.city}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              theme === "light"
                                ? "bg-gray-100 text-gray-600"
                                : "bg-gray-700 text-gray-300"
                            }`}
                          >
                            {contact.lastContact}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Alternative Layouts */}
        <section>
          <h2
            className={`text-lg font-semibold mb-6 ${
              theme === "light" ? "text-gray-800" : "text-gray-200"
            }`}
          >
            Alternative: Card-based Contact List
          </h2>

          <div
            className={`rounded-2xl p-6 border ${
              theme === "light"
                ? "bg-white border-gray-200"
                : "bg-gray-800 border-gray-700"
            }`}
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Sermin Pekkan", city: "Yozgat", lastContact: "1d ago", tag: "Just Met" },
                { name: "Burak Gorbil", city: "Istanbul", lastContact: "Today", tag: "Friend" },
                { name: "Muaz Esen", city: "Berlin", lastContact: "1w ago", tag: "Work" },
              ].map((contact, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    theme === "light"
                      ? "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      : "border-gray-700 hover:border-gray-600 hover:bg-gray-750"
                  }`}
                >
                  <div>
                    <h4
                      className={`font-medium ${
                        theme === "light" ? "text-gray-900" : "text-gray-100"
                      }`}
                    >
                      {contact.name}
                    </h4>
                    <p
                      className={`text-xs mt-0.5 ${
                        theme === "light" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {contact.city}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        contact.tag === "Just Met"
                          ? theme === "light"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-blue-900/40 text-blue-400"
                          : contact.tag === "Friend"
                          ? theme === "light"
                            ? "bg-green-50 text-green-600"
                            : "bg-green-900/40 text-green-400"
                          : theme === "light"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-purple-900/40 text-purple-400"
                      }`}
                    >
                      {contact.tag}
                    </span>
                    <span
                      className={`text-xs ${
                        theme === "light" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {contact.lastContact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer note */}
        <div
          className={`text-center py-8 text-sm ${
            theme === "light" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          These are suggestions - pick and choose what resonates with you.
        </div>
      </div>
    </div>
  );
}
