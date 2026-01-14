"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

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
};

type QuickContact = {
  id: string;
  name: string;
  location: string;
  notes: string;
  tags: string[];
  lastContact: string;
};

export default function ContactsPage() {
  const [theme, setTheme] = useState<Theme>("light");
  const [locationFilter, setLocationFilter] = useState("All");
  const [circleFilter, setCircleFilter] = useState("All");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactLocation, setContactLocation] = useState("");
  const [contactNotes, setContactNotes] = useState("");
  const [editingQuickId, setEditingQuickId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<"name" | "location" | "lastContact">(
    "lastContact"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [quickContacts, setQuickContacts] = useState<QuickContact[]>([]);
  const [extraContacts, setExtraContacts] = useState<Contact[]>([]);
  const [hasLoadedContacts, setHasLoadedContacts] = useState(false);
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

  const baseContacts: Contact[] = [
    {
      id: "4",
      initials: "EN",
      name: "Edward Norton",
      tags: ["Close", "Friends"],
      location: "New York",
      lastContact: "Jan 10",
      daysAgo: 3,
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

  const locations = Array.from(
    new Set(allContacts.map((contact) => contact.location))
  ).sort();
  const circles = Array.from(
    new Set(allContacts.flatMap((contact) => contact.tags))
  ).sort();
  const orderedCircles = circles.includes("Quick")
    ? ["Quick", ...circles.filter((circle) => circle !== "Quick")]
    : circles;
  const visibleCircles = orderedCircles.slice(0, 5);

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

  const filteredContacts = useMemo(() => {
    return allContacts.filter((contact) => {
      const matchesLocation =
        locationFilter === "All" || contact.location === locationFilter;
      const matchesCircle =
        circleFilter === "All" || contact.tags.includes(circleFilter);
      return matchesLocation && matchesCircle;
    });
  }, [allContacts, locationFilter, circleFilter]);

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
            onClick={() => {
              resetContactForm();
              setIsContactModalOpen(true);
            }}
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
              className={`grid grid-cols-[1.6fr_1fr_1fr_180px] gap-3 px-3 text-sm font-semibold uppercase tracking-wide ${
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
            {sortedContacts.map((contact) => {
              const rowContent = (
                <div className="grid grid-cols-[1.6fr_1fr_1fr_180px] items-center gap-3">
                  <div
                    className={`font-semibold text-base ${
                      theme === "light"
                        ? "text-gray-900"
                        : "text-gray-100"
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
        </div>
      </div>
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
