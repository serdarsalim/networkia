"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

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
  isQuick?: boolean;
  notes?: string;
  nextMeetDate?: string | null;
};

type QuickContact = {
  id: string;
  name: string;
  location: string;
  notes: string;
  tags: string[];
  lastContact: string;
};

export default function Dashboard() {
  const [theme, setTheme] = useState<Theme>("light");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactLocation, setContactLocation] = useState("");
  const [contactNotes, setContactNotes] = useState("");
  const [editingQuickId, setEditingQuickId] = useState<string | null>(null);
  const [contactsPage, setContactsPage] = useState(1);
  const [sortKey, setSortKey] = useState<
    "name" | "location" | "lastContact" | "nextMeet"
  >("lastContact");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [activeFilter, setActiveFilter] = useState<
    "overdue" | "close" | "work" | "family" | "all"
  >("overdue");
  const [quickContacts, setQuickContacts] = useState<QuickContact[]>([]);
  const [extraContacts, setExtraContacts] = useState<Contact[]>([]);
  const [hasLoadedContacts, setHasLoadedContacts] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const quickContactsKey = session?.user?.email
    ? `live_quick_contacts_${session.user.email}`
    : "demo_quick_contacts";
  const fullContactsKey = session?.user?.email
    ? `live_full_contacts_${session.user.email}`
    : "demo_full_contacts";

  useEffect(() => {
    const storedQuickContacts = localStorage.getItem(quickContactsKey);
    const storedFullContacts = localStorage.getItem(fullContactsKey);
    setQuickContacts(
      storedQuickContacts ? JSON.parse(storedQuickContacts) : []
    );
    setExtraContacts(storedFullContacts ? JSON.parse(storedFullContacts) : []);
    setHasLoadedContacts(true);
  }, [quickContactsKey, fullContactsKey]);

  useEffect(() => {
    if (!hasLoadedContacts) {
      return;
    }
    localStorage.setItem(quickContactsKey, JSON.stringify(quickContacts));
  }, [quickContacts, hasLoadedContacts, quickContactsKey]);

  useEffect(() => {
    if (!hasLoadedContacts) {
      return;
    }
    localStorage.setItem(fullContactsKey, JSON.stringify(extraContacts));
  }, [extraContacts, hasLoadedContacts, fullContactsKey]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const formatMonthDay = (value: Date) =>
    value.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const resetContactForm = () => {
    setContactName("");
    setContactLocation("");
    setContactNotes("");
    setEditingQuickId(null);
  };

  const openQuickContactEditor = (contactId: string) => {
    const quickContact = quickContacts.find(
      (contact) => contact.id === contactId
    );
    if (!quickContact) {
      return;
    }
    setContactMode("quick");
    setEditingQuickId(quickContact.id);
    setContactName(quickContact.name);
    setContactLocation(quickContact.location);
    setContactNotes(quickContact.notes);
    setIsContactModalOpen(true);
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

  const baseContacts: Contact[] = [
    {
      id: "4",
      initials: "EN",
      name: "Edward Norton",
      tags: ["Close", "Friends"],
      location: "New York",
      lastContact: "Jan 10",
      daysAgo: 3,
      nextMeetDate: "2026-02-05",
    },
    {
      id: "5",
      initials: "DB",
      name: "Dan Brown",
      tags: ["Acquaintance"],
      location: "New York",
      lastContact: "Jan 13",
      daysAgo: 0,
    },
    {
      id: "1",
      initials: "SC",
      name: "Sarah Chen",
      tags: ["Close", "Work"],
      location: "San Francisco",
      lastContact: "Dec 1",
      daysAgo: 43,
      status: "overdue",
      nextMeetDate: "2026-01-18",
    },
    {
      id: "6",
      initials: "AL",
      name: "Ava Lin",
      tags: ["Work"],
      location: "San Francisco",
      lastContact: "Jan 5",
      daysAgo: 8,
    },
    {
      id: "7",
      initials: "RM",
      name: "Ravi Mehta",
      tags: ["Work", "Friends"],
      location: "New York",
      lastContact: "Dec 18",
      daysAgo: 26,
      nextMeetDate: "2026-02-12",
    },
    {
      id: "8",
      initials: "KC",
      name: "Kara Cole",
      tags: ["Family"],
      location: "Austin",
      lastContact: "Jan 2",
      daysAgo: 11,
    },
    {
      id: "9",
      initials: "JL",
      name: "Jonas Lee",
      tags: ["Friends"],
      location: "Austin",
      lastContact: "Dec 22",
      daysAgo: 22,
      nextMeetDate: "2026-01-20",
    },
    {
      id: "10",
      initials: "MP",
      name: "Maya Patel",
      tags: ["Work"],
      location: "Toronto",
      lastContact: "Jan 11",
      daysAgo: 2,
    },
    {
      id: "11",
      initials: "OB",
      name: "Owen Brooks",
      tags: ["Friends"],
      location: "Toronto",
      lastContact: "Nov 29",
      daysAgo: 45,
      status: "overdue",
      nextMeetDate: "2026-01-10",
    },
    {
      id: "12",
      initials: "HG",
      name: "Hana Garcia",
      tags: ["Friends"],
      location: "Miami",
      lastContact: "Dec 30",
      daysAgo: 14,
    },
    {
      id: "13",
      initials: "LS",
      name: "Liam Stone",
      tags: ["Work"],
      location: "Miami",
      lastContact: "Jan 4",
      daysAgo: 9,
      nextMeetDate: "2026-03-01",
    },
    {
      id: "14",
      initials: "AP",
      name: "Ana Park",
      tags: ["Family"],
      location: "San Francisco",
      lastContact: "Dec 12",
      daysAgo: 32,
      status: "overdue",
      nextMeetDate: "2026-01-08",
    },
    {
      id: "15",
      initials: "CB",
      name: "Chris Bell",
      tags: ["Acquaintance"],
      location: "New York",
      lastContact: "Jan 9",
      daysAgo: 4,
    },
    {
      id: "16",
      initials: "NT",
      name: "Nina Torres",
      tags: ["Friends"],
      location: "Austin",
      lastContact: "Dec 26",
      daysAgo: 18,
    },
    {
      id: "17",
      initials: "GB",
      name: "Gabe Rossi",
      tags: ["Work"],
      location: "Toronto",
      lastContact: "Jan 6",
      daysAgo: 7,
    },
    {
      id: "18",
      initials: "SF",
      name: "Sophie Fox",
      tags: ["Acquaintance"],
      location: "Miami",
      lastContact: "Dec 15",
      daysAgo: 29,
    },
    {
      id: "19",
      initials: "ID",
      name: "Ivan Diaz",
      tags: ["Friends"],
      location: "San Francisco",
      lastContact: "Jan 1",
      daysAgo: 12,
      nextMeetDate: "2026-01-28",
    },
    {
      id: "20",
      initials: "VT",
      name: "Vera Tan",
      tags: ["Work"],
      location: "New York",
      lastContact: "Dec 8",
      daysAgo: 36,
      status: "overdue",
      nextMeetDate: "2026-01-14",
    },
  ];
  const quickContactsAsContacts: Contact[] = quickContacts.map((contact) => ({
    id: contact.id,
    initials: contact.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    name: contact.name,
    tags: ["Quick", ...contact.tags],
    location: contact.location || "—",
    lastContact: contact.lastContact,
    daysAgo: 0,
    isQuick: true,
    notes: contact.notes,
  }));
  const allContacts = [
    ...baseContacts,
    ...extraContacts,
    ...quickContactsAsContacts,
  ];
  const contactsPerPage = 10;
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
  const formatRelative = (days: number) => {
    if (days <= 0) {
      return "Today";
    }
    if (days < 7) {
      return `${days}d ago`;
    }
    if (days < 30) {
      return `${Math.floor(days / 7)}w ago`;
    }
    return `${Math.floor(days / 30)}mo ago`;
  };
  const formatUntil = (dateValue: string) => {
    const target = new Date(dateValue);
    if (Number.isNaN(target.getTime())) {
      return dateValue;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetMidnight = new Date(target);
    targetMidnight.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
      (targetMidnight.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 0) {
      return "Today";
    }
    if (diffDays < 7) {
      return `in ${diffDays}d`;
    }
    if (diffDays < 30) {
      return `in ${Math.floor(diffDays / 7)}w`;
    }
    return `in ${Math.floor(diffDays / 30)}mo`;
  };
  const filteredContacts = allContacts.filter((contact) => {
    if (activeFilter === "all") {
      return true;
    }
    if (activeFilter === "overdue") {
      return Boolean(contact.nextMeetDate);
    }
    return contact.tags.some(
      (tag) => tag.toLowerCase() === activeFilter
    );
  });
  const totalContactPages = Math.max(
    1,
    Math.ceil(filteredContacts.length / contactsPerPage)
  );
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (sortKey === "lastContact") {
      return sortDirection === "desc"
        ? parseMonthDay(b.lastContact) - parseMonthDay(a.lastContact)
        : parseMonthDay(a.lastContact) - parseMonthDay(b.lastContact);
    }
    if (sortKey === "nextMeet") {
      const aDate = a.nextMeetDate ? new Date(a.nextMeetDate).getTime() : 0;
      const bDate = b.nextMeetDate ? new Date(b.nextMeetDate).getTime() : 0;
      return sortDirection === "desc" ? bDate - aDate : aDate - bDate;
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
  const paginatedContacts = sortedContacts.slice(
    (contactsPage - 1) * contactsPerPage,
    contactsPage * contactsPerPage
  );

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
    <div className="min-h-screen transition-colors duration-300 flex flex-col">
      <div className="flex-1">
        {/* Navbar */}
        <nav
          className={`sticky top-0 z-20 w-full border-b mb-10 ${
            theme === "light"
              ? "bg-white/90 border-gray-200 shadow-sm"
              : "bg-gray-900/90 border-gray-800 shadow-lg"
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 py-3 pl-2 pr-4 md:pl-4 md:pr-6">
            <div className="flex items-center gap-6">
              <h1
                className={`text-2xl font-bold tracking-tight ${
                  theme === "light" ? "text-gray-900" : "text-gray-100"
                }`}
              >
                Networkia
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {isSearchOpen ? (
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  onBlur={() => {
                    if (!searchValue) {
                      setIsSearchOpen(false);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setIsSearchOpen(false);
                      setSearchValue("");
                    }
                  }}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                    theme === "light"
                      ? "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
                      : "border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400 focus:border-cyan-500"
                  } focus:outline-none`}
                />
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className={`px-3 py-2 rounded-lg transition-all duration-200 text-lg ${
                    theme === "light"
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-200"
                  }`}
                  aria-label="Open search"
                >
                  🔍
                </button>
              )}
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
              {!session && (
                <button
                  onClick={() => signIn("google")}
                  className={`hidden sm:inline-flex px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    theme === "light"
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                  }`}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* All Contacts */}
          <div
            className={`rounded-2xl p-6 border transition-all duration-300 h-full ${
              theme === "light"
                ? "bg-white border-gray-200 shadow-sm"
                : "bg-gray-800 border-gray-700 shadow-xl"
            }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
              <button
                  onClick={() => {
                    resetContactForm();
                    setIsContactModalOpen(true);
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 ${
                    theme === "light"
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-cyan-600 hover:bg-cyan-500 text-white"
                  }`}
                >
                  New Contact
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  setActiveFilter("overdue");
                  setContactsPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeFilter === "overdue"
                    ? theme === "light"
                      ? "bg-blue-500 text-white"
                      : "bg-cyan-600 text-white"
                    : theme === "light"
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Check-in
              </button>
                <div
                  className={`h-3 w-px ${
                    theme === "light" ? "bg-gray-300" : "bg-gray-600"
                  }`}
                ></div>
                <button
                  onClick={() => {
                    setActiveFilter("close");
                    setContactsPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    activeFilter === "close"
                      ? theme === "light"
                        ? "bg-blue-500 text-white"
                        : "bg-cyan-600 text-white"
                      : theme === "light"
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setActiveFilter("work");
                    setContactsPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    activeFilter === "work"
                      ? theme === "light"
                        ? "bg-blue-500 text-white"
                        : "bg-cyan-600 text-white"
                      : theme === "light"
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Work
                </button>
              <button
                onClick={() => {
                  setActiveFilter("family");
                  setContactsPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeFilter === "family"
                    ? theme === "light"
                      ? "bg-blue-500 text-white"
                      : "bg-cyan-600 text-white"
                    : theme === "light"
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Family
              </button>
              <button
                onClick={() => {
                  setActiveFilter("all");
                  setContactsPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeFilter === "all"
                    ? theme === "light"
                      ? "bg-blue-500 text-white"
                      : "bg-cyan-600 text-white"
                    : theme === "light"
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                All
              </button>
              </div>
            </div>

            {/* Contact List */}
            <div className="space-y-2 pt-4">
              <div
                className={`grid ${
                  activeFilter === "overdue"
                    ? "grid-cols-[1.4fr_1fr_1fr_140px_140px]"
                    : "grid-cols-[1.6fr_1fr_1fr_160px]"
                } gap-3 px-3 py-2 text-sm font-semibold rounded-lg ${
                  theme === "light"
                    ? "bg-gray-50 text-gray-600"
                    : "bg-gray-900/40 text-gray-300"
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
                  className={`flex items-center gap-1 text-left transition-colors ${
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
                  className={`flex items-center gap-1 text-left transition-colors ${
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
                  className={`flex items-center justify-end gap-1 text-right transition-colors ${
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
                {activeFilter === "overdue" && (
                  <button
                    type="button"
                    onClick={() => {
                      setSortKey("nextMeet");
                      setSortDirection((current) =>
                        sortKey === "nextMeet" && current === "desc"
                          ? "asc"
                          : "desc"
                      );
                    }}
                    className={`flex items-center justify-end gap-1 text-right transition-colors ${
                      theme === "light"
                        ? "text-gray-500 hover:text-gray-700"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                    aria-label="Sort by next meet"
                  >
                    Next meet
                    {sortKey === "nextMeet" && (
                      <span aria-hidden="true">
                        {sortDirection === "desc" ? "↓" : "↑"}
                      </span>
                    )}
                  </button>
                )}
              </div>
              {paginatedContacts.map((contact) => {
                const rowContent = (
                  <div
                    className={`grid ${
                      activeFilter === "overdue"
                        ? "grid-cols-[1.4fr_1fr_1fr_140px_140px]"
                        : "grid-cols-[1.6fr_1fr_1fr_160px]"
                    } items-center gap-3`}
                  >
                    <div
                      className={`font-semibold text-base ${
                        theme === "light" ? "text-gray-900" : "text-gray-100"
                      }`}
                    >
                      {contact.name}
                    </div>
                    <div
                      className={`text-sm ${
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {contact.location}
                    </div>
                    <div className="flex items-center gap-2">
                      {contact.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className={`text-sm ${
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
                        className={`text-sm ${
                          contact.status === "overdue"
                            ? "text-red-500"
                            : theme === "light"
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                      >
                        {typeof contact.daysAgo === "number"
                          ? formatRelative(contact.daysAgo)
                          : contact.lastContact}
                      </div>
                    </div>
                    {activeFilter === "overdue" && (
                      <div
                        className={`text-sm text-right ${
                          theme === "light" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        {contact.nextMeetDate
                          ? formatUntil(contact.nextMeetDate)
                          : "—"}
                      </div>
                    )}
                  </div>
                );

                if (contact.isQuick) {
                  return (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => openQuickContactEditor(contact.id)}
                      className={`block w-full text-left p-3 rounded-xl transition-all duration-200 ${
                        theme === "light"
                          ? "hover:bg-gray-50"
                          : "hover:bg-gray-900"
                      }`}
                    >
                      {rowContent}
                    </button>
                  );
                }

                const profileHref = contact.id.startsWith("full-")
                  ? `/chardemo2?id=${contact.id}`
                  : "/chardemo2";

                return (
                  <Link
                    key={contact.id}
                    href={profileHref}
                    className={`block p-3 rounded-xl transition-all duration-200 ${
                      theme === "light"
                        ? "hover:bg-gray-50"
                        : "hover:bg-gray-900"
                    }`}
                  >
                    {rowContent}
                  </Link>
                );
              })}
            </div>
            {filteredContacts.length > contactsPerPage && (
              <div className="flex items-center justify-end gap-2 pt-4">
                <span
                  className={`text-xs ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Page
                </span>
                <select
                  value={contactsPage}
                  onChange={(event) =>
                    setContactsPage(Number(event.target.value))
                  }
                  className={`px-2 py-1 text-sm rounded border transition-all duration-200 ${
                    theme === "light"
                      ? "border-gray-300 bg-white text-gray-900"
                      : "border-gray-600 bg-gray-800 text-gray-100"
                  } focus:outline-none`}
                >
                  {Array.from({ length: totalContactPages }, (_, index) => (
                    <option key={index + 1} value={index + 1}>
                      {index + 1}
                    </option>
                  ))}
                </select>
                <span
                  className={`text-xs ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  of {totalContactPages}
                </span>
                <Link
                  href="/contacts"
                  className={`hidden md:inline-flex px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 ${
                    theme === "light"
                      ? "border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600"
                      : "border-gray-700 text-gray-300 hover:border-cyan-700 hover:text-cyan-400"
                  }`}
                >
                  View All
                </Link>
              </div>
            )}
          </div>

            {/* Recent Activity */}
          <div
            className={`rounded-2xl p-5 border transition-all duration-300 h-full ${
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
              Recent Activity
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
            {session && (
              <div className="flex items-center justify-center gap-2">
                <button
                  className={`rounded-md px-2 py-1 transition-colors ${
                    theme === "light"
                      ? "text-gray-700 hover:bg-gray-100"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                  aria-label="Share"
                >
                  🔗
                </button>
                <span aria-hidden="true">🖨️</span>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className={`rounded-md px-2 py-1 transition-colors ${
                    theme === "light"
                      ? "text-gray-700 hover:bg-gray-100"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                  aria-label="Open settings"
                >
                  ⚙️
                </button>
              </div>
            )}
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
      {session && isSettingsOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              theme === "light"
                ? "bg-white border-gray-200"
                : "bg-gray-900 border-gray-800"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setIsSettingsOpen(false)}
              className={`absolute right-3 top-3 rounded-md px-2 py-1 text-lg transition-colors ${
                theme === "light"
                  ? "text-gray-500 hover:bg-gray-100"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
              aria-label="Close settings"
            >
              ×
            </button>
            <h3
              className={`text-lg font-semibold ${
                theme === "light" ? "text-gray-900" : "text-gray-100"
              }`}
            >
              Settings
            </h3>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={`${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  }`}
                >
                  Signed in as{" "}
                  <span
                    className={`${
                      theme === "light" ? "text-gray-900" : "text-gray-100"
                    }`}
                  >
                    {session.user?.name || "User"}
                  </span>
                  {session.user?.email && (
                    <span
                      className={`${
                        theme === "light"
                          ? "text-gray-600"
                          : "text-gray-400"
                      }`}
                    >
                      {" "}
                      ({session.user.email})
                    </span>
                  )}
                </div>
                <button
                  onClick={() => signOut()}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    theme === "light"
                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      : "bg-gray-700 text-gray-100 hover:bg-gray-600"
                  }`}
                >
                  Log out
                </button>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    theme === "light"
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    theme === "light"
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-cyan-600 text-white hover:bg-cyan-500"
                  }`}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isContactModalOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 px-4"
          onClick={() => {
            setIsContactModalOpen(false);
            resetContactForm();
          }}
        >
          <div
            className={`relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${
              theme === "light"
                ? "bg-white border-gray-200"
                : "bg-gray-900 border-gray-800"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => {
                setIsContactModalOpen(false);
                resetContactForm();
              }}
              className={`absolute right-3 top-3 rounded-md px-2 py-1 text-lg transition-colors ${
                theme === "light"
                  ? "text-gray-500 hover:bg-gray-100"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
              aria-label="Close contact modal"
            >
              ×
            </button>
            <div className="flex items-center justify-between gap-3">
              <h3
                className={`text-lg font-semibold ${
                  theme === "light" ? "text-gray-900" : "text-gray-100"
                }`}
              >
                {editingQuickId ? "Quick Contact" : "New Quick Contact"}
              </h3>
            </div>
            <div className="mt-4 grid gap-4 text-sm">
              <label className="grid gap-1">
                <span
                  className={`text-xs uppercase tracking-wide ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Name
                </span>
                <input
                  type="text"
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  className={`rounded-lg border px-3 py-2 ${
                    theme === "light"
                      ? "border-gray-300 bg-white text-gray-900"
                      : "border-gray-700 bg-gray-900 text-gray-100"
                  }`}
                  placeholder="Who did you meet?"
                />
              </label>
              <label className="grid gap-1">
                <span
                  className={`text-xs uppercase tracking-wide ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Location
                </span>
                <input
                  type="text"
                  value={contactLocation}
                  onChange={(event) => setContactLocation(event.target.value)}
                  className={`rounded-lg border px-3 py-2 ${
                    theme === "light"
                      ? "border-gray-300 bg-white text-gray-900"
                      : "border-gray-700 bg-gray-900 text-gray-100"
                  }`}
                  placeholder="Where are they based?"
                />
              </label>
              <label className="grid gap-1">
                <span
                  className={`text-xs uppercase tracking-wide ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Notes
                </span>
                <textarea
                  value={contactNotes}
                  onChange={(event) => setContactNotes(event.target.value)}
                  className={`min-h-[110px] rounded-lg border px-3 py-2 ${
                    theme === "light"
                      ? "border-gray-300 bg-white text-gray-900"
                      : "border-gray-700 bg-gray-900 text-gray-100"
                  }`}
                  placeholder="Anything to remember?"
                />
              </label>
              <p
                className={`text-xs ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Quick contacts are auto-tagged with “Quick”.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
              <Link
                href={{
                  pathname: "/chardemo2",
                  query: {
                    new: "1",
                    name: contactName || undefined,
                    location: contactLocation || undefined,
                    notes: contactNotes || undefined,
                    quickId: editingQuickId || undefined,
                  },
                }}
                onClick={() => {
                  setIsContactModalOpen(false);
                  resetContactForm();
                }}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  theme === "light"
                    ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    : "bg-gray-700 text-gray-100 hover:bg-gray-600"
                }`}
              >
                {editingQuickId ? "Convert to Full" : "Full Contact"}
              </Link>
              <button
                onClick={() => {
                  setIsContactModalOpen(false);
                  resetContactForm();
                }}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  theme === "light"
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const trimmedName = contactName.trim();
                  if (!trimmedName) {
                    return;
                  }
                  if (editingQuickId) {
                    setQuickContacts((current) =>
                      current.map((contact) =>
                        contact.id === editingQuickId
                          ? {
                              ...contact,
                              name: trimmedName,
                              location: contactLocation.trim(),
                              notes: contactNotes.trim(),
                            }
                          : contact
                      )
                    );
                  } else {
                    const newQuickContact: QuickContact = {
                      id: `quick-${Date.now()}`,
                      name: trimmedName,
                      location: contactLocation.trim(),
                      notes: contactNotes.trim(),
                      tags: [],
                      lastContact: formatMonthDay(new Date()),
                    };
                    setQuickContacts((current) => [
                      newQuickContact,
                      ...current,
                    ]);
                  }
                  setIsContactModalOpen(false);
                  resetContactForm();
                }}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  theme === "light"
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-cyan-600 text-white hover:bg-cyan-500"
                }`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
