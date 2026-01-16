"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useScopedLocalStorage } from "@/hooks/use-scoped-local-storage";
import { useContacts } from "@/hooks/use-contacts";
import { useCircles } from "@/hooks/use-circles";
import { type CircleSetting } from "@/lib/circle-settings";
import { createContactSlug } from "@/lib/contact-slug";
import { AppNavbar } from "@/app/components/AppNavbar";
import { useTheme } from "@/app/theme-context";

export const dynamic = "force-dynamic";

type Contact = {
  id: string;
  initials: string;
  name: string;
  tags: string[];
  location: string;
  lastContact: string;
  daysAgo: number | null;
  status?: "overdue" | "today" | "upcoming";
  daysOverdue?: number;
  isQuick?: boolean;
  notes?: string;
  nextMeetDate?: string | null;
};

type StoredContact = Contact & {
  slug?: string;
  profileFields?: {
    id: string;
    label: string;
    value: string;
    subValue?: string;
    type?: string;
  }[];
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
  const { theme, toggleTheme } = useTheme();
  const [searchValue, setSearchValue] = useState("");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactLocation, setContactLocation] = useState("");
  const [contactNotes, setContactNotes] = useState("");
  const [editingQuickId, setEditingQuickId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sortKey, setSortKey] = useState<"name" | "location" | "lastContact">(
    "lastContact"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const {
    value: quickContacts,
    setValue: setQuickContacts,
  } = useScopedLocalStorage<QuickContact[]>({
    demoKey: "demo_quick_contacts",
    liveKeyPrefix: "live_quick_contacts_",
    initialValue: [],
  });
  const {
    value: extraContacts,
    setValue: setExtraContacts,
    storageKey: fullContactsStorageKey,
  } = useScopedLocalStorage<StoredContact[]>({
    demoKey: "demo_full_contacts",
    liveKeyPrefix: "live_full_contacts_",
    initialValue: [],
  });
  const {
    value: contactFilterState,
    setValue: setContactFilterState,
  } = useScopedLocalStorage<{
    location: string;
    circles: string[];
  }>({
    demoKey: "demo_contacts_filters",
    liveKeyPrefix: "live_contacts_filters_",
    initialValue: { location: "All", circles: [] },
  });
  const locationFilter = contactFilterState.location;
  const circleFilters = contactFilterState.circles;
  const setLocationFilter = (location: string) => {
    setContactFilterState((current) => ({ ...current, location }));
  };
  const setCircleFilters = (
    nextValue: string[] | ((current: string[]) => string[])
  ) => {
    setContactFilterState((current) => ({
      ...current,
      circles:
        typeof nextValue === "function" ? nextValue(current.circles) : nextValue,
    }));
  };
  const isDemoMode = (fullContactsStorageKey ?? "").startsWith("demo_");
  const { circles: circleSettings, setCircles: setCircleSettings } = useCircles();
  const [draftCircleSettings, setDraftCircleSettings] =
    useState<CircleSetting[]>(circleSettings);
  const activeCircles = circleSettings
    .filter((circle) => circle.isActive && circle.name.trim())
    .map((circle) => circle.name.trim());
  const hasInvalidActiveCircle = draftCircleSettings.some(
    (circle) => circle.isActive && !circle.name.trim()
  );
  const { data: session } = useSession();
  const [quickIdParam, setQuickIdParam] = useState<string | null>(null);
  const {
    contacts: dbContacts,
    isLoading: isLoadingDbContacts,
    addContact,
    updateContact,
    deleteContact,
  } = useContacts();

  const renameCircleTags = async (oldName: string, newName: string) => {
    const from = oldName.trim();
    const to = newName.trim();
    if (!from || !to) {
      return;
    }
    if (from.toLowerCase() === to.toLowerCase()) {
      return;
    }
    const renameTags = (tags: string[]) => {
      const nextTags = tags.map((tag) =>
        tag.toLowerCase() === from.toLowerCase() ? to : tag
      );
      return Array.from(new Set(nextTags));
    };

    // Update localStorage contacts (for demo mode)
    setExtraContacts((current) =>
      current.map((contact) => ({
        ...contact,
        tags: renameTags(contact.tags),
      }))
    );
    setQuickContacts((current) =>
      current.map((contact) => ({
        ...contact,
        tags: renameTags(contact.tags),
      }))
    );

    // Update database contacts (for live mode)
    if (isLiveMode) {
      const contactsToUpdate = dbContacts.filter((contact: any) =>
        contact.tags.some((tag: string) => tag.toLowerCase() === from.toLowerCase())
      );

      await Promise.all(
        contactsToUpdate.map((contact: any) =>
          updateContact({
            id: contact.id,
            tags: renameTags(contact.tags),
          })
        )
      );
    }
  };
  const handleSaveCircleSettings = async () => {
    if (hasInvalidActiveCircle) {
      return;
    }

    // Process all circle renames
    const renamePromises = draftCircleSettings.map(async (draft) => {
      const existing = circleSettings.find((item) => item.id === draft.id);
      if (!existing) {
        return;
      }
      if (!existing.name.trim() || !draft.name.trim()) {
        return;
      }
      if (existing.name.trim() !== draft.name.trim()) {
        await renameCircleTags(existing.name, draft.name);
      }
    });

    await Promise.all(renamePromises);
    await setCircleSettings(draftCircleSettings);
    setIsSettingsOpen(false);
  };

  useEffect(() => {
    if (isSettingsOpen) {
      setDraftCircleSettings(circleSettings);
    }
  }, [circleSettings, isSettingsOpen]);

  const formatMonthDay = (value: Date) =>
    value.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const escapeIcsText = (value: string) =>
    value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,");
  const formatIcsDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };
  const parseMonthDayValue = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split("-").map(Number);
      if (!Number.isNaN(month) && !Number.isNaN(day)) {
        return { month: month - 1, day };
      }
    }
    const [monthLabel, dayLabel] = trimmed.split(" ");
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
    ].indexOf(monthLabel);
    const dayNumber = Number(dayLabel);
    if (monthIndex < 0 || Number.isNaN(dayNumber)) {
      return null;
    }
    return { month: monthIndex, day: dayNumber };
  };
  const buildCalendarIcs = (
    events: { uid: string; summary: string; date: Date; rrule?: string }[]
  ) => {
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Networkia//EN",
      "CALSCALE:GREGORIAN",
    ];
    events.forEach((event) => {
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${escapeIcsText(event.uid)}`);
      lines.push(`DTSTART;VALUE=DATE:${formatIcsDate(event.date)}`);
      lines.push(`SUMMARY:${escapeIcsText(event.summary)}`);
      if (event.rrule) {
        lines.push(event.rrule);
      }
      lines.push("END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    return `${lines.join("\r\n")}\r\n`;
  };
  const handleExportCalendar = () => {
    const events: { uid: string; summary: string; date: Date; rrule?: string }[] =
      [];
    const added = new Set<string>();
    extraContacts.forEach((contact) => {
      if (contact.nextMeetDate) {
        const date = new Date(contact.nextMeetDate);
        if (!Number.isNaN(date.getTime())) {
          const key = `next-${contact.id}-${contact.nextMeetDate}`;
          if (!added.has(key)) {
            added.add(key);
            events.push({
              uid: `networkia-${key}`,
              summary: `Next meet: ${contact.name}`,
              date,
            });
          }
        }
      }
      const birthdayField = contact.profileFields?.find(
        (field) =>
          field.id.toLowerCase() === "birthday" ||
          field.label.toLowerCase() === "birthday"
      );
      if (!birthdayField?.value) {
        return;
      }
      const parsed = parseMonthDayValue(birthdayField.value);
      if (!parsed) {
        return;
      }
      const now = new Date();
      const date = new Date(now.getFullYear(), parsed.month, parsed.day);
      const key = `bday-${contact.id}-${parsed.month}-${parsed.day}`;
      if (added.has(key)) {
        return;
      }
      added.add(key);
      events.push({
        uid: `networkia-${key}`,
        summary: `Birthday: ${contact.name}`,
        date,
        rrule: "RRULE:FREQ=YEARLY",
      });
    });
    if (!events.length) {
      window.alert("No calendar dates to export yet.");
      return;
    }
    const ics = buildCalendarIcs(events);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "networkia-calendar.ics";
    link.click();
    URL.revokeObjectURL(url);
  };
  const resetContactForm = () => {
    setContactName("");
    setContactLocation("");
    setContactNotes("");
    setEditingQuickId(null);
  };
  const openQuickContactEditor = (contactId: string) => {
    const isLiveMode = Boolean(session?.user?.email) && !isDemoMode;
    const source = isLiveMode
      ? dbContacts.filter((contact: any) => contact.isQuickContact)
      : quickContacts;
    const quickContact = source.find((contact: any) => contact.id === contactId);
    if (!quickContact) {
      return;
    }
    setEditingQuickId(quickContact.id);
    setContactName(quickContact.name);
    setContactLocation(quickContact.location ?? "");
    setContactNotes(
      isLiveMode
        ? ((quickContact as { personalNotes?: string }).personalNotes ?? "")
        : ((quickContact as { notes?: string }).notes ?? "")
    );
    setIsContactModalOpen(true);
  };
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    setQuickIdParam(params.get("quickId"));
  }, []);
  useEffect(() => {
    if (quickIdParam) {
      openQuickContactEditor(quickIdParam);
    }
  }, [quickIdParam, dbContacts, quickContacts]);

  const baseContacts: Contact[] = [
    {
      id: "4",
      initials: "EN",
      name: "Edward Norton",
      tags: ["Friend", "Work"],
      location: "New York",
      lastContact: "Jan 10",
      daysAgo: 3,
    },
    {
      id: "5",
      initials: "DB",
      name: "Dan Brown",
      tags: ["New"],
      location: "New York",
      lastContact: "Jan 13",
      daysAgo: 0,
    },
    {
      id: "1",
      initials: "SC",
      name: "Sarah Chen",
      tags: ["Friend", "Work"],
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
      tags: ["Work", "Friend"],
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
      tags: ["Friend"],
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
      tags: ["Friend"],
      location: "Toronto",
      lastContact: "Nov 29",
      daysAgo: 45,
      status: "overdue",
    },
    {
      id: "12",
      initials: "HG",
      name: "Hana Garcia",
      tags: ["Friend"],
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
      tags: ["New"],
      location: "New York",
      lastContact: "Jan 9",
      daysAgo: 4,
    },
    {
      id: "16",
      initials: "NT",
      name: "Nina Torres",
      tags: ["Friend"],
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
      tags: ["New"],
      location: "Miami",
      lastContact: "Dec 15",
      daysAgo: 29,
    },
    {
      id: "19",
      initials: "ID",
      name: "Ivan Diaz",
      tags: ["Friend"],
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
  const getDaysAgoFromMonthDay = (value: string) => {
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
    if (monthIndex < 0 || Number.isNaN(dayNumber)) {
      return 0;
    }
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let target = new Date(now.getFullYear(), monthIndex, dayNumber);
    if (target.getTime() > today.getTime()) {
      target = new Date(now.getFullYear() - 1, monthIndex, dayNumber);
    }
    return Math.max(
      0,
      Math.round(
        (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
  };
  const quickContactsAsContacts: Contact[] = quickContacts.map((contact) => ({
    id: contact.id,
    initials: contact.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    name: contact.name,
    tags: ["Just Met", ...contact.tags],
    location: contact.location || "—",
    lastContact: contact.lastContact,
    daysAgo: getDaysAgoFromMonthDay(contact.lastContact),
    isQuick: true,
    notes: contact.notes,
  }));

  // Use database contacts if authenticated and not in demo mode, otherwise use localStorage
  const isLiveMode = Boolean(session?.user?.email) && !isDemoMode;
  const allContacts: Contact[] = isLiveMode
    ? dbContacts.map((contact: any): Contact => ({
        id: contact.id,
        initials: contact.initials || "",
        name: contact.name,
        tags: contact.isQuickContact
          ? Array.from(new Set(["Just Met", ...(contact.tags || [])]))
          : contact.tags || [],
        location: contact.location || "",
        lastContact: contact.lastContact || "",
        daysAgo: contact.daysAgo !== null && contact.daysAgo !== undefined ? contact.daysAgo : null,
        status: typeof contact.daysAgo === 'number' && contact.daysAgo > 30 ? "overdue" : undefined,
        isQuick: contact.isQuickContact,
        notes: contact.personalNotes,
        nextMeetDate: contact.nextMeetDate,
      }))
    : [
        ...(isDemoMode ? baseContacts : []),
        ...extraContacts,
        ...quickContactsAsContacts,
      ];
  const allowedTagSet = new Set(
    ["Just Met", ...activeCircles].map((tag) => tag.toLowerCase())
  );
  const displayTagsFor = (tags: string[]) =>
    tags.filter((tag) => allowedTagSet.has(tag.toLowerCase()));
  const getTagDisplay = (tags: string[]) => {
    const filtered = displayTagsFor(tags);
    return {
      visible: filtered.slice(0, 2),
      hidden: filtered.slice(2),
    };
  };

  const locations = Array.from(
    new Set(allContacts.map((contact) => contact.location))
  ).sort();
  const hasJustMet = allContacts.some((contact) =>
    contact.tags.some((tag) => tag.toLowerCase() === "just met")
  );
  const visibleCircles = [
    ...(hasJustMet ? ["Just Met"] : []),
    ...activeCircles,
  ];

  const getContactDaysAgo = (contact: Contact) =>
    typeof contact.daysAgo === "number" && !Number.isNaN(contact.daysAgo)
      ? contact.daysAgo
      : !contact.lastContact?.trim()
      ? Number.POSITIVE_INFINITY
      : getDaysAgoFromMonthDay(contact.lastContact);
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

  const searchTerm = searchValue.trim().toLowerCase();
  const filteredContacts = useMemo(() => {
    return allContacts.filter((contact) => {
      if (searchTerm) {
        const tagsText = contact.tags.join(" ").toLowerCase();
        const noteText = contact.notes ? contact.notes.toLowerCase() : "";
        return (
          contact.name.toLowerCase().includes(searchTerm) ||
          contact.location.toLowerCase().includes(searchTerm) ||
          tagsText.includes(searchTerm) ||
          noteText.includes(searchTerm)
        );
      }
      const matchesLocation =
        locationFilter === "All" || contact.location === locationFilter;
      const matchesCircle =
        circleFilters.length === 0 ||
        contact.tags.some((tag) => circleFilters.includes(tag.toLowerCase()));
      return matchesLocation && matchesCircle;
    });
  }, [allContacts, locationFilter, circleFilters, searchTerm]);

  const sortedContacts = useMemo(() => {
    const sorted = [...filteredContacts];
    sorted.sort((a, b) => {
      if (sortKey === "lastContact") {
        const aValue = getContactDaysAgo(a);
        const bValue = getContactDaysAgo(b);
        const aMissing = !Number.isFinite(aValue);
        const bMissing = !Number.isFinite(bValue);
        if (aMissing !== bMissing) {
          return aMissing ? 1 : -1;
        }
        return sortDirection === "desc"
          ? bValue - aValue
          : aValue - bValue;
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

  // Count contacts per circle (based on location filter only, not circle filter)
  const contactCountsByCircle = useMemo(() => {
    const baseFiltered = allContacts.filter((contact) => {
      if (searchTerm) {
        const tagsText = contact.tags.join(" ").toLowerCase();
        const noteText = contact.notes ? contact.notes.toLowerCase() : "";
        return (
          contact.name.toLowerCase().includes(searchTerm) ||
          contact.location.toLowerCase().includes(searchTerm) ||
          tagsText.includes(searchTerm) ||
          noteText.includes(searchTerm)
        );
      }
      return locationFilter === "All" || contact.location === locationFilter;
    });

    const counts: Record<string, number> = { all: baseFiltered.length };
    for (const circle of visibleCircles) {
      const key = circle.toLowerCase();
      counts[key] = baseFiltered.filter((contact) =>
        contact.tags.some((tag) => tag.toLowerCase() === key)
      ).length;
    }
    return counts;
  }, [allContacts, locationFilter, searchTerm, visibleCircles]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AppNavbar
        theme={theme}
        active="contacts"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onToggleTheme={toggleTheme}
        onAddContact={() => {
          resetContactForm();
          setIsContactModalOpen(true);
        }}
      />

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="min-h-full flex flex-col">
        <div className="px-4 pt-10 pb-24 md:px-8">
          <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
            </div>
          </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs uppercase tracking-wide ${
                theme === "light" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              City
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
              <button
                type="button"
                onClick={() => setCircleFilters([])}
                className={`rounded-full px-3 py-1 text-xs md:text-sm font-medium transition-all ${
                  circleFilters.length === 0
                    ? theme === "light"
                      ? "bg-blue-500 text-white"
                      : "bg-cyan-600 text-white"
                    : theme === "light"
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                }`}
              >
                All ({contactCountsByCircle.all})
              </button>
              {visibleCircles.map((circle) => {
                const key = circle.toLowerCase();
                const isActive = circleFilters.includes(key);
                const count = contactCountsByCircle[key] || 0;
                return (
                  <button
                    key={circle}
                    type="button"
                    onClick={() =>
                      setCircleFilters((current) =>
                        isActive
                          ? current.filter((item) => item !== key)
                          : [...current, key]
                      )
                    }
                    className={`rounded-full px-3 py-1 text-xs md:text-sm font-medium transition-all ${
                      isActive
                        ? theme === "light"
                          ? "bg-blue-500 text-white"
                          : "bg-cyan-600 text-white"
                        : theme === "light"
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                    }`}
                  >
                    {circle} ({count})
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
              className={`grid grid-cols-[1.4fr_1.3fr_1fr_90px] gap-3 px-3 text-sm font-semibold uppercase tracking-wide sm:grid-cols-[1.4fr_1.3fr_1fr_140px] lg:grid-cols-[1.4fr_1.3fr_1fr_180px] ${
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
                aria-label="Sort by city"
              >
                City
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
                <span className="hidden sm:inline">Last Contacted</span>
                <span className="sm:hidden">Last</span>
                {sortKey === "lastContact" && (
                  <span aria-hidden="true">
                    {sortDirection === "desc" ? "↓" : "↑"}
                  </span>
                )}
              </button>
            </div>
            {sortedContacts.length === 0 ? (
              <div
                className={`rounded-xl border border-dashed px-6 py-10 text-center text-sm ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                No contacts yet. Add your first contact to get started.
              </div>
            ) : (
              sortedContacts.map((contact) => {
              const rowContent = (
                <div className="grid grid-cols-[1.4fr_1.3fr_1fr_90px] items-center gap-3 sm:grid-cols-[1.4fr_1.3fr_1fr_140px] lg:grid-cols-[1.4fr_1.3fr_1fr_180px]">
                  <div
                    className={`min-w-0 truncate font-semibold text-base ${
                      theme === "light"
                        ? "text-gray-900"
                        : "text-gray-100"
                    }`}
                  >
                    {contact.name}
                  </div>
                  <div
                    className={`min-w-0 truncate text-sm ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {contact.location}
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const { visible, hidden } = getTagDisplay(contact.tags);
                      const primaryTag = visible[0];
                      const hasMoreTags = visible.length + hidden.length > 1;
                      if (visible.length === 0) {
                        return (
                          <span
                            className={`text-sm ${
                              theme === "light"
                                ? "text-gray-500"
                                : "text-gray-500"
                            }`}
                          >
                            —
                          </span>
                        );
                      }
                      return (
                        <>
                          <span
                            className={`sm:hidden text-sm ${
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-400"
                            }`}
                          >
                            {primaryTag}
                            {hasMoreTags && " .."}
                          </span>
                          <span className="hidden sm:inline">
                            {visible.map((tag, idx) => (
                              <span
                                key={idx}
                                className={`text-sm ${
                                  theme === "light"
                                    ? "text-gray-600"
                                    : "text-gray-400"
                                }`}
                              >
                                {tag}
                                {idx < visible.length - 1 && " • "}
                              </span>
                            ))}
                            {hidden.length > 0 && (
                              <span className="relative group text-xs font-medium">
                                <span
                                  className={`${
                                    theme === "light"
                                      ? "text-gray-500"
                                      : "text-gray-400"
                                  }`}
                                >
                                  +{hidden.length}
                                </span>
                                <span
                                  className={`pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max -translate-x-1/2 rounded-lg px-3 py-1.5 text-xs shadow-lg opacity-0 transition-opacity group-hover:opacity-100 ${
                                    theme === "light"
                                      ? "bg-gray-900 text-white"
                                      : "bg-gray-100 text-gray-900"
                                  }`}
                                >
                                  {hidden.join(" • ")}
                                </span>
                              </span>
                            )}
                          </span>
                        </>
                      );
                    })()}
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
                      {contact.daysAgo === null
                        ? ""
                        : typeof contact.daysAgo === "number"
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
                ? `/contact/${
                    "slug" in contact && contact.slug
                      ? contact.slug
                      : createContactSlug(contact.name, contact.id)
                  }`
                : `/contact/${createContactSlug(contact.name, contact.id)}`;

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
            })
            )}
          </div>
          </div>
        </div>
        </div>

        <footer
          className={`relative z-10 mt-24 border-t ${
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
                  <button
                    onClick={handleExportCalendar}
                    className={`rounded-md px-2 py-1 transition-colors ${
                      theme === "light"
                        ? "text-gray-700 hover:bg-gray-100"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                    aria-label="Export calendar"
                  >
                    📅
                  </button>
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
              <Link
                href="/privacy"
                className={`text-sm transition-colors ${
                  theme === "light"
                    ? "text-gray-600 hover:text-blue-600"
                    : "text-gray-400 hover:text-cyan-400"
                }`}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className={`text-sm transition-colors ${
                  theme === "light"
                    ? "text-gray-600 hover:text-blue-600"
                    : "text-gray-400 hover:text-cyan-400"
                }`}
              >
                Terms of Service
              </Link>
              </div>
              <p
                className={`text-xs ${
                  theme === "light" ? "text-gray-500" : "text-gray-500"
                }`}
              >
                © 2026 Networkia
              </p>
            </div>
          </div>
        </footer>
        </div>
      </div>
      {session && isSettingsOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 px-4"
          onClick={() => {
            if (hasInvalidActiveCircle) {
              return;
            }
            setIsSettingsOpen(false);
          }}
        >
          <div
            className={`relative w-full max-w-2xl rounded-2xl border p-6 shadow-2xl ${
              theme === "light"
                ? "bg-white border-gray-200"
                : "bg-gray-900 border-gray-800"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => {
                if (hasInvalidActiveCircle) {
                  return;
                }
                setIsSettingsOpen(false);
              }}
              className={`absolute right-3 top-3 rounded-md px-2 py-1 text-lg transition-colors ${
                theme === "light"
                  ? "text-gray-500 hover:bg-gray-100"
                  : "text-gray-400 hover:bg-gray-800"
              } ${hasInvalidActiveCircle ? "opacity-40 cursor-not-allowed" : ""}`}
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
              <div className="space-y-2">
                <div
                  className={`text-xs uppercase tracking-wide ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Circles (max 10)
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {draftCircleSettings.map((circle) => {
                    const isNameEmpty = circle.name.trim().length === 0;
                    return (
                      <div
                        key={circle.id}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                          circle.isActive && isNameEmpty
                            ? theme === "light"
                              ? "border-red-300 bg-red-50"
                              : "border-red-700 bg-red-900/20"
                            : theme === "light"
                            ? "border-gray-200 bg-white"
                            : "border-gray-700 bg-gray-800"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setDraftCircleSettings((current) =>
                              current.map((item) =>
                                item.id === circle.id
                                  ? { ...item, isActive: !item.isActive }
                                  : item
                              )
                            )
                          }
                          className={`h-5 w-5 rounded border transition-all ${
                            circle.isActive
                              ? theme === "light"
                                ? "bg-blue-500 border-blue-500"
                                : "bg-cyan-600 border-cyan-600"
                              : theme === "light"
                              ? "border-gray-300"
                              : "border-gray-600"
                          }`}
                          aria-label={`Toggle circle ${circle.name || "unnamed"}`}
                        />
                        <input
                          type="text"
                          value={circle.name}
                          onChange={(event) =>
                            setDraftCircleSettings((current) =>
                              current.map((item) =>
                                item.id === circle.id
                                  ? { ...item, name: event.target.value }
                                  : item
                              )
                            )
                          }
                          className={`flex-1 bg-transparent text-sm focus:outline-none ${
                            circle.isActive && isNameEmpty
                              ? theme === "light"
                                ? "text-red-700 placeholder-red-400"
                                : "text-red-300 placeholder-red-500"
                              : theme === "light"
                              ? "text-gray-900 placeholder-gray-400"
                              : "text-gray-100 placeholder-gray-500"
                          }`}
                          placeholder={
                            circle.isActive ? "Name this circle" : "Inactive"
                          }
                        />
                      </div>
                    );
                  })}
                </div>
                <p
                  className={`text-xs ${
                    hasInvalidActiveCircle
                      ? theme === "light"
                        ? "text-red-500"
                        : "text-red-400"
                      : theme === "light"
                      ? "text-gray-500"
                      : "text-gray-400"
                  }`}
                >
                  {hasInvalidActiveCircle
                    ? "Active circles need a name before you can close settings."
                    : 'Name a circle to enable it. "Just Met" is automatic for quick contacts.'}
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    if (hasInvalidActiveCircle) {
                      return;
                    }
                    setIsSettingsOpen(false);
                  }}
                  className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                    theme === "light"
                      ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  } ${
                    hasInvalidActiveCircle ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCircleSettings}
                  className={`px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
                    theme === "light"
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-cyan-600 hover:bg-cyan-500 text-white"
                  } ${
                    hasInvalidActiveCircle ? "opacity-60 cursor-not-allowed" : ""
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
                {editingQuickId ? "Just Met" : "Contact: Just Met"}
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
                  City
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
                  placeholder="Which city?"
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
                Just Met contacts are auto-tagged with "Just Met".
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
              {editingQuickId && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    theme === "light"
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  Delete
                </button>
              )}
              <div className="flex flex-wrap items-center gap-2 ml-auto">
                <Link
                  href={{
                    pathname: "/contact/new",
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
                  if (isLiveMode) {
                    const payload = {
                      name: trimmedName,
                      location: contactLocation.trim(),
                      personalNotes: contactNotes.trim(),
                      tags: ["Just Met"],
                      isQuickContact: true,
                    };
                    if (editingQuickId) {
                      updateContact({
                        id: editingQuickId,
                        ...payload,
                      });
                    } else {
                      addContact({
                        ...payload,
                        lastContact: new Date().toISOString(),
                      });
                    }
                  } else if (editingQuickId) {
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
        </div>
      )}
      {showDeleteConfirm && editingQuickId && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className={`relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl ${
              theme === "light"
                ? "bg-white border-gray-200"
                : "bg-gray-900 border-gray-800"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <h3
              className={`text-lg font-semibold ${
                theme === "light" ? "text-gray-900" : "text-gray-100"
              }`}
            >
              Delete Contact?
            </h3>
            <p
              className={`mt-2 text-sm ${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              }`}
            >
              Are you sure you want to delete this contact? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
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
                  if (isLiveMode) {
                    deleteContact(editingQuickId);
                  } else {
                    setQuickContacts((current) =>
                      current.filter((contact) => contact.id !== editingQuickId)
                    );
                  }
                  setShowDeleteConfirm(false);
                  setIsContactModalOpen(false);
                  resetContactForm();
                }}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  theme === "light"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
