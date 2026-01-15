"use client";

import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useScopedLocalStorage } from "@/hooks/use-scoped-local-storage";
import {
  getDefaultCircleSettings,
  type CircleSetting,
} from "@/lib/circle-settings";
import { createContactSlug, matchesContactSlug } from "@/lib/contact-slug";
import { AppNavbar } from "@/app/components/AppNavbar";

type Theme = "light" | "dark";

type ProfileField = {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  type: "text" | "multi-line";
};

type InteractionNote = {
  id: string;
  title: string;
  body: string;
  date: string;
};

const profileFieldTemplates: ProfileField[] = [
  { id: "email", label: "Email", value: "", type: "text" },
  { id: "phone", label: "Phone", value: "", type: "text" },
  { id: "work", label: "Work", value: "", subValue: "", type: "text" },
  { id: "website", label: "Website", value: "", type: "text" },
  { id: "linkedin", label: "LinkedIn", value: "", type: "text" },
  { id: "twitter", label: "Twitter", value: "", type: "text" },
  { id: "instagram", label: "Instagram", value: "", type: "text" },
  { id: "github", label: "GitHub", value: "", type: "text" },
  { id: "address", label: "Full Address", value: "", type: "multi-line" },
  { id: "gender", label: "Gender", value: "", type: "text" },
  { id: "religion", label: "Religion", value: "", type: "text" },
  { id: "status", label: "Status", value: "", type: "text" },
  { id: "spouse", label: "Spouse", value: "", subValue: "", type: "text" },
  { id: "kids", label: "Kids", value: "", type: "text" },
  { id: "nationality", label: "Nationality", value: "", type: "text" },
  { id: "education", label: "Education", value: "", subValue: "", type: "text" },
  { id: "birthday", label: "Birthday", value: "", subValue: "", type: "text" },
  { id: "circle", label: "Their circle", value: "", type: "multi-line" },
  { id: "howWeMet", label: "How We Met", value: "", type: "text" },
  { id: "interests", label: "Interests", value: "", type: "multi-line" },
];

const demoProfileDefaults = {
  name: "Edward Norton",
  title: "Film Director & Producer",
  location: "Los Angeles, CA",
  tags: ["Friend"],
  lastContactDaysAgo: 3,
  nextMeetDate: "2026-01-24",
  lastContactDate: "2026-01-10",
  personalNotes:
    "Incredibly thoughtful and deliberate in everything he does. Doesn't just act or direct - he thinks deeply about the meaning and impact of stories.\n\nReally cares about environmental issues, not just as talking points but genuinely invested. Started a solar company and does real work in conservation. Appreciates when you engage on those topics.\n\nNot someone who likes small talk. Prefers deep conversations about ideas, philosophy, or specific projects. Once you get him talking about film technique or adaptation, he's fascinating.",
  fields: [
    { id: "email", label: "Email", value: "ed.norton@gmail.com", type: "text" },
    { id: "phone", label: "Phone", value: "+1 (310) 555-8834", type: "text" },
    {
      id: "work",
      label: "Work",
      value: "Class 5 Films",
      subValue: "Co-founder & Director",
      type: "text",
    },
    { id: "website", label: "Website", value: "edwardnorton.com", type: "text" },
    {
      id: "linkedin",
      label: "LinkedIn",
      value: "linkedin.com/in/edwardnorton",
      type: "text",
    },
    { id: "twitter", label: "Twitter", value: "@ednorton", type: "text" },
    { id: "instagram", label: "Instagram", value: "@edwardnorton", type: "text" },
    { id: "github", label: "GitHub", value: "", type: "text" },
    { id: "address", label: "Full Address", value: "", type: "multi-line" },
    { id: "gender", label: "Gender", value: "", type: "text" },
    { id: "religion", label: "Religion", value: "", type: "text" },
    { id: "status", label: "Status", value: "Married", type: "text" },
    {
      id: "spouse",
      label: "Spouse",
      value: "Shauna Robertson",
      subValue: "Producer",
      type: "text",
    },
    { id: "kids", label: "Kids", value: "Atlas, 11", type: "text" },
    { id: "nationality", label: "Nationality", value: "American", type: "text" },
    {
      id: "education",
      label: "Education",
      value: "Yale University",
      subValue: "History major, Japanese studies",
      type: "text",
    },
    {
      id: "birthday",
      label: "Birthday",
      value: "August 18",
      subValue: "Age 54",
      type: "text",
    },
    {
      id: "circle",
      label: "Their circle",
      value: "Wes Anderson\nBrad Pitt\nAaron Sorkin",
      type: "multi-line",
    },
    {
      id: "howWeMet",
      label: "How We Met",
      value:
        "Met through mutual friend at Sundance 2019, bonded over documentary filmmaking",
      type: "text",
    },
    {
      id: "interests",
      label: "Interests",
      value:
        "Environmental conservation\nJapanese culture & language\nMeditation & mindfulness\nArchitecture",
      type: "multi-line",
    },
  ] as ProfileField[],
};

const demoInteractionNotes: InteractionNote[] = [
  {
    id: "note1",
    title: "Coffee Meeting",
    date: "2026-01-10",
    body:
      "Caught up on his new role at Tesla. He's leading the charging infrastructure project and is super excited about it. Discussed potential collaboration on a climate tech side project.",
  },
  {
    id: "note2",
    title: "Dinner at Mission Chinese",
    date: "2025-12-05",
    body:
      'Celebrated his promotion. He recommended "The Ministry for the Future" book. Had a long conversation about AI ethics and climate models.',
  },
  {
    id: "note3",
    title: "Quick phone call",
    date: "2025-11-02",
    body:
      "Short catch-up about his upcoming Sundance project and the nonprofit gala. He wants to introduce us to his conservation partner.",
  },
];

const ensureProfileFields = (current: ProfileField[]) => {
  const byId = new Map(current.map((field) => [field.id, field]));
  const merged = profileFieldTemplates.map((template) => {
    const stored = byId.get(template.id);
    return {
      ...template,
      value: stored?.value ?? template.value,
      subValue: stored?.subValue ?? template.subValue,
    };
  });
  const extras = current.filter(
    (field) => !profileFieldTemplates.some((item) => item.id === field.id)
  );
  return [...merged, ...extras];
};

type StoredContact = {
  id: string;
  slug?: string;
  initials: string;
  name: string;
  title: string;
  location: string;
  tags: string[];
  lastContact: string;
  daysAgo: number;
  profileFields: ProfileField[];
  nextMeetDate: string | null;
  personalNotes?: string;
  interactionNotes?: InteractionNote[];
  shareToken?: string | null;
  isShared?: boolean;
};

type QuickContact = {
  id: string;
  name: string;
  location: string;
  notes: string;
  tags: string[];
  lastContact: string;
};

type CharacterDemo2Props = {
  slugParam?: string | null;
};

export const dynamic = 'force-dynamic';

export default function CharacterDemo2({
  slugParam = null,
}: CharacterDemo2Props) {
  const [theme, setTheme] = useState<Theme>("light");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingThoughts, setIsEditingThoughts] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [showNextMeetPopup, setShowNextMeetPopup] = useState(false);
  const [nextMeetDraft, setNextMeetDraft] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [nextMeetDate, setNextMeetDate] = useState<string | null>(null);
  const [lastContactDaysAgo, setLastContactDaysAgo] = useState<number | null>(null);
  const [lastContactDate, setLastContactDate] = useState<Date | null>(null);
  const lastContactInputRef = useRef<HTMLInputElement>(null);
  const [isDemoProfile, setIsDemoProfile] = useState(false);
  const [personalNotes, setPersonalNotes] = useState("");
  const [personalNotesDraft, setPersonalNotesDraft] = useState("");
  const [interactionNotes, setInteractionNotes] = useState<InteractionNote[]>(
    []
  );
  const [interactionDraft, setInteractionDraft] = useState({
    title: "",
    body: "",
    date: "",
  });
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [editingInteractionId, setEditingInteractionId] = useState<
    string | null
  >(null);
  const [showDeleteInteractionConfirm, setShowDeleteInteractionConfirm] =
    useState(false);
  const [contactId, setContactId] = useState<string | null>(null);
  const [isNewContact, setIsNewContact] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  // Profile header info
  const [profileName, setProfileName] = useState("");
  const [profileTitle, setProfileTitle] = useState("");
  const [profileLocation, setProfileLocation] = useState("");
  const [profileTags, setProfileTags] = useState<string[]>([]);

  const hasPersonalNotes = personalNotes.trim().length > 0;
  const profileInitials = profileName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [profileFields, setProfileFields] = useState<ProfileField[]>(
    ensureProfileFields([])
  );
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get search params safely for SSR
  const getSearchParam = (key: string) => {
    try {
      return searchParams?.get(key);
    } catch {
      return null;
    }
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
    if (days < 365) {
      return `${Math.floor(days / 30)}mo ago`;
    }
    return `${Math.floor(days / 365)}y ago`;
  };
  const formatFuture = (days: number) => {
    if (days <= 0) {
      return "Today";
    }
    if (days < 7) {
      return `in ${days}d`;
    }
    if (days < 30) {
      return `in ${Math.floor(days / 7)}w`;
    }
    if (days < 365) {
      return `in ${Math.floor(days / 30)}mo`;
    }
    return `in ${Math.floor(days / 365)}y`;
  };
  const generateShareToken = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `share-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  };
  const getShareKey = (token: string) => `networkia_share_${token}`;
  const buildShareSnapshot = (): StoredContact => ({
    id: contactId ?? "preview",
    slug: contactId ? createContactSlug(profileName, contactId) : undefined,
    initials: profileInitials || "—",
    name: profileName,
    title: profileTitle,
    location: profileLocation,
    tags: profileTags,
    lastContact: lastContactDate ? lastContactDate.toISOString() : "",
    daysAgo: typeof lastContactDaysAgo === "number" ? lastContactDaysAgo : 0,
    profileFields,
    nextMeetDate,
    personalNotes,
    interactionNotes,
    shareToken,
    isShared,
  });
  const persistShareSnapshot = (token: string) => {
    try {
      localStorage.setItem(getShareKey(token), JSON.stringify(buildShareSnapshot()));
    } catch {
      // Ignore storage errors.
    }
  };
  const markdownComponents: Components = {
    p: ({ children }: { children?: ReactNode }) => (
      <p className="mb-3 last:mb-0">{children}</p>
    ),
    ul: ({ children }: { children?: ReactNode }) => (
      <ul className="mb-3 list-disc pl-5 last:mb-0">{children}</ul>
    ),
    ol: ({ children }: { children?: ReactNode }) => (
      <ol className="mb-3 list-decimal pl-5 last:mb-0">{children}</ol>
    ),
    li: ({ children }: { children?: ReactNode }) => (
      <li className="mb-1 last:mb-0">{children}</li>
    ),
    strong: ({ children }: { children?: ReactNode }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }: { children?: ReactNode }) => (
      <em className="italic">{children}</em>
    ),
    a: ({ children, href }: { children?: ReactNode; href?: string }) => (
      <a
        href={href}
        className={`underline ${
          theme === "light" ? "text-blue-600" : "text-cyan-300"
        }`}
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    ),
    code: ({
      inline,
      children,
    }: {
      inline?: boolean;
      children?: ReactNode;
    }) => (
      <code
        className={
          inline
            ? theme === "light"
              ? "rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-800"
              : "rounded bg-gray-700 px-1 py-0.5 text-xs text-gray-100"
            : theme === "light"
            ? "block rounded-lg bg-gray-900 px-3 py-2 text-xs text-gray-100"
            : "block rounded-lg bg-gray-950 px-3 py-2 text-xs text-gray-100"
        }
      >
        {children}
      </code>
    ),
    pre: ({ children }: { children?: ReactNode }) => (
      <pre className="mb-3 overflow-x-auto text-xs">{children}</pre>
    ),
  };
  const toggleTaskInTextByIndex = (text: string, index: number) => {
    if (index < 0) {
      return text;
    }
    let currentIndex = 0;
    let didToggle = false;
    const next = text.replace(
      /^(\s*[-*+]\s+\[)([ xX])(\]\s+)/gm,
      (match, prefix, mark, suffix) => {
        if (currentIndex === index) {
          didToggle = true;
          const nextMark = mark.toLowerCase() === "x" ? " " : "x";
          currentIndex += 1;
          return `${prefix}${nextMark}${suffix}`;
        }
        currentIndex += 1;
        return match;
      }
    );
    return didToggle ? next : text;
  };
  const toggleTaskInTextAtLine = (text: string, lineNumber: number) => {
    if (lineNumber <= 0) {
      return text;
    }
    const lines = text.split("\n");
    const lineIndex = lineNumber - 1;
    if (!lines[lineIndex]) {
      return text;
    }
    const updated = lines[lineIndex].replace(
      /(\s*[-*+]\s+\[)([ xX])(\]\s+)/,
      (match, prefix, mark, suffix) => {
        const nextMark = mark.toLowerCase() === "x" ? " " : "x";
        return `${prefix}${nextMark}${suffix}`;
      }
    );
    if (updated === lines[lineIndex]) {
      return text;
    }
    lines[lineIndex] = updated;
    return lines.join("\n");
  };
  const applyPersonalNotes = (value: string) => {
    setPersonalNotes(value);
    setPersonalNotesDraft(value);
    if (!isDemoProfile) {
      updateStoredContact(contactId, (contact) => ({
        ...contact,
        personalNotes: value,
      }));
    }
  };
  const renderMarkdown = (
    text: string,
    onToggleTask?: (info: { lineNumber: number; index: number }) => void
  ) => {
    let taskIndex = 0;
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          ...markdownComponents,
          input: ({
            node,
            checked,
            type,
          }: {
            node?: { position?: { start?: { line?: number } } };
            checked?: boolean;
            type?: string;
          }) => {
            if (type !== "checkbox") {
              return null;
            }
            const lineNumber = node?.position?.start?.line ?? -1;
            const index = taskIndex;
            taskIndex += 1;
            return (
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleTask?.({ lineNumber, index })}
                onClick={(event) => event.stopPropagation()}
                className="mr-2 h-3 w-3 align-middle accent-blue-500"
              />
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    );
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
    if (shareToken) {
      setShareUrl(`${window.location.origin}/share/${shareToken}`);
    } else {
      setShareUrl("");
    }
  }, [shareToken]);

  useEffect(() => {
    if (profileName.trim()) {
      document.title = `${profileName} · Networkia`;
    }
  }, [profileName]);

  const {
    value: storedContacts,
    setValue: setStoredContacts,
    isLoaded: areContactsLoaded,
  } = useScopedLocalStorage<StoredContact[]>({
    demoKey: "demo_full_contacts",
    liveKeyPrefix: "live_full_contacts_",
    initialValue: [],
  });
  const { setValue: setStoredQuickContacts } =
    useScopedLocalStorage<QuickContact[]>({
      demoKey: "demo_quick_contacts",
      liveKeyPrefix: "live_quick_contacts_",
      initialValue: [],
    });
  const { value: circleSettings, setValue: setCircleSettings } =
    useScopedLocalStorage<CircleSetting[]>({
      demoKey: "demo_circle_settings",
      liveKeyPrefix: "live_circle_settings_",
      initialValue: getDefaultCircleSettings(),
    });
  const [draftCircleSettings, setDraftCircleSettings] = useState<CircleSetting[]>(
    circleSettings
  );
  const activeCircles = circleSettings
    .filter((circle) => circle.isActive && circle.name.trim())
    .map((circle) => circle.name.trim());
  const visibleProfileTags = profileTags.filter((tag) =>
    activeCircles.some(
      (circle) => circle.toLowerCase() === tag.toLowerCase()
    )
  );
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
    setStoredContacts((current) =>
      current.map((contact) => ({
        ...contact,
        tags: renameTags(contact.tags),
      }))
    );
    setProfileTags((current) => renameTags(current));
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
  const activeCirclesKey = useMemo(
    () => activeCircles.map((circle) => circle.toLowerCase()).join("|"),
    [activeCircles]
  );
  const initSnapshotRef = useRef<string>("");
  const contactIdParam = useMemo(
    () => getSearchParam("id"),
    [searchParams]
  );
  const slugValue = slugParam;
  const isNewParam = useMemo(
    () => getSearchParam("new") === "1",
    [searchParams]
  );
  const quickIdParam = useMemo(
    () => getSearchParam("quickId"),
    [searchParams]
  );
  const newContactName = getSearchParam("name") || "";
  const newContactLocation = getSearchParam("location") || "";
  const newContactNotes = getSearchParam("notes") || "";

  const formatMonthDay = (value: Date) =>
    value.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const loadStoredContacts = () => storedContacts;
  const saveStoredContacts = (contacts: StoredContact[]) => {
    setStoredContacts(contacts);
  };
  const updateStoredContact = (
    id: string | null,
    updater: (contact: StoredContact) => StoredContact
  ) => {
    if (!id) {
      return;
    }
    const stored = loadStoredContacts();
    const next = stored.map((contact) =>
      contact.id === id ? updater(contact) : contact
    );
    saveStoredContacts(next);
  };
  const applyInteractionNotes = (notes: InteractionNote[]) => {
    setInteractionNotes(notes);
    updateStoredContact(contactId, (contact) => ({
      ...contact,
      interactionNotes: notes,
    }));
  };
  const openNewInteraction = () => {
    const today = new Date().toISOString().split("T")[0];
    setEditingInteractionId(null);
    setInteractionDraft({ title: "", body: "", date: today });
    setIsInteractionModalOpen(true);
  };
  const openEditInteraction = (note: InteractionNote) => {
    setEditingInteractionId(note.id);
    setInteractionDraft({
      title: note.title,
      body: note.body,
      date: note.date,
    });
    setIsInteractionModalOpen(true);
  };
  const applyNextMeetDate = (value: string | null) => {
    setNextMeetDate(value);
    updateStoredContact(contactId, (contact) => ({
      ...contact,
      nextMeetDate: value,
    }));
  };
  const applyLastContact = (value: Date | null, daysAgo: number | null) => {
    setLastContactDate(value);
    setLastContactDaysAgo(daysAgo);
    updateStoredContact(contactId, (contact) => ({
      ...contact,
      lastContact: value ? value.toISOString() : "",
      daysAgo: typeof daysAgo === "number" ? daysAgo : 0,
    }));
  };
  const shareProfile = () => {
    if (!contactId || isDemoProfile) {
      return;
    }
    const token = shareToken ?? generateShareToken();
    setShareToken(token);
    setIsShared(true);
    updateStoredContact(contactId, (contact) => ({
      ...contact,
      shareToken: token,
      isShared: true,
    }));
    persistShareSnapshot(token);
  };
  const unshareProfile = () => {
    if (!contactId || !shareToken) {
      return;
    }
    try {
      localStorage.removeItem(getShareKey(shareToken));
    } catch {
      // Ignore storage errors.
    }
    setIsShared(false);
    setShareToken(null);
    updateStoredContact(contactId, (contact) => ({
      ...contact,
      shareToken: null,
      isShared: false,
    }));
  };
  const handleExportCalendar = () => {
    const storedContacts = loadStoredContacts();
    const events: { uid: string; summary: string; date: Date; rrule?: string }[] =
      [];
    const added = new Set<string>();
    storedContacts.forEach((contact) => {
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

  useEffect(() => {
    if (isNewParam) {
      setIsDemoProfile(false);
      const newSnapshot = `new:${newContactName}|${newContactLocation}|${newContactNotes}`;
      if (initSnapshotRef.current === newSnapshot) {
        return;
      }
      initSnapshotRef.current = newSnapshot;
      setIsNewContact(true);
      setContactId(null);
      setProfileName(newContactName);
      setProfileTitle("");
      setProfileLocation(newContactLocation);
      setProfileTags([]);
      setProfileFields(
        ensureProfileFields(
          newContactNotes
            ? [
                {
                  id: "notes",
                  label: "Notes",
                  value: newContactNotes,
                  type: "multi-line",
                },
              ]
            : []
        )
      );
      setNextMeetDate(null);
      setLastContactDate(null);
      setLastContactDaysAgo(null);
      setPersonalNotes("");
      setPersonalNotesDraft("");
      setInteractionNotes([]);
      setIsShared(false);
      setShareToken(null);
      setIsEditingProfile(true);
      return;
    }

    if (!areContactsLoaded) {
      return;
    }

    const storedContact = slugValue
      ? storedContacts.find((contact) =>
          matchesContactSlug(slugValue, contact)
        )
      : contactIdParam
      ? storedContacts.find((contact) => contact.id === contactIdParam)
      : undefined;
    if (storedContact) {
      setIsDemoProfile(false);
      const contactSnapshot = `id:${storedContact.id}|${activeCirclesKey}|${JSON.stringify(
        storedContact
      )}`;
      if (initSnapshotRef.current === contactSnapshot) {
        return;
      }
      initSnapshotRef.current = contactSnapshot;
      setContactId(storedContact.id);
      setIsNewContact(false);
      setProfileName(storedContact.name);
      setProfileTitle(storedContact.title);
      setProfileLocation(storedContact.location);
      setProfileTags(
        storedContact.tags.filter(
          (tag) => tag.toLowerCase() !== "just met"
        )
      );
      setProfileFields(ensureProfileFields(storedContact.profileFields || []));
      setNextMeetDate(storedContact.nextMeetDate ?? null);
      const storedDate = storedContact.lastContact
        ? new Date(storedContact.lastContact)
        : null;
      const storedDaysAgo =
        typeof storedContact.daysAgo === "number" ? storedContact.daysAgo : null;
      if (storedDate && !Number.isNaN(storedDate.getTime())) {
        setLastContactDate(storedDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(storedDate);
        target.setHours(0, 0, 0, 0);
        const diffDays = Math.round(
          (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)
        );
        setLastContactDaysAgo(Math.max(diffDays, 0));
      } else {
        setLastContactDate(null);
        setLastContactDaysAgo(storedDaysAgo);
      }
      setPersonalNotes(storedContact.personalNotes ?? "");
      setPersonalNotesDraft(storedContact.personalNotes ?? "");
      setInteractionNotes(storedContact.interactionNotes ?? []);
      setIsShared(Boolean(storedContact.isShared && storedContact.shareToken));
      setShareToken(storedContact.shareToken ?? null);
      return;
    }

    if (initSnapshotRef.current) {
      initSnapshotRef.current = "";
    }
    if (!contactIdParam && !slugValue && !isNewParam) {
      const demoSnapshot = `demo:${demoProfileDefaults.name}`;
      if (initSnapshotRef.current !== demoSnapshot) {
        initSnapshotRef.current = demoSnapshot;
        setIsDemoProfile(true);
        setProfileName(demoProfileDefaults.name);
        setProfileTitle(demoProfileDefaults.title);
        setProfileLocation(demoProfileDefaults.location);
        setProfileTags(demoProfileDefaults.tags);
        setProfileFields(ensureProfileFields(demoProfileDefaults.fields));
        setNextMeetDate(demoProfileDefaults.nextMeetDate);
        const demoDate = demoProfileDefaults.lastContactDate
          ? new Date(demoProfileDefaults.lastContactDate)
          : null;
        if (demoDate && !Number.isNaN(demoDate.getTime())) {
          setLastContactDate(demoDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const target = new Date(demoDate);
          target.setHours(0, 0, 0, 0);
          const diffDays = Math.round(
            (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)
          );
          setLastContactDaysAgo(Math.max(diffDays, 0));
        } else {
          setLastContactDate(null);
          setLastContactDaysAgo(demoProfileDefaults.lastContactDaysAgo);
        }
        setPersonalNotes(demoProfileDefaults.personalNotes);
        setPersonalNotesDraft(demoProfileDefaults.personalNotes);
        setInteractionNotes(demoInteractionNotes);
        setIsShared(false);
        setShareToken(null);
      }
    }
    setIsNewContact(false);
  }, [
    areContactsLoaded,
    contactIdParam,
    isNewParam,
    newContactLocation,
    newContactName,
    newContactNotes,
    slugValue,
    activeCirclesKey,
    storedContacts,
  ]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  if (!areContactsLoaded && (slugValue || contactIdParam) && !isNewParam) {
    return (
      <div className="min-h-screen p-8 text-sm text-gray-500">
        Loading contact...
      </div>
    );
  }

  return (
    <div className="h-screen transition-colors duration-300 flex flex-col overflow-hidden">
      <AppNavbar
        theme={theme}
        active="contacts"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onToggleTheme={toggleTheme}
      />

      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 pb-8 pt-10 md:px-8">
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
                      {profileInitials || "—"}
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
                      placeholder="City"
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
                    <div className="flex flex-wrap gap-2 justify-center">
                      {activeCircles.map((circle) => {
                        const isActive = profileTags.some(
                          (tag) => tag.toLowerCase() === circle.toLowerCase()
                        );
                        return (
                          <button
                            key={circle}
                            type="button"
                            onClick={() => {
                              setProfileTags((current) =>
                                isActive
                                  ? current.filter(
                                      (tag) =>
                                        tag.toLowerCase() !==
                                        circle.toLowerCase()
                                    )
                                  : [...current, circle]
                              );
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                              isActive
                                ? theme === "light"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-blue-900 text-blue-200"
                                : theme === "light"
                                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                            }`}
                          >
                            {circle}
                          </button>
                        );
                      })}
                    </div>
                  ) : visibleProfileTags.length > 0 ? (
                    visibleProfileTags.map((tag, index) => (
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
                  ) : (
                    <span
                      className={`text-xs ${
                        theme === "light" ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      No circles selected.
                    </span>
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
                        setProfileFields((current) => ensureProfileFields(current));
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
                      {contactId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(true);
                          }}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                            theme === "light"
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-red-900/30 text-red-300 hover:bg-red-900/50"
                          }`}
                        >
                          Delete
                        </button>
                      )}
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
                          const trimmedName = profileName.trim();
                          if (!trimmedName) {
                            return;
                          }
                          const storedContacts = loadStoredContacts();
                          const newId =
                            contactId ?? `full-${Date.now()}`;
                          const existingContact = storedContacts.find(
                            (contact) => contact.id === newId
                          );
                          const baseSlug = createContactSlug(
                            trimmedName,
                            newId
                          );
                          const nextSlug =
                            existingContact?.slug &&
                            existingContact.name === trimmedName
                              ? existingContact.slug
                              : baseSlug;
                          const updatedContact: StoredContact = {
                            id: newId,
                            slug: nextSlug,
                            initials: trimmedName
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase(),
                            name: trimmedName,
                            title: (profileTitle ?? "").trim(),
                            location: (profileLocation ?? "").trim() || "—",
                            tags: profileTags.filter(
                              (tag) => tag.toLowerCase() !== "just met"
                            ),
                            lastContact: lastContactDate
                              ? lastContactDate.toISOString()
                              : "",
                            daysAgo:
                              typeof lastContactDaysAgo === "number"
                                ? lastContactDaysAgo
                                : 0,
                            profileFields,
                            nextMeetDate,
                            personalNotes,
                            interactionNotes,
                          };
                          const nextContacts = storedContacts.some(
                            (contact) => contact.id === newId
                          )
                            ? storedContacts.map((contact) =>
                                contact.id === newId
                                  ? updatedContact
                                  : contact
                              )
                            : [updatedContact, ...storedContacts];
                          saveStoredContacts(nextContacts);
                          if (quickIdParam) {
                            setStoredQuickContacts((current) =>
                              current.filter((contact) => contact.id !== quickIdParam)
                            );
                          }
                          setContactId(newId);
                          setIsNewContact(false);
                          setIsEditingProfile(false);
                          router.replace(`/contact/${nextSlug}`);
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
                {showDeleteConfirm && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    onClick={(event) => {
                      if (event.target === event.currentTarget) {
                        setShowDeleteConfirm(false);
                      }
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div
                      className={`relative z-10 w-[92vw] max-w-sm rounded-xl border shadow-xl p-5 ${
                        theme === "light"
                          ? "bg-white border-gray-200"
                          : "bg-gray-800 border-gray-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold">
                            Delete this contact?
                          </h3>
                          <p
                            className={`mt-1 text-sm ${
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-300"
                            }`}
                          >
                            This removes the profile from your list. This can’t
                            be undone.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
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
                      <div className="mt-5 flex justify-end gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            theme === "light"
                              ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                              : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (!contactId) {
                              setShowDeleteConfirm(false);
                              return;
                            }
                            const storedContacts = loadStoredContacts();
                            const nextContacts = storedContacts.filter(
                              (contact) => contact.id !== contactId
                            );
                            saveStoredContacts(nextContacts);
                            setShowDeleteConfirm(false);
                            setIsEditingProfile(false);
                            router.push("/");
                          }}
                          className={`px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
                            theme === "light"
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "bg-red-600 hover:bg-red-500 text-white"
                          }`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                {/* Render all profile fields */}
                {profileFields
                  .filter(
                    (field) =>
                      isEditingProfile ||
                      field.value.trim() ||
                      (field.subValue ? field.subValue.trim() : false)
                  )
                  .map((field) => (
                    <div key={field.id} className="grid grid-cols-[80px_1fr] gap-2 items-start group relative">
                    {isEditingProfile ? (
                      <>
                        {/* Label in edit mode - fixed */}
                        <div
                          className={`text-xs font-semibold px-2 py-1 ${
                            theme === "light" ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          {field.label}
                        </div>
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
                                  type={field.id === "birthday" ? "date" : "text"}
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
              </div>
              </div>
            </div>
          </div>

          {/* Right Main Area - Character Bio */}
          <div className="space-y-8">
            {/* Profile Overview - Combined impression, context & background */}
            <div
              className={`rounded-2xl px-4 py-8 border transition-all duration-300 ${
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
                  Personal notes
                </h2>
                {!isEditingThoughts ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPersonalNotesDraft(personalNotes);
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
                        setPersonalNotesDraft(personalNotes);
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
                        applyPersonalNotes(personalNotesDraft);
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
                className={`text-base leading-relaxed ${
                  theme === "light" ? "text-gray-700" : "text-gray-300"
                }`}
              >
                {isEditingThoughts ? (
                  <textarea
                    value={personalNotesDraft}
                    onChange={(event) => setPersonalNotesDraft(event.target.value)}
                    className={`min-h-[140px] w-full rounded-lg border px-3 py-2 text-sm ${
                      theme === "light"
                        ? "border-gray-300 bg-white text-gray-900 focus:border-blue-500"
                        : "border-gray-700 bg-gray-900 text-gray-100 focus:border-cyan-500"
                    } focus:outline-none`}
                    placeholder="Write your personal notes..."
                  />
                ) : hasPersonalNotes ? (
                  renderMarkdown(personalNotes, ({ lineNumber, index }) => {
                    const byLine = toggleTaskInTextAtLine(
                      personalNotes,
                      lineNumber
                    );
                    const next =
                      byLine === personalNotes
                        ? toggleTaskInTextByIndex(personalNotes, index)
                        : byLine;
                    if (next !== personalNotes) {
                      applyPersonalNotes(next);
                    }
                  })
                ) : (
                  <p className="text-sm italic text-gray-500">
                    No impressions yet.
                  </p>
                )}
              </div>
            </div>

            {/* Updates Panel - Journal entries */}
            <div
              className={`rounded-2xl px-4 py-8 border transition-all duration-300 ${
                theme === "light"
                  ? "bg-white border-gray-200 shadow-sm hover:shadow-md"
                  : "bg-gray-800 border-gray-700 shadow-xl"
              }`}
            >
              <div className="mb-6">
                <div className="flex items-center justify-between gap-3 flex-nowrap overflow-x-auto">
                  <div className="flex items-center gap-3 flex-nowrap">
                    <span
                      className={`text-xs font-semibold ${
                        theme === "light" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      Last contacted
                    </span>
                    <label
                      className={`relative flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
                        theme === "light"
                          ? "border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-900"
                          : "border-gray-700 hover:border-cyan-500 hover:bg-gray-800 text-gray-100"
                      }`}
                    >
                      <input
                        ref={lastContactInputRef}
                        type="date"
                        value={
                          lastContactDate
                            ? lastContactDate.toISOString().split("T")[0]
                            : ""
                        }
                        onClick={() => {
                          if (lastContactInputRef.current?.showPicker) {
                            lastContactInputRef.current.showPicker();
                          }
                        }}
                        onChange={(e) => {
                          const nextDate = e.target.value
                            ? new Date(e.target.value)
                            : null;
                          if (!nextDate) {
                            applyLastContact(null, null);
                            return;
                          }
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const target = new Date(nextDate);
                          target.setHours(0, 0, 0, 0);
                          const diffDays = Math.round(
                            (today.getTime() - target.getTime()) /
                              (1000 * 60 * 60 * 24)
                          );
                          applyLastContact(
                            nextDate,
                            Math.max(diffDays, 0)
                          );
                        }}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 z-10"
                      />
                      <span>
                        {lastContactDaysAgo === null
                          ? "Not yet"
                          : formatRelative(lastContactDaysAgo)}
                      </span>
                      {lastContactDate && (
                        <span
                          className={`text-xs ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          {lastContactDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </label>
                    <button
                      onClick={() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        applyLastContact(today, 0);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                        theme === "light"
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "bg-cyan-600 hover:bg-cyan-500 text-white"
                      }`}
                    >
                      <span className="block leading-tight sm:inline">Set to</span>
                      <span className="block leading-tight sm:inline sm:ml-1">Now</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3 flex-nowrap">
                    <span
                      className={`text-xs font-semibold ${
                        theme === "light" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      Next meet
                    </span>
                    <button
                      onClick={() => {
                        setNextMeetDraft(nextMeetDate);
                        setShowNextMeetPopup(true);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        theme === "light"
                          ? "border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-900"
                          : "border-gray-700 hover:border-cyan-500 hover:bg-gray-800 text-gray-100"
                      }`}
                    >
                      {nextMeetDate ? (
                        (() => {
                          const date = new Date(nextMeetDate);
                          if (Number.isNaN(date.getTime())) {
                            return "Add date";
                          }
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          date.setHours(0, 0, 0, 0);
                          const diffDays = Math.round(
                            (date.getTime() - today.getTime()) /
                              (1000 * 60 * 60 * 24)
                          );
                          return (
                            <>
                              <span>{formatFuture(diffDays)}</span>
                              <span
                                className={`text-xs ml-2 ${
                                  theme === "light"
                                    ? "text-gray-500"
                                    : "text-gray-400"
                                }`}
                              >
                                {date.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </>
                          );
                        })()
                      ) : (
                        "Add date"
                      )}
                    </button>
                  </div>
                </div>
                <div
                  className={`mt-4 border-t ${
                    theme === "light" ? "border-gray-200" : "border-gray-700"
                  }`}
                ></div>

                {/* Next Meet Popup */}
                {showNextMeetPopup && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    onClick={(event) => {
                      if (event.target === event.currentTarget) {
                        applyNextMeetDate(nextMeetDraft);
                        setShowNextMeetPopup(false);
                      }
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div
                      className={`relative z-10 w-[92vw] max-w-sm rounded-xl border shadow-xl p-4 ${
                        theme === "light"
                          ? "bg-white border-gray-200"
                          : "bg-gray-800 border-gray-700"
                      }`}
                    >
                      <button
                        onClick={() => setShowNextMeetPopup(false)}
                        className={`absolute right-3 top-3 text-sm font-semibold ${
                          theme === "light"
                            ? "text-gray-500 hover:text-gray-700"
                            : "text-gray-400 hover:text-gray-200"
                        }`}
                        aria-label="Close"
                      >
                        ×
                      </button>
                      <div className="space-y-3">
                        <div>
                          <label
                            className={`text-xs font-semibold mb-2 block ${
                              theme === "light"
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            Pick a date
                          </label>
                          <input
                            type="date"
                            value={nextMeetDraft || ""}
                            onChange={(e) => setNextMeetDraft(e.target.value)}
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
                              theme === "light"
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            Or set from today
                          </label>
                          <div className="flex gap-2 flex-wrap">
                            <button
                            onClick={() => {
                              const date = new Date();
                              date.setDate(date.getDate() + 7);
                              setNextMeetDraft(
                                  date.toISOString().split("T")[0]
                                );
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
                              setNextMeetDraft(
                                  date.toISOString().split("T")[0]
                                );
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
                              setNextMeetDraft(
                                  date.toISOString().split("T")[0]
                                );
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
                              setNextMeetDraft(
                                  date.toISOString().split("T")[0]
                                );
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
                          {nextMeetDraft && (
                            <button
                              onClick={() => {
                                setNextMeetDraft(null);
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
                            onClick={() => {
                              setNextMeetDraft(nextMeetDate);
                              setShowNextMeetPopup(false);
                            }}
                            className={`flex-1 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                              theme === "light"
                                ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                            }`}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              applyNextMeetDate(nextMeetDraft);
                              setShowNextMeetPopup(false);
                            }}
                            className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
                              theme === "light"
                                ? "bg-blue-500 hover:bg-blue-600 text-white"
                                : "bg-cyan-600 hover:bg-cyan-500 text-white"
                            }`}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

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
                    if (isDemoProfile) {
                      return;
                    }
                    openNewInteraction();
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                    theme === "light"
                      ? "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                      : "text-gray-400 hover:bg-gray-800 hover:text-cyan-400"
                  }`}
                >
                  New Note
                </button>
              </div>

              <div className="space-y-4">
                {(isDemoProfile ? demoInteractionNotes : interactionNotes)
                  .length === 0 ? (
                  <div className="rounded-xl border border-dashed px-6 py-8 text-center text-sm text-gray-500">
                    No interactions yet.
                  </div>
                ) : (
                  (isDemoProfile ? demoInteractionNotes : interactionNotes).map(
                    (note) => {
                      const noteDate = note.date
                        ? new Date(note.date)
                        : null;
                      const noteDateLabel =
                        noteDate && !Number.isNaN(noteDate.getTime())
                          ? noteDate.toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "No date";
                      return (
                        <div
                          key={note.id}
                          className={`p-6 rounded-xl transition-all duration-200 cursor-pointer ${
                            theme === "light"
                              ? "hover:bg-gray-50"
                              : "hover:bg-gray-900"
                          }`}
                          onClick={() =>
                            setActiveNoteId(
                              activeNoteId === note.id ? null : note.id
                            )
                          }
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div
                                className={`font-semibold text-base mb-1 ${
                                  theme === "light"
                                    ? "text-gray-900"
                                    : "text-gray-100"
                                }`}
                              >
                                {note.title || "Interaction"}
                              </div>
                              <div
                                className={`text-xs font-medium ${
                                  theme === "light"
                                    ? "text-gray-500"
                                    : "text-gray-400"
                                }`}
                              >
                                {noteDateLabel}
                              </div>
                            </div>
                            {!isDemoProfile && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditInteraction(note);
                                }}
                                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                                  activeNoteId === note.id
                                    ? "opacity-100"
                                    : "opacity-0 pointer-events-none"
                                } ${
                                  theme === "light"
                                    ? "text-blue-600 hover:bg-blue-50"
                                    : "text-cyan-400 hover:bg-gray-800"
                                }`}
                              >
                                Edit
                              </button>
                            )}
                          </div>
                          <div
                            className={`text-sm leading-relaxed ${
                              theme === "light"
                                ? "text-gray-700"
                                : "text-gray-300"
                            }`}
                          >
                            {renderMarkdown(note.body, ({ lineNumber, index }) => {
                              const byLine = toggleTaskInTextAtLine(
                                note.body,
                                lineNumber
                              );
                              const nextBody =
                                byLine === note.body
                                  ? toggleTaskInTextByIndex(note.body, index)
                                  : byLine;
                              if (nextBody === note.body) {
                                return;
                              }
                              applyInteractionNotes(
                                (isDemoProfile
                                  ? demoInteractionNotes
                                  : interactionNotes
                                ).map((item) =>
                                  item.id === note.id
                                    ? { ...item, body: nextBody }
                                    : item
                                )
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  )
                )}
              </div>
              {isInteractionModalOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center"
                  onClick={(event) => {
                    if (event.target === event.currentTarget) {
                      setIsInteractionModalOpen(false);
                    }
                  }}
                >
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                  <div
                    className={`relative z-10 w-[92vw] max-w-lg rounded-xl border shadow-xl p-5 ${
                      theme === "light"
                        ? "bg-white border-gray-200"
                        : "bg-gray-800 border-gray-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold">
                        {editingInteractionId ? "Edit note" : "New note"}
                      </h3>
                      <button
                        onClick={() => setIsInteractionModalOpen(false)}
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
                    <div className="mt-4 space-y-3">
                      <div>
                        <label
                          className={`text-xs font-semibold mb-2 block ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          Title
                        </label>
                        <input
                          type="text"
                          value={interactionDraft.title}
                          onChange={(event) =>
                            setInteractionDraft((current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                          className={`w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 ${
                            theme === "light"
                              ? "border-gray-300 bg-white text-gray-900 focus:border-blue-500"
                              : "border-gray-600 bg-gray-900 text-gray-100 focus:border-cyan-500"
                          } focus:outline-none`}
                          placeholder="What happened?"
                        />
                      </div>
                      <div>
                        <label
                          className={`text-xs font-semibold mb-2 block ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          Date
                        </label>
                        <input
                          type="date"
                          value={interactionDraft.date}
                          onChange={(event) =>
                            setInteractionDraft((current) => ({
                              ...current,
                              date: event.target.value,
                            }))
                          }
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
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          Notes
                        </label>
                        <textarea
                          value={interactionDraft.body}
                          onChange={(event) =>
                            setInteractionDraft((current) => ({
                              ...current,
                              body: event.target.value,
                            }))
                          }
                          className={`min-h-[120px] w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 ${
                            theme === "light"
                              ? "border-gray-300 bg-white text-gray-900 focus:border-blue-500"
                              : "border-gray-600 bg-gray-900 text-gray-100 focus:border-cyan-500"
                          } focus:outline-none`}
                          placeholder="Add interaction details..."
                        />
                      </div>
                    </div>
                    <div className="mt-5 flex justify-end gap-2">
                      <button
                        onClick={() => setIsInteractionModalOpen(false)}
                        className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                          theme === "light"
                            ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        }`}
                      >
                        Cancel
                      </button>
                      {editingInteractionId && (
                        <button
                          onClick={() => setShowDeleteInteractionConfirm(true)}
                          className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            theme === "light"
                              ? "text-red-600 hover:bg-red-50"
                              : "text-red-400 hover:bg-red-900/20"
                          }`}
                        >
                          Delete
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const trimmedBody = interactionDraft.body.trim();
                          if (!trimmedBody) {
                            return;
                          }
                          const title =
                            interactionDraft.title.trim() || "Interaction";
                          const date =
                            interactionDraft.date ||
                            new Date().toISOString().split("T")[0];
                          const nextNote: InteractionNote = {
                            id:
                              editingInteractionId ??
                              `note-${Date.now()}`,
                            title,
                            body: trimmedBody,
                            date,
                          };
                          const nextNotes = editingInteractionId
                            ? interactionNotes.map((note) =>
                                note.id === editingInteractionId
                                  ? nextNote
                                  : note
                              )
                            : [nextNote, ...interactionNotes];
                          applyInteractionNotes(nextNotes);
                          setIsInteractionModalOpen(false);
                        }}
                        className={`px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
                          theme === "light"
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "bg-cyan-600 hover:bg-cyan-500 text-white"
                        }`}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {showDeleteInteractionConfirm && (
                <div
                  className="fixed inset-0 z-[60] flex items-center justify-center"
                  onClick={(event) => {
                    if (event.target === event.currentTarget) {
                      setShowDeleteInteractionConfirm(false);
                    }
                  }}
                >
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                  <div
                    className={`relative z-10 w-[92vw] max-w-sm rounded-xl border shadow-xl p-5 ${
                      theme === "light"
                        ? "bg-white border-gray-200"
                        : "bg-gray-800 border-gray-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold">
                          Delete this note?
                        </h3>
                        <p
                          className={`mt-1 text-sm ${
                            theme === "light"
                              ? "text-gray-600"
                              : "text-gray-300"
                          }`}
                        >
                          This removes the interaction note permanently.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowDeleteInteractionConfirm(false)}
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
                    <div className="mt-5 flex justify-end gap-2">
                      <button
                        onClick={() => setShowDeleteInteractionConfirm(false)}
                        className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                          theme === "light"
                            ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (!editingInteractionId) {
                            setShowDeleteInteractionConfirm(false);
                            return;
                          }
                          const nextNotes = interactionNotes.filter(
                            (note) => note.id !== editingInteractionId
                          );
                          applyInteractionNotes(nextNotes);
                          setShowDeleteInteractionConfirm(false);
                          setIsInteractionModalOpen(false);
                          setEditingInteractionId(null);
                        }}
                        className={`px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
                          theme === "light"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-red-600 hover:bg-red-500 text-white"
                        }`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
        {isShareOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setIsShareOpen(false);
              }
            }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
              className={`relative z-10 w-full max-w-xl rounded-2xl border p-6 shadow-xl ${
                theme === "light"
                  ? "bg-white border-gray-200"
                  : "bg-gray-800 border-gray-700"
              }`}
            >
              <button
                onClick={() => setIsShareOpen(false)}
                className={`absolute right-4 top-4 text-sm font-semibold ${
                  theme === "light"
                    ? "text-gray-500 hover:text-gray-700"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                aria-label="Close"
              >
                ×
              </button>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <div
                    className={`text-sm font-semibold ${
                      theme === "light" ? "text-gray-900" : "text-gray-100"
                    }`}
                  >
                    Share profile
                  </div>
                  <div
                    className={`text-xs ${
                      theme === "light" ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {isShared
                      ? "This profile is currently shared."
                      : "Generate a public link to share this profile."}
                  </div>
                </div>
                {isShared ? (
                  <button
                    onClick={unshareProfile}
                    className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 ${
                      theme === "light"
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-red-900/30 text-red-300 hover:bg-red-900/50"
                    }`}
                  >
                    Unshare
                  </button>
                ) : (
                  <button
                    onClick={shareProfile}
                    className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 ${
                      theme === "light"
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "bg-cyan-600 hover:bg-cyan-500 text-white"
                    }`}
                  >
                    Share profile
                  </button>
                )}
              </div>
              {isShared && shareUrl ? (
                <div className="space-y-4">
                  <div
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      theme === "light"
                        ? "border-gray-200 bg-gray-50 text-gray-700"
                        : "border-gray-700 bg-gray-900/40 text-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate">{shareUrl}</span>
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(shareUrl);
                          } catch {
                            // Ignore clipboard errors.
                          }
                        }}
                        className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                          theme === "light"
                            ? "bg-white text-gray-700 hover:bg-gray-100"
                            : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                        }`}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div
                    className={`rounded-2xl border p-4 ${
                      theme === "light"
                        ? "border-gray-200 bg-white"
                        : "border-gray-700 bg-gray-900/40"
                    }`}
                  >
                    <div
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        theme === "light" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      Preview
                    </div>
                    <div className="mt-3 space-y-2">
                      <div
                        className={`text-lg font-semibold ${
                          theme === "light"
                            ? "text-gray-900"
                            : "text-gray-100"
                        }`}
                      >
                        {profileName || "Untitled profile"}
                      </div>
                      <div
                        className={`text-sm ${
                          theme === "light" ? "text-gray-600" : "text-gray-300"
                        }`}
                      >
                        {profileTitle || "No title"}
                      </div>
                      <div
                        className={`text-sm ${
                          theme === "light" ? "text-gray-600" : "text-gray-300"
                        }`}
                      >
                        {profileLocation || "No location"}
                      </div>
                      {personalNotes && (
                        <div
                          className={`text-sm ${
                            theme === "light"
                              ? "text-gray-700"
                              : "text-gray-300"
                          }`}
                        >
                          {personalNotes}
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <Link
                        href={shareUrl}
                        target="_blank"
                        className={`text-xs font-semibold ${
                          theme === "light"
                            ? "text-blue-600 hover:text-blue-700"
                            : "text-cyan-300 hover:text-cyan-200"
                        }`}
                      >
                        Open public view →
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`rounded-xl border border-dashed px-4 py-6 text-center text-sm ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Share a profile to generate a public preview link.
                </div>
              )}
            </div>
          </div>
        )}

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
                  onClick={() => {
                    if (contactId && !isDemoProfile) {
                      if (shareToken) {
                        persistShareSnapshot(shareToken);
                      }
                      setIsShareOpen(true);
                    }
                  }}
                  disabled={!contactId || isDemoProfile}
                  className={`rounded-md px-2 py-1 transition-colors ${
                    !contactId || isDemoProfile
                      ? "opacity-50 cursor-not-allowed"
                      : theme === "light"
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
                  onClick={() => {
                    if (!contactId || isDemoProfile) {
                      return;
                    }
                    const token = shareToken ?? generateShareToken();
                    if (!shareToken) {
                      setShareToken(token);
                    }
                    persistShareSnapshot(token);
                    const url = `${window.location.origin}/share/${token}?print=1`;
                    const printWindow = window.open(url, "_blank", "noopener");
                    if (!printWindow) {
                      return;
                    }
                  }}
                  disabled={!contactId || isDemoProfile}
                  className={`rounded-md px-2 py-1 transition-colors ${
                    !contactId || isDemoProfile
                      ? "opacity-50 cursor-not-allowed"
                      : theme === "light"
                      ? "text-gray-700 hover:bg-gray-100"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                  aria-label="Print profile"
                >
                  🖨️
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
    </div>
  );
}
