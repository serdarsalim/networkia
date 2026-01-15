"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useScopedLocalStorage } from "@/hooks/use-scoped-local-storage";
import {
  getDefaultCircleSettings,
  type CircleSetting,
} from "@/lib/circle-settings";
import { createContactSlug } from "@/lib/contact-slug";
import { AppNavbar } from "@/app/components/AppNavbar";

type Theme = "light" | "dark";

type Contact = {
  id: string;
  initials: string;
  name: string;
  title?: string;
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

type StoredContact = Contact & {
  slug?: string;
  profileFields?: {
    id: string;
    label: string;
    value: string;
    subValue?: string;
    type?: string;
  }[];
  interactionNotes?: {
    id: string;
    title: string;
    body: string;
    date: string;
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

export default function Dashboard() {
  const [theme, setTheme] = useState<Theme>("light");
  const [searchValue, setSearchValue] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareListOpen, setIsShareListOpen] = useState(false);
  const [shareBaseUrl, setShareBaseUrl] = useState("");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactLocation, setContactLocation] = useState("");
  const [contactNotes, setContactNotes] = useState("");
  const [editingQuickId, setEditingQuickId] = useState<string | null>(null);
  const [contactsPage, setContactsPage] = useState(1);
  const {
    value: contactSortState,
    setValue: setContactSortState,
  } = useScopedLocalStorage<{
    key: "name" | "location" | "lastContact" | "nextMeet";
    direction: "asc" | "desc";
  }>({
    demoKey: "demo_contact_sort",
    liveKeyPrefix: "live_contact_sort_",
    initialValue: { key: "lastContact", direction: "asc" },
  });
  const sortKey = contactSortState.key;
  const sortDirection = contactSortState.direction;
  const {
    value: quickContacts,
    setValue: setQuickContacts,
    isLoaded: areQuickContactsLoaded,
  } = useScopedLocalStorage<QuickContact[]>({
    demoKey: "demo_quick_contacts",
    liveKeyPrefix: "live_quick_contacts_",
    initialValue: [],
  });
  const {
    value: extraContacts,
    setValue: setExtraContacts,
    storageKey: fullContactsStorageKey,
    isLoaded: areExtraContactsLoaded,
  } = useScopedLocalStorage<StoredContact[]>({
    demoKey: "demo_full_contacts",
    liveKeyPrefix: "live_full_contacts_",
    initialValue: [],
  });
  const {
    value: circleSettings,
    setValue: setCircleSettings,
    isLoaded: areCircleSettingsLoaded,
  } = useScopedLocalStorage<CircleSetting[]>({
    demoKey: "demo_circle_settings",
    liveKeyPrefix: "live_circle_settings_",
    initialValue: getDefaultCircleSettings(),
  });
  const {
    value: contactFilterState,
    setValue: setContactFilterState,
    isLoaded: isFilterLoaded,
  } = useScopedLocalStorage<{
    mode: "all" | "overdue" | "circles";
    circles: string[];
  }>({
    demoKey: "demo_contact_filters",
    liveKeyPrefix: "live_contact_filters_",
    initialValue: { mode: "all", circles: [] },
  });
  const activeFilter = contactFilterState.mode;
  const selectedCircleFilters = contactFilterState.circles;
  const isDashboardReady =
    areExtraContactsLoaded && areQuickContactsLoaded && isFilterLoaded;
  const [draftCircleSettings, setDraftCircleSettings] = useState<CircleSetting[]>(
    circleSettings
  );
  const { data: session } = useSession();
  const isDemoMode = (fullContactsStorageKey ?? "").startsWith("demo_");
  const activeCircles = circleSettings
    .filter((circle) => circle.isActive && circle.name.trim())
    .map((circle) => circle.name.trim());
  const hasInvalidActiveCircle = draftCircleSettings.some(
    (circle) => circle.isActive && !circle.name.trim()
  );
  const renameCircleTags = (oldName: string, newName: string) => {
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
  };
  const handleSaveCircleSettings = () => {
    if (hasInvalidActiveCircle) {
      return;
    }
    draftCircleSettings.forEach((draft) => {
      const existing = circleSettings.find((item) => item.id === draft.id);
      if (!existing) {
        return;
      }
      if (!existing.name.trim() || !draft.name.trim()) {
        return;
      }
      if (existing.name.trim() !== draft.name.trim()) {
        renameCircleTags(existing.name, draft.name);
      }
    });
    setCircleSettings(draftCircleSettings);
    setIsSettingsOpen(false);
  };

  useEffect(() => {
    if (isSettingsOpen) {
      setDraftCircleSettings(circleSettings);
    }
  }, [circleSettings, isSettingsOpen]);

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
    if (typeof window !== "undefined") {
      setShareBaseUrl(window.location.origin);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const formatMonthDay = (value: Date) =>
    value.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const sharedContacts = extraContacts.filter(
    (contact) => contact.isShared && contact.shareToken
  );
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
    setEditingQuickId(quickContact.id);
    setContactName(quickContact.name);
    setContactLocation(quickContact.location);
    setContactNotes(quickContact.notes);
    setIsContactModalOpen(true);
  };
  const escapeIcsText = (value: string) =>
    value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,");
  const formatIcsDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };
  const parseMonthDayValue = (value: string) => {
    const parts = value.trim().split(/\s+/);
    if (parts.length < 2) {
      return null;
    }
    const monthMap: Record<string, number> = {
      jan: 0,
      january: 0,
      feb: 1,
      february: 1,
      mar: 2,
      march: 2,
      apr: 3,
      april: 3,
      may: 4,
      jun: 5,
      june: 5,
      jul: 6,
      july: 6,
      aug: 7,
      august: 7,
      sep: 8,
      sept: 8,
      september: 8,
      oct: 9,
      october: 9,
      nov: 10,
      november: 10,
      dec: 11,
      december: 11,
    };
    const month = monthMap[parts[0].toLowerCase()];
    const day = Number(parts[1]);
    if (month === undefined || Number.isNaN(day)) {
      return null;
    }
    return { month, day };
  };
  const buildCalendarIcs = (
    events: { uid: string; summary: string; date: Date; rrule?: string }[]
  ) => {
    const stamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Networkia//EN",
      "CALSCALE:GREGORIAN",
    ];
    events.forEach((event) => {
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${escapeIcsText(event.uid)}`);
      lines.push(`DTSTAMP:${stamp}`);
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
    const storedContacts = extraContacts as Array<{
      id: string;
      name: string;
      profileFields?: { id: string; label: string; value: string }[];
      nextMeetDate?: string | null;
    }>;
    const events: { uid: string; summary: string; date: Date; rrule?: string }[] =
      [];
    const added = new Set<string>();
    allContacts.forEach((contact) => {
      if (!contact.nextMeetDate) {
        return;
      }
      const date = new Date(contact.nextMeetDate);
      if (Number.isNaN(date.getTime())) {
        return;
      }
      const key = `next-${contact.id}-${contact.nextMeetDate}`;
      if (added.has(key)) {
        return;
      }
      added.add(key);
      events.push({
        uid: `networkia-${key}`,
        summary: `Next meet: ${contact.name}`,
        date,
      });
    });
    storedContacts.forEach((contact) => {
      const birthdayField = contact.profileFields?.find(
        (field) =>
          field.id.toLowerCase() === "birthday" ||
          field.label.toLowerCase() === "birthday"
      );
      if (!birthdayField || !birthdayField.value) {
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

  const overdueContacts: Contact[] = [
    {
      id: "1",
      initials: "SC",
      name: "Sarah Chen",
      tags: ["Friend"],
      location: "",
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
      location: "",
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
      location: "",
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
      title:"Class 5 Films",
      tags: ["Friend", "Work"],
      location: "New York",
      lastContact: "Jan 10",
      daysAgo: 3,
      nextMeetDate: "2026-02-05",
    },
    {
      id: "5",
      initials: "DB",
      name: "Dan Brown",
      title:"Author",
      tags: ["Acquaintance"],
      location: "New York",
      lastContact: "Jan 13",
      daysAgo: 0,
    },
    {
      id: "1",
      initials: "SC",
      name: "Sarah Chen",
      title:"Stripe",
      tags: ["Friend", "Work"],
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
      title:"Figma",
      tags: ["Work"],
      location: "San Francisco",
      lastContact: "Jan 5",
      daysAgo: 8,
    },
    {
      id: "7",
      initials: "RM",
      name: "Ravi Mehta",
      title:"Anthropic",
      tags: ["Work", "Friend"],
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
      title:"Tesla",
      tags: ["Friend"],
      location: "Austin",
      lastContact: "Dec 22",
      daysAgo: 22,
      nextMeetDate: "2026-01-20",
    },
    {
      id: "10",
      initials: "MP",
      name: "Maya Patel",
      title:"Shopify",
      tags: ["Work"],
      location: "Toronto",
      lastContact: "Jan 11",
      daysAgo: 2,
    },
    {
      id: "11",
      initials: "OB",
      name: "Owen Brooks",
      title:"York University",
      tags: ["Friend"],
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
      tags: ["Friend"],
      location: "Miami",
      lastContact: "Dec 30",
      daysAgo: 14,
    },
    {
      id: "13",
      initials: "LS",
      name: "Liam Stone",
      title:"Meta",
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
      title:"Goldman Sachs",
      tags: ["Acquaintance"],
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
      title:"Deloitte",
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
      title:"Airbnb",
      tags: ["Friend"],
      location: "San Francisco",
      lastContact: "Jan 1",
      daysAgo: 12,
      nextMeetDate: "2026-01-28",
    },
    {
      id: "20",
      initials: "VT",
      name: "Vera Tan",
      title:"McKinsey",
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
    tags: ["Just Met", ...contact.tags],
    location: contact.location || "—",
    lastContact: contact.lastContact,
    daysAgo: getDaysAgoFromMonthDay(contact.lastContact),
    isQuick: true,
    notes: contact.notes,
  }));
  const allContacts = [
    ...(isDemoMode ? baseContacts : []),
    ...extraContacts,
    ...quickContactsAsContacts,
  ];
  const contactsReady = areExtraContactsLoaded && areQuickContactsLoaded;
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
  const contactsPerPage = 10;
  const getDaysAgoFromDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return Number.NaN;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return Math.round(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
  };
  const getContactDaysAgo = (contact: Contact) => {
    const lastContact = contact.lastContact?.trim();
    if (!lastContact) {
      return Number.POSITIVE_INFINITY;
    }
    if (lastContact.includes("-")) {
      const isoDays = getDaysAgoFromDate(lastContact);
      if (!Number.isNaN(isoDays)) {
        return Math.max(isoDays, 0);
      }
    }
    if (typeof contact.daysAgo === "number" && !Number.isNaN(contact.daysAgo)) {
      return contact.daysAgo;
    }
    return getDaysAgoFromMonthDay(lastContact);
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
  const getContactRelative = (contact: Contact) => {
    const days = getContactDaysAgo(contact);
    if (days === Number.POSITIVE_INFINITY) {
      return "Not yet";
    }
    if (!Number.isFinite(days)) {
      return contact.lastContact;
    }
    return formatRelative(days);
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
  const formatPastFromDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "Unknown";
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 0) {
      return "Today";
    }
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)}w ago`;
    }
    if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)}mo ago`;
    }
    return `${Math.floor(diffDays / 365)}y ago`;
  };
  const searchTerm = searchValue.trim().toLowerCase();
  const filteredContacts = allContacts.filter((contact) => {
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
    if (activeFilter === "all") {
      return true;
    }
    if (activeFilter === "overdue") {
      return Boolean(contact.nextMeetDate);
    }
    if (selectedCircleFilters.length === 0) {
      return true;
    }
    const selectedSet = new Set(
      selectedCircleFilters.map((filter) => filter.toLowerCase())
    );
    return contact.tags.some((tag) => selectedSet.has(tag.toLowerCase()));
  });
  useEffect(() => {
    setContactsPage(1);
  }, [searchTerm]);
  const totalContactPages = Math.max(
    1,
    Math.ceil(filteredContacts.length / contactsPerPage)
  );
  const sortedContacts = [...filteredContacts].sort((a, b) => {
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
  const checkInContacts = [...allContacts]
    .filter((contact) => contact.nextMeetDate)
    .sort((a, b) => {
      const aDate = a.nextMeetDate ? new Date(a.nextMeetDate).getTime() : 0;
      const bDate = b.nextMeetDate ? new Date(b.nextMeetDate).getTime() : 0;
      return aDate - bDate;
    });

  const recentActivity = isDemoMode
    ? [
        { text: "Added note to Edward Norton", time: "2h ago" },
        { text: "Met Dan Brown at conference", time: "5h ago" },
        { text: "Updated Sarah Chen profile", time: "1d ago" },
        { text: "Coffee with Mike", time: "3d ago" },
      ]
    : extraContacts
        .flatMap((contact) => {
          const notes = (contact.interactionNotes ?? []).map((note) => ({
            text: `${note.title || "Interaction"} · ${contact.name}`,
            time: formatPastFromDate(note.date),
            timestamp: new Date(note.date).getTime(),
          }));
          const nextMeetEvents = contact.nextMeetDate
            ? [
                {
                  text: `Next meet set · ${contact.name}`,
                  time: formatUntil(contact.nextMeetDate),
                  timestamp: new Date(contact.nextMeetDate).getTime(),
                },
              ]
            : [];
          return [...notes, ...nextMeetEvents];
        })
        .filter((activity) => !Number.isNaN(activity.timestamp))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 4)
        .map(({ text, time }) => ({ text, time }));
  const selectedCircleSet = new Set(
    selectedCircleFilters.map((filter) => filter.toLowerCase())
  );
  const hasJustMet =
    (contactsReady &&
      allContacts.some((contact) =>
        contact.tags.some((tag) => tag.toLowerCase() === "just met")
      )) ||
    selectedCircleSet.has("just met");
  const circleMemberships = new Set(
    contactsReady
      ? allContacts.flatMap((contact) =>
          contact.tags.map((tag) => tag.toLowerCase())
        )
      : []
  );
  const visibleCircles = contactsReady
    ? activeCircles.filter((circle) => {
        const key = circle.toLowerCase();
        return circleMemberships.has(key) || selectedCircleSet.has(key);
      })
    : activeCircles;
  const tagFilters = [
    ...(hasJustMet ? [{ label: "Just Met", key: "just met" }] : []),
    ...visibleCircles.map((circle) => ({
      label: circle,
      key: circle.toLowerCase(),
    })),
  ];
  const tagFilterKey = tagFilters.map((filter) => filter.key).join("|");
  useEffect(() => {
    if (!contactsReady || !areCircleSettingsLoaded || !isFilterLoaded) {
      return;
    }
    const allowedCircleFilters = new Set(
      tagFilters.map((filter) => filter.key)
    );
    setContactFilterState((current) => {
      const mode =
        current.mode === "overdue" || current.mode === "circles"
          ? current.mode
          : "all";
      const nextCircles = current.circles
        .filter((key) => allowedCircleFilters.has(key))
        .slice(0, 1);
      const nextMode =
        mode === "circles" && nextCircles.length === 0 ? "all" : mode;
      if (
        nextMode === current.mode &&
        nextCircles.length === current.circles.length
      ) {
        return current;
      }
      return {
        mode: nextMode,
        circles: nextCircles,
      };
    });
  }, [
    setContactFilterState,
    tagFilterKey,
    contactsReady,
    areCircleSettingsLoaded,
    isFilterLoaded,
  ]);

  const renderDashboardContent = () => {
    if (!isDashboardReady) {
      return (
        <div className="max-w-7xl mx-auto px-4 pt-10 pb-24 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-6 animate-pulse">
            <div className="space-y-6">
              <div
                className={`rounded-2xl p-6 border ${
                  theme === "light"
                    ? "bg-white border-gray-200"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <div className="h-4 w-24 rounded bg-gray-200/70" />
                <div className="mt-6 space-y-3">
                  <div className="h-10 rounded bg-gray-200/70" />
                  <div className="h-10 rounded bg-gray-200/70" />
                </div>
              </div>
              <div
                className={`rounded-2xl p-6 border ${
                  theme === "light"
                    ? "bg-white border-gray-200"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="h-8 w-32 rounded bg-gray-200/70" />
                  <div className="h-6 w-44 rounded bg-gray-200/70" />
                </div>
                <div className="mt-6 space-y-3">
                  <div className="h-10 rounded bg-gray-200/70" />
                  <div className="h-10 rounded bg-gray-200/70" />
                  <div className="h-10 rounded bg-gray-200/70" />
                </div>
              </div>
            </div>
            <div
              className={`rounded-2xl p-6 border ${
                theme === "light"
                  ? "bg-white border-gray-200"
                  : "bg-gray-800 border-gray-700"
              }`}
            >
              <div className="h-4 w-28 rounded bg-gray-200/70" />
              <div className="mt-6 space-y-3">
                <div className="h-8 rounded bg-gray-200/70" />
                <div className="h-8 rounded bg-gray-200/70" />
                <div className="h-8 rounded bg-gray-200/70" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-24 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-6">
          <div className="space-y-6">
            <div
              className={`rounded-2xl p-6 border transition-all duration-300 ${
                theme === "light"
                  ? "bg-white border-gray-200 shadow-sm"
                  : "bg-gray-800 border-gray-700 shadow-xl"
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2
                  className={`text-xs font-bold uppercase tracking-wider ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Check-ins
                </h2>
              </div>
              {checkInContacts.length === 0 ? (
                <div
                  className={`rounded-xl border border-dashed px-6 py-6 text-center text-sm ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  No check-ins yet. Add a next meet date to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {checkInContacts.slice(0, 4).map((contact) => {
                    const profileHref = contact.id.startsWith("full-")
                      ? `/contact/${
                          "slug" in contact && contact.slug
                            ? contact.slug
                            : createContactSlug(contact.name, contact.id)
                        }`
                      : "/contact/new?new=1";

                    return (
                      <Link
                        key={contact.id}
                        href={profileHref}
                        className={`flex items-center justify-between gap-4 rounded-xl px-3 py-2 transition-colors ${
                          theme === "light"
                            ? "hover:bg-gray-50"
                            : "hover:bg-gray-800"
                        }`}
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <div
                            className={`text-sm font-semibold ${
                              theme === "light"
                                ? "text-gray-900"
                                : "text-gray-100"
                            }`}
                          >
                            {contact.name}
                          </div>
                          <div
                            className={`text-xs ${
                              theme === "light"
                                ? "text-gray-500"
                                : "text-gray-500"
                            }`}
                          >
                            · Last met {getContactRelative(contact)}
                          </div>
                        </div>
                        <div
                          className={`text-sm whitespace-nowrap ${
                            theme === "light"
                              ? "text-gray-600"
                              : "text-gray-300"
                          }`}
                        >
                          {contact.nextMeetDate
                            ? formatUntil(contact.nextMeetDate)
                            : "—"}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div
              className={`rounded-2xl p-6 border transition-all duration-300 ${
                theme === "light"
                  ? "bg-white border-gray-200 shadow-sm"
                  : "bg-gray-800 border-gray-700 shadow-xl"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {tagFilters.map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => {
                        setContactFilterState((current) => {
                          const key = filter.key.toLowerCase();
                          const isActive = current.circles.includes(key);
                          const nextCircles = isActive ? [] : [key];
                          return {
                            mode: nextCircles.length === 0 ? "all" : "circles",
                            circles: nextCircles,
                          };
                        });
                        setContactsPage(1);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                        activeFilter === "circles" &&
                        selectedCircleFilters.includes(filter.key)
                          ? theme === "light"
                            ? "bg-blue-500 text-white"
                            : "bg-cyan-600 text-white"
                          : theme === "light"
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <div
                  className={`grid ${
                    activeFilter === "overdue"
                      ? "grid-cols-[1.6fr_1.2fr_0.8fr_100px_100px] md:grid-cols-[1.6fr_1.2fr_0.8fr_140px_140px]"
                      : "grid-cols-[1.6fr_1.2fr_0.8fr_100px] md:grid-cols-[1.6fr_1.2fr_0.8fr_160px]"
                  } gap-3 px-3 py-2 text-sm font-semibold rounded-lg ${
                    theme === "light"
                      ? "bg-gray-50 text-gray-600"
                      : "bg-gray-900/40 text-gray-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setContactSortState((current) => ({
                        key: "name",
                        direction:
                          current.key === "name" && current.direction === "desc"
                            ? "asc"
                            : "desc",
                      }));
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
                  <span>Title</span>
                  <button
                    type="button"
                    onClick={() => {
                      setContactSortState((current) => ({
                        key: "location",
                        direction:
                          current.key === "location" &&
                          current.direction === "desc"
                            ? "asc"
                            : "desc",
                      }));
                    }}
                    className={`flex items-center gap-1 text-left transition-colors ${
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
                  <button
                    type="button"
                    onClick={() => {
                      setContactSortState((current) => ({
                        key: "lastContact",
                        direction:
                          current.key === "lastContact" &&
                          current.direction === "desc"
                            ? "asc"
                            : "desc",
                      }));
                    }}
                    className={`flex items-center gap-1 text-left transition-colors ${
                      theme === "light"
                        ? "text-gray-500 hover:text-gray-700"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                    aria-label="Sort by last contact"
                  >
                    Last contact
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
                        setContactSortState((current) => ({
                          key: "nextMeet",
                          direction:
                            current.key === "nextMeet" &&
                            current.direction === "desc"
                              ? "asc"
                              : "desc",
                        }));
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
                          ? "grid-cols-[1.6fr_1.2fr_0.8fr_100px_100px] md:grid-cols-[1.6fr_1.2fr_0.8fr_140px_140px]"
                          : "grid-cols-[1.6fr_1.2fr_0.8fr_100px] md:grid-cols-[1.6fr_1.2fr_0.8fr_160px]"
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
                        {contact.title || ""}
                      </div>
                      <div
                        className={`text-sm ${
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        {contact.location}
                      </div>
                      <div
                        className={`text-sm ${
                          contact.status === "overdue"
                            ? "text-red-500"
                            : theme === "light"
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                      >
                        {getContactRelative(contact)}
                      </div>
                      {activeFilter === "overdue" && (
                        <div
                          className={`text-sm text-right ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
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
                    ? `/contact/${
                        "slug" in contact && contact.slug
                          ? contact.slug
                          : createContactSlug(contact.name, contact.id)
                      }`
                    : "/contact/new?new=1";

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
          </div>

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
            {recentActivity.length === 0 ? (
              <div
                className={`rounded-xl border border-dashed px-6 py-8 text-center text-sm ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Activity will show up here once you start logging notes.
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen transition-colors duration-300 flex flex-col overflow-hidden">
      <AppNavbar
        theme={theme}
        active="dashboard"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onToggleTheme={toggleTheme}
        onAddContact={() => {
          resetContactForm();
          setIsContactModalOpen(true);
        }}
      />

      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Main Content */}
        {renderDashboardContent()}

        {/* Footer */}
      <footer
        className={`relative z-10 mt-32 border-t ${
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
                  onClick={() => setIsShareListOpen(true)}
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
      {session && isShareListOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsShareListOpen(false);
            }
          }}
        >
          <div
            className={`w-full max-w-xl rounded-2xl border p-6 shadow-xl ${
              theme === "light"
                ? "bg-white border-gray-200"
                : "bg-gray-800 border-gray-700"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div
                  className={`text-sm font-semibold ${
                    theme === "light" ? "text-gray-900" : "text-gray-100"
                  }`}
                >
                  Shared profiles
                </div>
                <div
                  className={`text-xs ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Manage profiles you are sharing publicly.
                </div>
              </div>
              <button
                onClick={() => setIsShareListOpen(false)}
                className={`text-sm font-semibold ${
                  theme === "light"
                    ? "text-gray-500 hover:text-gray-700"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {sharedContacts.length === 0 ? (
              <div
                className={`mt-6 rounded-xl border border-dashed px-4 py-8 text-center text-sm ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                No shared profiles yet.
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {sharedContacts.map((contact) => {
                  const link = contact.shareToken
                    ? `${shareBaseUrl}/share/${contact.shareToken}`
                    : "";
                  return (
                    <div
                      key={contact.id}
                      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                        theme === "light"
                          ? "border-gray-200 bg-gray-50"
                          : "border-gray-700 bg-gray-900/40"
                      }`}
                    >
                      <div>
                        <div
                          className={`text-sm font-semibold ${
                            theme === "light"
                              ? "text-gray-900"
                              : "text-gray-100"
                          }`}
                        >
                          {contact.name}
                        </div>
                        {link && (
                          <div
                            className={`text-xs ${
                              theme === "light"
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            {link}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            if (!link) {
                              return;
                            }
                            try {
                              await navigator.clipboard.writeText(link);
                            } catch {
                              // Ignore clipboard errors.
                            }
                          }}
                          className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 ${
                            theme === "light"
                              ? "bg-white text-gray-700 hover:bg-gray-100"
                              : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                          }`}
                        >
                          Copy link
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
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
                        className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${
                          theme === "light"
                            ? "border-gray-200 bg-gray-50"
                            : "border-gray-800 bg-gray-900"
                        } ${
                          circle.isActive && isNameEmpty
                            ? theme === "light"
                              ? "border-red-300"
                              : "border-red-700"
                            : ""
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setDraftCircleSettings((current) =>
                              current.map((item) =>
                                item.id === circle.id
                                  ? { ...item, isActive: !item.isActive }
                                  : item
                              )
                            );
                          }}
                          className={`h-5 w-9 rounded-full border transition-colors ${
                            circle.isActive
                              ? theme === "light"
                                ? "border-blue-500 bg-blue-500"
                                : "border-cyan-500 bg-cyan-500"
                              : theme === "light"
                              ? "border-gray-300 bg-gray-200"
                              : "border-gray-700 bg-gray-800"
                          }`}
                          aria-label={`Toggle circle ${circle.name || "unnamed"}`}
                        >
                          <span
                            className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                              circle.isActive
                                ? "translate-x-4"
                                : "translate-x-0.5"
                            }`}
                          ></span>
                        </button>
                        <input
                          type="text"
                          value={circle.name}
                          onChange={(event) => {
                            const value = event.target.value;
                            setDraftCircleSettings((current) =>
                              current.map((item) =>
                                item.id === circle.id
                                  ? {
                                      ...item,
                                      name: value,
                                      isActive: item.isActive,
                                    }
                                  : item
                              )
                            );
                          }}
                          placeholder="Circle name"
                          className={`flex-1 rounded-md border px-2 py-1 text-sm ${
                            theme === "light"
                              ? "border-gray-300 bg-white text-gray-900"
                              : "border-gray-700 bg-gray-950 text-gray-100"
                          } ${
                            circle.isActive && isNameEmpty
                              ? theme === "light"
                                ? "border-red-300"
                                : "border-red-700"
                              : ""
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div
                  className={`text-xs ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Name a circle to enable it. "Just Met" is automatic for quick
                  contacts.
                </div>
                {hasInvalidActiveCircle && (
                  <div
                    className={`text-xs ${
                      theme === "light" ? "text-red-600" : "text-red-400"
                    }`}
                  >
                    Active circles need a name before you can close settings.
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    if (hasInvalidActiveCircle) {
                      return;
                    }
                    setIsSettingsOpen(false);
                  }}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    theme === "light"
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                  } ${hasInvalidActiveCircle ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCircleSettings}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    theme === "light"
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-cyan-600 text-white hover:bg-cyan-500"
                  } ${hasInvalidActiveCircle ? "opacity-50 cursor-not-allowed" : ""}`}
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
            <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
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
