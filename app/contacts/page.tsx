"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Theme = "light" | "dark";

type Contact = {
  id: string;
  initials: string;
  name: string;
  tags: string[];
  location: string;
  lastContact: string;
  daysAgo: number;
  status?: "overdue" | "today" | "upcoming";
  daysOverdue?: number;
};

export default function ContactsPage() {
  const [theme, setTheme] = useState<Theme>("light");
  const [locationFilter, setLocationFilter] = useState("All");
  const [circleFilter, setCircleFilter] = useState("All");
  const [sortKey, setSortKey] = useState<"name" | "location" | "lastContact">(
    "lastContact"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const contacts: Contact[] = [
    {
      id: "4",
      initials: "EN",
      name: "Edward Norton",
      tags: ["Close", "Friends"],
      location: "New York, US",
      lastContact: "Jan 10",
      daysAgo: 3,
    },
    {
      id: "5",
      initials: "DB",
      name: "Dan Brown",
      tags: ["Acquaintance"],
      location: "New York, US",
      lastContact: "Jan 13",
      daysAgo: 0,
    },
    {
      id: "1",
      initials: "SC",
      name: "Sarah Chen",
      tags: ["Close", "Work"],
      location: "San Francisco, US",
      lastContact: "Dec 1",
      daysAgo: 43,
      status: "overdue",
    },
    {
      id: "6",
      initials: "AL",
      name: "Ava Lin",
      tags: ["Work"],
      location: "San Francisco, US",
      lastContact: "Jan 5",
      daysAgo: 8,
    },
    {
      id: "7",
      initials: "RM",
      name: "Ravi Mehta",
      tags: ["Work", "Friends"],
      location: "New York, US",
      lastContact: "Dec 18",
      daysAgo: 26,
    },
    {
      id: "8",
      initials: "KC",
      name: "Kara Cole",
      tags: ["Family"],
      location: "Austin, US",
      lastContact: "Jan 2",
      daysAgo: 11,
    },
    {
      id: "9",
      initials: "JL",
      name: "Jonas Lee",
      tags: ["Friends"],
      location: "Austin, US",
      lastContact: "Dec 22",
      daysAgo: 22,
    },
    {
      id: "10",
      initials: "MP",
      name: "Maya Patel",
      tags: ["Work"],
      location: "Toronto, CA",
      lastContact: "Jan 11",
      daysAgo: 2,
    },
    {
      id: "11",
      initials: "OB",
      name: "Owen Brooks",
      tags: ["Friends"],
      location: "Toronto, CA",
      lastContact: "Nov 29",
      daysAgo: 45,
      status: "overdue",
    },
    {
      id: "12",
      initials: "HG",
      name: "Hana Garcia",
      tags: ["Friends"],
      location: "Miami, US",
      lastContact: "Dec 30",
      daysAgo: 14,
    },
    {
      id: "13",
      initials: "LS",
      name: "Liam Stone",
      tags: ["Work"],
      location: "Miami, US",
      lastContact: "Jan 4",
      daysAgo: 9,
    },
    {
      id: "14",
      initials: "AP",
      name: "Ana Park",
      tags: ["Family"],
      location: "San Francisco, US",
      lastContact: "Dec 12",
      daysAgo: 32,
      status: "overdue",
    },
    {
      id: "15",
      initials: "CB",
      name: "Chris Bell",
      tags: ["Acquaintance"],
      location: "New York, US",
      lastContact: "Jan 9",
      daysAgo: 4,
    },
    {
      id: "16",
      initials: "NT",
      name: "Nina Torres",
      tags: ["Friends"],
      location: "Austin, US",
      lastContact: "Dec 26",
      daysAgo: 18,
    },
    {
      id: "17",
      initials: "GB",
      name: "Gabe Rossi",
      tags: ["Work"],
      location: "Toronto, CA",
      lastContact: "Jan 6",
      daysAgo: 7,
    },
    {
      id: "18",
      initials: "SF",
      name: "Sophie Fox",
      tags: ["Acquaintance"],
      location: "Miami, US",
      lastContact: "Dec 15",
      daysAgo: 29,
    },
    {
      id: "19",
      initials: "ID",
      name: "Ivan Diaz",
      tags: ["Friends"],
      location: "San Francisco, US",
      lastContact: "Jan 1",
      daysAgo: 12,
    },
    {
      id: "20",
      initials: "VT",
      name: "Vera Tan",
      tags: ["Work"],
      location: "New York, US",
      lastContact: "Dec 8",
      daysAgo: 36,
      status: "overdue",
    },
  ];

  const locations = Array.from(
    new Set(contacts.map((contact) => contact.location))
  ).sort();
  const circles = Array.from(
    new Set(contacts.flatMap((contact) => contact.tags))
  ).sort();
  const visibleCircles = circles.slice(0, 5);

  const parseMonthDay = (value: string) => {
    const [month, day] = value.split(" ");
    const monthIndex = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ].indexOf(month);
    const dayNumber = Number(day);
    const year = new Date().getFullYear();
    return new Date(year, Math.max(monthIndex, 0), dayNumber).getTime();
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesLocation =
        locationFilter === "All" || contact.location === locationFilter;
      const matchesCircle =
        circleFilter === "All" || contact.tags.includes(circleFilter);
      return matchesLocation && matchesCircle;
    });
  }, [contacts, locationFilter, circleFilter]);

  const sortedContacts = useMemo(() => {
    const sorted = [...filteredContacts];
    sorted.sort((a, b) => {
      if (sortKey === "lastContact") {
        return sortDirection === "desc"
          ? parseMonthDay(b.lastContact) - parseMonthDay(a.lastContact)
          : parseMonthDay(a.lastContact) - parseMonthDay(b.lastContact);
      }
      if (sortKey === "location") {
        return sortDirection === "desc"
          ? b.location.localeCompare(a.location)
          : a.location.localeCompare(b.location);
      }
      return sortDirection === "desc"
        ? b.name.localeCompare(a.name)
        : a.name.localeCompare(b.name);
    });
    return sorted;
  }, [filteredContacts, sortDirection, sortKey]);

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              theme === "light"
                ? "text-gray-600 hover:text-blue-600"
                : "text-gray-300 hover:text-cyan-400"
            }`}
          >
            ← Back to Dashboard
          </Link>
          <h1
            className={`text-xl font-semibold ${
              theme === "light" ? "text-gray-900" : "text-gray-100"
            }`}
          >
            All Contacts
          </h1>
          <button
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              theme === "light"
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-cyan-600 hover:bg-cyan-500 text-white"
            }`}
          >
            + New
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs uppercase tracking-wide ${
                theme === "light" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Location
            </span>
            <select
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
              className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                theme === "light"
                  ? "border-gray-300 bg-white text-gray-900"
                  : "border-gray-600 bg-gray-800 text-gray-100"
              }`}
            >
              <option value="All">All</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs uppercase tracking-wide ${
                theme === "light" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Circle
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {visibleCircles.map((circle) => {
                const isActive = circleFilter === circle;
                return (
                  <button
                    key={circle}
                    type="button"
                    onClick={() =>
                      setCircleFilter(isActive ? "All" : circle)
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      isActive
                        ? theme === "light"
                          ? "bg-blue-500 text-white"
                          : "bg-cyan-600 text-white"
                        : theme === "light"
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                    }`}
                  >
                    {circle}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className={`rounded-2xl border p-6 ${
            theme === "light"
              ? "bg-white border-gray-200 shadow-sm"
              : "bg-gray-800 border-gray-700 shadow-xl"
          }`}
        >
          <div className="space-y-2">
            <div
              className={`grid grid-cols-[1.6fr_1fr_1fr_180px] gap-3 px-3 text-xs font-semibold uppercase tracking-wide ${
                theme === "light" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setSortKey("name");
                  setSortDirection((current) =>
                    sortKey === "name" && current === "desc" ? "asc" : "desc"
                  );
                }}
                className={`flex items-center gap-1 text-left transition-colors whitespace-nowrap ${
                  theme === "light"
                    ? "text-gray-500 hover:text-gray-700"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                aria-label="Sort by name"
              >
                Name
                {sortKey === "name" && (
                  <span aria-hidden="true">
                    {sortDirection === "desc" ? "↓" : "↑"}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortKey("location");
                  setSortDirection((current) =>
                    sortKey === "location" && current === "desc"
                      ? "asc"
                      : "desc"
                  );
                }}
                className={`flex items-center gap-1 text-left transition-colors whitespace-nowrap ${
                  theme === "light"
                    ? "text-gray-500 hover:text-gray-700"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                aria-label="Sort by location"
              >
                Location
                {sortKey === "location" && (
                  <span aria-hidden="true">
                    {sortDirection === "desc" ? "↓" : "↑"}
                  </span>
                )}
              </button>
              <span>Circle</span>
              <button
                type="button"
                onClick={() => {
                  setSortKey("lastContact");
                  setSortDirection((current) =>
                    sortKey === "lastContact" && current === "desc"
                      ? "asc"
                      : "desc"
                  );
                }}
                className={`flex items-center justify-end gap-1 text-right transition-colors whitespace-nowrap ${
                  theme === "light"
                    ? "text-gray-500 hover:text-gray-700"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                aria-label="Sort by last contacted"
              >
                Last Contacted
                {sortKey === "lastContact" && (
                  <span aria-hidden="true">
                    {sortDirection === "desc" ? "↓" : "↑"}
                  </span>
                )}
              </button>
            </div>
            {sortedContacts.map((contact) => (
              <Link
                key={contact.id}
                href="/chardemo2"
                className={`block p-3 rounded-xl transition-all duration-200 ${
                  theme === "light" ? "hover:bg-gray-50" : "hover:bg-gray-900"
                }`}
              >
                <div className="grid grid-cols-[1.6fr_1fr_1fr_180px] items-center gap-3">
                  <div
                    className={`font-semibold text-sm ${
                      theme === "light"
                        ? "text-gray-900"
                        : "text-gray-100"
                    }`}
                  >
                    {contact.name}
                  </div>
                  <div
                    className={`text-xs ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {contact.location}
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
                  <div className="flex items-center justify-end gap-2">
                    <div
                      className={`text-xs ${
                        contact.status === "overdue"
                          ? "text-red-500"
                          : theme === "light"
                          ? "text-gray-600"
                          : "text-gray-400"
                      }`}
                    >
                      {contact.lastContact}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
