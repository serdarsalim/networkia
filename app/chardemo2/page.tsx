"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Theme = "light" | "dark";

type ProfileField = {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  type: "text" | "multi-line";
};

export default function CharacterDemo2() {
  const [theme, setTheme] = useState<Theme>("light");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingThoughts, setIsEditingThoughts] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [showNextMeetPopup, setShowNextMeetPopup] = useState(false);
  const [nextMeetDate, setNextMeetDate] = useState<string | null>("2026-01-24");

  // Profile header info
  const [profileName, setProfileName] = useState("Edward Norton");
  const [profileTitle, setProfileTitle] = useState("Film Director & Producer");
  const [profileLocation, setProfileLocation] = useState("Los Angeles, CA");
  const [profileTags, setProfileTags] = useState(["Close Friend", "Film", "Environment"]);

  const [profileFields, setProfileFields] = useState<ProfileField[]>([
    { id: "email", label: "Email", value: "ed.norton@gmail.com", type: "text" },
    { id: "phone", label: "Phone", value: "+1 (310) 555-8834", type: "text" },
    { id: "work", label: "Work", value: "Class 5 Films", subValue: "Co-founder & Director", type: "text" },
    { id: "website", label: "Website", value: "edwardnorton.com", type: "text" },
    { id: "status", label: "Status", value: "Married", type: "text" },
    { id: "spouse", label: "Spouse", value: "Shauna Robertson", subValue: "Producer", type: "text" },
    { id: "kids", label: "Kids", value: "Atlas, 11", type: "text" },
    { id: "nationality", label: "Nationality", value: "American", type: "text" },
    { id: "education", label: "Education", value: "Yale University", subValue: "History major, Japanese studies", type: "text" },
    { id: "birthday", label: "Birthday", value: "August 18", subValue: "Age 54", type: "text" },
    { id: "circle", label: "Circle", value: "Wes Anderson\nBrad Pitt\nAaron Sorkin", type: "multi-line" },
    { id: "howWeMet", label: "How We Met", value: "Met through mutual friend at Sundance 2019, bonded over documentary filmmaking", type: "text" },
    { id: "interests", label: "Interests", value: "Environmental conservation\nJapanese culture & language\nMeditation & mindfulness\nArchitecture", type: "multi-line" },
  ]);
  const [showAddField, setShowAddField] = useState(false);

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
    <div className="min-h-screen p-4 md:p-8 transition-colors duration-300">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              theme === "light"
                ? "hover:bg-gray-100 text-gray-700"
                : "hover:bg-gray-800 text-gray-300"
            }`}
          >
            <span className="text-lg">←</span>
            <span className="font-medium">Dashboard</span>
          </Link>
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
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
          {/* Left Sidebar - Profile & Contact */}
          <div className="space-y-8 lg:sticky lg:top-8 lg:self-start">
            {/* Profile Card */}
            <div
              className={`rounded-2xl py-6 pl-6 pr-4 border transition-all duration-300 ${
                theme === "light"
                  ? "bg-white border-gray-200 shadow-sm hover:shadow-md"
                  : "bg-gray-800 border-gray-700 shadow-xl"
              }`}
              onClick={() => setHoveredCard(hoveredCard === 'profile' ? null : 'profile')}
            >
              <div className="flex flex-col items-center text-center mb-6">
                {/* Character Photo */}
                <div className="relative group mb-4">
                  <div
                    className={`w-32 h-32 rounded-full border-4 transition-all duration-300 ${
                      theme === "light"
                        ? "border-blue-400 group-hover:border-blue-500"
                        : "border-cyan-400 group-hover:border-cyan-300"
                    } overflow-hidden bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 shadow-lg group-hover:shadow-xl group-hover:scale-105`}
                  >
                    <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold">
                      EN
                    </div>
                  </div>
                  {/* Photo upload hint on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded-full">
                      Change photo
                    </div>
                  </div>
                </div>

                {/* Name and Title */}
                <div className="mb-4 space-y-1 w-full px-4">
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className={`text-2xl font-bold tracking-tight text-center w-full px-2 py-1 rounded border ${
                        theme === "light"
                          ? "text-gray-900 border-gray-300 bg-white focus:border-blue-500"
                          : "text-gray-100 border-gray-600 bg-gray-900 focus:border-cyan-500"
                      } focus:outline-none`}
                    />
                  ) : (
                    <h1 className="text-2xl font-bold tracking-tight">{profileName}</h1>
                  )}
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileTitle}
                      onChange={(e) => setProfileTitle(e.target.value)}
                      placeholder="Optional title/subtitle"
                      className={`text-base text-center w-full px-2 py-1 rounded border ${
                        theme === "light"
                          ? "text-gray-600 border-gray-300 bg-white focus:border-blue-500 placeholder-gray-400"
                          : "text-gray-400 border-gray-600 bg-gray-900 focus:border-cyan-500 placeholder-gray-500"
                      } focus:outline-none`}
                    />
                  ) : (
                    profileTitle && (
                      <p
                        className={`text-base ${
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        {profileTitle}
                      </p>
                    )
                  )}
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileLocation}
                      onChange={(e) => setProfileLocation(e.target.value)}
                      placeholder="Location"
                      className={`text-sm text-center w-full px-2 py-1 rounded border ${
                        theme === "light"
                          ? "text-gray-500 border-gray-300 bg-white focus:border-blue-500 placeholder-gray-400"
                          : "text-gray-500 border-gray-600 bg-gray-900 focus:border-cyan-500 placeholder-gray-500"
                      } focus:outline-none`}
                    />
                  ) : (
                    <p
                      className={`text-sm flex items-center justify-center gap-1 ${
                        theme === "light" ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      <span>📍</span>
                      <span>{profileLocation}</span>
                    </p>
                  )}
                </div>

                {/* Circles */}
                <div className="flex flex-wrap gap-2 justify-center px-4">
                  {isEditingProfile ? (
                    <div className="w-full space-y-2">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {profileTags.map((tag, index) => (
                          <div
                            key={index}
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                              theme === "light"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-blue-900 text-blue-200"
                            }`}
                          >
                            <span>{tag}</span>
                            <button
                              onClick={() => {
                                setProfileTags(profileTags.filter((_, i) => i !== index));
                              }}
                              className={`ml-1 hover:bg-opacity-50 rounded-full ${
                                theme === "light"
                                  ? "hover:bg-blue-200"
                                  : "hover:bg-blue-800"
                              }`}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Add new tag (press Enter)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            setProfileTags([...profileTags, e.currentTarget.value.trim()]);
                            e.currentTarget.value = '';
                          }
                        }}
                        className={`text-xs text-center w-full px-2 py-1 rounded border ${
                          theme === "light"
                            ? "text-gray-900 border-gray-300 bg-white focus:border-blue-500 placeholder-gray-400"
                            : "text-gray-100 border-gray-600 bg-gray-900 focus:border-cyan-500 placeholder-gray-500"
                        } focus:outline-none`}
                      />
                    </div>
                  ) : (
                    profileTags.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${
                          index === 0
                            ? theme === "light"
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              : "bg-blue-900 text-blue-200 hover:bg-blue-800"
                            : index === 1
                            ? theme === "light"
                              ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                              : "bg-purple-900 text-purple-200 hover:bg-purple-800"
                            : theme === "light"
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-green-900 text-green-200 hover:bg-green-800"
                        }`}
                      >
                        {tag}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Contact Info Section */}
              <div className={`pt-3 border-t ${theme === "light" ? "border-gray-200" : "border-gray-700"}`}>
                {/* Edit Mode Controls */}
                <div className="flex items-center justify-end mb-2">
                  {!isEditingProfile ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingProfile(true);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                        hoveredCard === 'profile' ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      } ${
                        theme === "light"
                          ? "text-blue-600 hover:bg-blue-50"
                          : "text-cyan-400 hover:bg-gray-700"
                      }`}
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingProfile(false);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                          theme === "light"
                            ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingProfile(false);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                          theme === "light"
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "bg-cyan-600 hover:bg-cyan-500 text-white"
                        }`}
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                {/* Render all profile fields */}
                {profileFields.map((field) => (
                  <div key={field.id} className="grid grid-cols-[80px_1fr] gap-2 items-start group relative">
                    {isEditingProfile ? (
                      <>
                        {/* Label in edit mode - editable */}
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => {
                            setProfileFields(profileFields.map(f =>
                              f.id === field.id ? { ...f, label: e.target.value } : f
                            ));
                          }}
                          className={`text-xs font-semibold px-2 py-1 rounded border ${
                            theme === "light"
                              ? "text-gray-500 border-gray-300 bg-white focus:border-blue-500"
                              : "text-gray-400 border-gray-600 bg-gray-900 focus:border-cyan-500"
                          } focus:outline-none`}
                        />
                        {/* Value in edit mode - editable */}
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            {field.type === "multi-line" ? (
                              <textarea
                                value={field.value}
                                onChange={(e) => {
                                  setProfileFields(profileFields.map(f =>
                                    f.id === field.id ? { ...f, value: e.target.value } : f
                                  ));
                                }}
                                rows={field.value.split('\n').length}
                                className={`text-sm font-medium px-2 py-1 rounded border w-full ${
                                  theme === "light"
                                    ? "text-gray-900 border-gray-300 bg-white focus:border-blue-500"
                                    : "text-gray-100 border-gray-600 bg-gray-900 focus:border-cyan-500"
                                } focus:outline-none resize-none`}
                              />
                            ) : (
                              <>
                                <input
                                  type="text"
                                  value={field.value}
                                  onChange={(e) => {
                                    setProfileFields(profileFields.map(f =>
                                      f.id === field.id ? { ...f, value: e.target.value } : f
                                    ));
                                  }}
                                  className={`text-sm font-medium px-2 py-1 rounded border w-full ${
                                    theme === "light"
                                      ? "text-gray-900 border-gray-300 bg-white focus:border-blue-500"
                                      : "text-gray-100 border-gray-600 bg-gray-900 focus:border-cyan-500"
                                  } focus:outline-none`}
                                />
                                {field.subValue && (
                                  <input
                                    type="text"
                                    value={field.subValue}
                                    onChange={(e) => {
                                      setProfileFields(profileFields.map(f =>
                                        f.id === field.id ? { ...f, subValue: e.target.value } : f
                                      ));
                                    }}
                                    className={`text-xs px-2 py-1 rounded border w-full mt-1 ${
                                      theme === "light"
                                        ? "text-gray-500 border-gray-300 bg-white focus:border-blue-500"
                                        : "text-gray-400 border-gray-600 bg-gray-900 focus:border-cyan-500"
                                    } focus:outline-none`}
                                  />
                                )}
                              </>
                            )}
                          </div>
                          {/* Delete button */}
                          <button
                            onClick={() => {
                              setProfileFields(profileFields.filter(f => f.id !== field.id));
                            }}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              theme === "light"
                                ? "text-red-600 hover:bg-red-50"
                                : "text-red-400 hover:bg-red-900/20"
                            }`}
                            title="Delete field"
                          >
                            ×
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Label in view mode */}
                        <div
                          className={`text-xs font-semibold ${
                            theme === "light" ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          {field.label}
                        </div>
                        {/* Value in view mode */}
                        <div>
                          {field.type === "multi-line" ? (
                            <div
                              className={`text-sm space-y-1 ${
                                theme === "light" ? "text-gray-900" : "text-gray-100"
                              }`}
                            >
                              {field.value.split('\n').map((line, idx) => (
                                <div key={idx}>{line}</div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <div
                                className={`text-sm font-medium ${
                                  field.label === "Website"
                                    ? theme === "light"
                                      ? "text-blue-600 hover:text-blue-700"
                                      : "text-cyan-400 hover:text-cyan-300"
                                    : theme === "light"
                                    ? "text-gray-900"
                                    : "text-gray-100"
                                }`}
                              >
                                {field.value}
                              </div>
                              {field.subValue && (
                                <div
                                  className={`text-xs ${
                                    theme === "light" ? "text-gray-500" : "text-gray-400"
                                  }`}
                                >
                                  {field.subValue}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Add Field Button */}
                {isEditingProfile && (
                  <div className="pt-2">
                    {!showAddField ? (
                      <button
                        onClick={() => setShowAddField(true)}
                        className={`text-xs px-3 py-2 rounded-lg font-medium transition-all duration-200 w-full border-2 border-dashed ${
                          theme === "light"
                            ? "border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
                            : "border-gray-700 text-gray-400 hover:border-cyan-500 hover:text-cyan-400 hover:bg-gray-800"
                        }`}
                      >
                        + Add Field
                      </button>
                    ) : (
                      <div className={`border rounded-lg p-3 ${
                        theme === "light" ? "border-gray-300 bg-gray-50" : "border-gray-700 bg-gray-800"
                      }`}>
                        <div className="space-y-2">
                          <select
                            className={`text-sm px-2 py-1.5 rounded border w-full ${
                              theme === "light"
                                ? "text-gray-900 border-gray-300 bg-white"
                                : "text-gray-100 border-gray-600 bg-gray-900"
                            } focus:outline-none`}
                            onChange={(e) => {
                              if (e.target.value) {
                                const newField: ProfileField = {
                                  id: Date.now().toString(),
                                  label: e.target.value,
                                  value: "",
                                  type: "text"
                                };
                                setProfileFields([...profileFields, newField]);
                                setShowAddField(false);
                                e.target.value = "";
                              }
                            }}
                            defaultValue=""
                          >
                            <option value="">Select a field type...</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Twitter">Twitter</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Facebook">Facebook</option>
                            <option value="GitHub">GitHub</option>
                            <option value="Hobbies">Hobbies</option>
                            <option value="Languages">Languages</option>
                            <option value="Custom">Custom Field</option>
                          </select>
                          <button
                            onClick={() => setShowAddField(false)}
                            className={`text-xs px-2 py-1 rounded w-full ${
                              theme === "light"
                                ? "text-gray-600 hover:bg-gray-200"
                                : "text-gray-400 hover:bg-gray-700"
                            }`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>

          {/* Right Main Area - Character Bio */}
          <div className="space-y-8">
            {/* Activity Summary */}
            <div
              className={`rounded-2xl px-6 py-4 border transition-all duration-300 relative ${
                theme === "light"
                  ? "bg-white border-gray-200 shadow-sm"
                  : "bg-gray-800 border-gray-700 shadow-xl"
              }`}
            >
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span
                  className={`text-xs font-semibold ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Last Contacted:
                </span>
                <button
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    theme === "light"
                      ? "border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-900"
                      : "border-gray-700 hover:border-cyan-500 hover:bg-gray-800 text-gray-100"
                  }`}
                >
                  Jan 10 (3d ago)
                </button>
                <button
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                    theme === "light"
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-cyan-600 hover:bg-cyan-500 text-white"
                  }`}
                >
                  Set to Now
                </button>
                <div
                  className={`h-4 w-px ${
                    theme === "light" ? "bg-gray-300" : "bg-gray-600"
                  }`}
                ></div>
                <span
                  className={`text-xs font-semibold ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Next meet:
                </span>
                <button
                  onClick={() => setShowNextMeetPopup(!showNextMeetPopup)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    theme === "light"
                      ? "border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-900"
                      : "border-gray-700 hover:border-cyan-500 hover:bg-gray-800 text-gray-100"
                  }`}
                >
                  {nextMeetDate ? new Date(nextMeetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Add date'}
                </button>
              </div>

              {/* Next Meet Popup */}
              {showNextMeetPopup && (
                <div
                  className={`absolute top-full right-0 mt-2 w-80 rounded-xl border shadow-lg p-4 z-50 ${
                    theme === "light"
                      ? "bg-white border-gray-200"
                      : "bg-gray-800 border-gray-700"
                  }`}
                >
                  <div className="space-y-3">
                    <div>
                      <label
                        className={`text-xs font-semibold mb-2 block ${
                          theme === "light" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        Pick a date
                      </label>
                      <input
                        type="date"
                        value={nextMeetDate || ''}
                        onChange={(e) => setNextMeetDate(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 ${
                          theme === "light"
                            ? "border-gray-300 bg-white text-gray-900 focus:border-blue-500"
                            : "border-gray-600 bg-gray-900 text-gray-100 focus:border-cyan-500"
                        } focus:outline-none`}
                      />
                    </div>

                    <div>
                      <label
                        className={`text-xs font-semibold mb-2 block ${
                          theme === "light" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        Or set from today
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            const date = new Date();
                            date.setDate(date.getDate() + 7);
                            setNextMeetDate(date.toISOString().split('T')[0]);
                          }}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                            theme === "light"
                              ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                              : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          }`}
                        >
                          1 week
                        </button>
                        <button
                          onClick={() => {
                            const date = new Date();
                            date.setDate(date.getDate() + 14);
                            setNextMeetDate(date.toISOString().split('T')[0]);
                          }}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                            theme === "light"
                              ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                              : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          }`}
                        >
                          2 weeks
                        </button>
                        <button
                          onClick={() => {
                            const date = new Date();
                            date.setMonth(date.getMonth() + 1);
                            setNextMeetDate(date.toISOString().split('T')[0]);
                          }}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                            theme === "light"
                              ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                              : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          }`}
                        >
                          1 month
                        </button>
                        <button
                          onClick={() => {
                            const date = new Date();
                            date.setMonth(date.getMonth() + 3);
                            setNextMeetDate(date.toISOString().split('T')[0]);
                          }}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                            theme === "light"
                              ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                              : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          }`}
                        >
                          3 months
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {nextMeetDate && (
                        <button
                          onClick={() => {
                            setNextMeetDate(null);
                            setShowNextMeetPopup(false);
                          }}
                          className={`flex-1 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            theme === "light"
                              ? "text-red-600 hover:bg-red-50"
                              : "text-red-400 hover:bg-red-900/20"
                          }`}
                        >
                          Delete
                        </button>
                      )}
                      <button
                        onClick={() => setShowNextMeetPopup(false)}
                        className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
                          theme === "light"
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "bg-cyan-600 hover:bg-cyan-500 text-white"
                        }`}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Overview - Combined impression, context & background */}
            <div
              className={`rounded-2xl p-8 border transition-all duration-300 ${
                theme === "light"
                  ? "bg-white border-gray-200 shadow-sm hover:shadow-md"
                  : "bg-gray-800 border-gray-700 shadow-xl"
              }`}
              onClick={() => setHoveredCard(hoveredCard === 'thoughts' ? null : 'thoughts')}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xs font-bold uppercase tracking-wider ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  What do I think of this person?
                </h2>
                {!isEditingThoughts ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingThoughts(true);
                    }}
                    className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                      hoveredCard === 'thoughts' ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    } ${
                      theme === "light"
                        ? "text-blue-600 hover:bg-blue-50"
                        : "text-cyan-400 hover:bg-gray-700"
                    }`}
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingThoughts(false);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                        theme === "light"
                          ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingThoughts(false);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                        theme === "light"
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "bg-cyan-600 hover:bg-cyan-500 text-white"
                      }`}
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              {/* Personal impression */}
              <div
                className={`text-base leading-relaxed space-y-4 ${
                  theme === "light" ? "text-gray-700" : "text-gray-300"
                }`}
              >
                <p>
                  Incredibly thoughtful and deliberate in everything he does. Doesn't just act or direct - he thinks deeply about the meaning and impact of stories.
                </p>
                <p>
                  Really cares about environmental issues, not just as talking points but genuinely invested. Started a solar company and does real work in conservation. Appreciates when you engage on those topics.
                </p>
                <p>
                  Not someone who likes small talk. Prefers deep conversations about ideas, philosophy, or specific projects. Once you get him talking about film technique or adaptation, he's fascinating.
                </p>
              </div>
            </div>

            {/* Updates Panel - Journal entries */}
            <div
              className={`rounded-2xl p-8 border transition-all duration-300 ${
                theme === "light"
                  ? "bg-white border-gray-200 shadow-sm hover:shadow-md"
                  : "bg-gray-800 border-gray-700 shadow-xl"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xs font-bold uppercase tracking-wider ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Notes on our interactions
                </h2>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                    theme === "light"
                      ? "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                      : "text-gray-400 hover:bg-gray-800 hover:text-cyan-400"
                  }`}
                >
                  + Add New
                </button>
              </div>

              <div className="space-y-6">
                {/* Interaction Entry 1 - Journal style */}
                <div
                  className={`p-6 rounded-xl transition-all duration-200 cursor-pointer ${
                    theme === "light"
                      ? "hover:bg-gray-50"
                      : "hover:bg-gray-900"
                  }`}
                  onClick={() => setActiveNoteId(activeNoteId === 'note1' ? null : 'note1')}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div
                        className={`font-semibold text-base mb-1 ${
                          theme === "light" ? "text-gray-900" : "text-gray-100"
                        }`}
                      >
                        Coffee Meeting
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          theme === "light" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        January 10, 2024 · 3 days ago
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                        activeNoteId === 'note1' ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      } ${
                        theme === "light"
                          ? "text-blue-600 hover:bg-blue-50"
                          : "text-cyan-400 hover:bg-gray-800"
                      }`}
                    >
                      Edit
                    </button>
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    Caught up on her new role at Tesla. She's leading the
                    charging infrastructure project and is <strong>super excited</strong> about
                    it. Discussed potential collaboration on a climate tech side
                    project.
                  </p>
                </div>

                {/* Interaction Entry 2 */}
                <div
                  className={`p-6 rounded-xl transition-all duration-200 cursor-pointer ${
                    theme === "light"
                      ? "hover:bg-gray-50"
                      : "hover:bg-gray-900"
                  }`}
                  onClick={() => setActiveNoteId(activeNoteId === 'note2' ? null : 'note2')}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div
                        className={`font-semibold text-base mb-1 ${
                          theme === "light" ? "text-gray-900" : "text-gray-100"
                        }`}
                      >
                        Dinner at Mission Chinese
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          theme === "light" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        December 5, 2023 · 1 month ago
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                        activeNoteId === 'note2' ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      } ${
                        theme === "light"
                          ? "text-blue-600 hover:bg-blue-50"
                          : "text-cyan-400 hover:bg-gray-800"
                      }`}
                    >
                      Edit
                    </button>
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    Celebrated her promotion! She recommended{" "}
                    <em>"The Ministry for the Future"</em> book. Had a long
                    conversation about AI ethics and climate models.
                  </p>
                </div>

                {/* Interaction Entry 3 */}
                <div
                  className={`p-6 rounded-xl transition-all duration-200 cursor-pointer ${
                    theme === "light"
                      ? "hover:bg-gray-50"
                      : "hover:bg-gray-900"
                  }`}
                  onClick={() => setActiveNoteId(activeNoteId === 'note3' ? null : 'note3')}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div
                        className={`font-semibold text-base mb-1 ${
                          theme === "light" ? "text-gray-900" : "text-gray-100"
                        }`}
                      >
                        Quick phone call
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          theme === "light" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        November 2, 2023 · 2 months ago
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                        activeNoteId === 'note3' ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      } ${
                        theme === "light"
                          ? "text-blue-600 hover:bg-blue-50"
                          : "text-cyan-400 hover:bg-gray-800"
                      }`}
                    >
                      Edit
                    </button>
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    She asked for feedback on her Tesla offer. Discussed
                    pros/cons of moving from Google. I recommended taking it -
                    seemed like a great opportunity for her.
                  </p>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-end gap-2 pt-4">
                  <span
                    className={`text-xs ${
                      theme === "light" ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Page
                  </span>
                  <select
                    className={`px-2 py-1 text-sm rounded border transition-all duration-200 ${
                      theme === "light"
                        ? "border-gray-300 bg-white text-gray-900"
                        : "border-gray-600 bg-gray-800 text-gray-100"
                    } focus:outline-none`}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                  </select>
                  <span
                    className={`text-xs ${
                      theme === "light" ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    of 8
                  </span>
                </div>
              </div>
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
          {/* Footer Links */}
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
                Share Profile
              </a>
              <a
                href="#"
                className={`text-sm transition-colors ${
                  theme === "light"
                    ? "text-gray-600 hover:text-blue-600"
                    : "text-gray-400 hover:text-cyan-400"
                }`}
              >
                Export to PDF
              </a>
              <span className={`text-gray-300 ${theme === "dark" ? "text-gray-600" : ""}`}>|</span>
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

      {/* Floating Quick Add Button */}
      <button
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center text-2xl ${
          theme === "light"
            ? "bg-blue-500 hover:bg-blue-600 text-white"
            : "bg-cyan-600 hover:bg-cyan-500 text-white"
        }`}
        aria-label="Quick add interaction"
      >
        ✨
      </button>
    </div>
  );
}
