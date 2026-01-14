"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Theme = "light" | "dark";

type MapNode = {
  id: string;
  label: string;
  sublabel?: string;
  type: "contact" | "quick" | "placeholder";
  x: number;
  y: number;
};

const contactDetails: Record<
  string,
  {
    location: string;
    tags: string[];
    fields: { label: string; value: string }[];
  }
> = {
  ggf: {
    location: "Porto, PT",
    tags: ["Family", "Roots"],
    fields: [
      { label: "Relation", value: "Great Grandfather" },
      { label: "Born", value: "1898" },
    ],
  },
  gma: {
    location: "Lisbon, PT",
    tags: ["Family"],
    fields: [
      { label: "Relation", value: "Grandmother" },
      { label: "Tradition", value: "Sunday dinners" },
    ],
  },
  gpa: {
    location: "Braga, PT",
    tags: ["Family"],
    fields: [
      { label: "Relation", value: "Grandfather" },
      { label: "Notes", value: "Loved chess" },
    ],
  },
  mom: {
    location: "Austin, US",
    tags: ["Family"],
    fields: [
      { label: "Relation", value: "Mother" },
      { label: "Favorite", value: "Garden club" },
    ],
  },
  dad: {
    location: "Austin, US",
    tags: ["Family"],
    fields: [
      { label: "Relation", value: "Father" },
      { label: "Hobby", value: "Cycling" },
    ],
  },
  me: {
    location: "Austin, US",
    tags: ["Self"],
    fields: [
      { label: "Focus", value: "Networkia" },
      { label: "Goal", value: "Stay connected" },
    ],
  },
  cousin: {
    location: "Houston, US",
    tags: ["Family"],
    fields: [
      { label: "Relation", value: "Cousin" },
      { label: "Notes", value: "Plays violin" },
    ],
  },
};

const nodes: MapNode[] = [
  {
    id: "ggf",
    label: "Elias Martin",
    sublabel: "Great Grandfather",
    type: "contact",
    x: 50,
    y: 8,
  },
  {
    id: "gma",
    label: "Rose Martin",
    sublabel: "Grandmother",
    type: "contact",
    x: 25,
    y: 28,
  },
  {
    id: "gpa",
    label: "Samuel Martin",
    sublabel: "Grandfather",
    type: "contact",
    x: 75,
    y: 28,
  },
  {
    id: "mom",
    label: "Lena Martin",
    sublabel: "Mother",
    type: "contact",
    x: 35,
    y: 52,
  },
  {
    id: "dad",
    label: "Caleb Stone",
    sublabel: "Father",
    type: "contact",
    x: 65,
    y: 52,
  },
  {
    id: "me",
    label: "You",
    sublabel: "Center",
    type: "contact",
    x: 50,
    y: 76,
  },
  {
    id: "cousin",
    label: "Mila Cruz",
    sublabel: "Cousin",
    type: "contact",
    x: 15,
    y: 70,
  },
  {
    id: "neighbor",
    label: "Park Runner",
    sublabel: "Quick Contact",
    type: "quick",
    x: 85,
    y: 70,
  },
  {
    id: "placeholder",
    label: "Unknown Aunt",
    sublabel: "Placeholder",
    type: "placeholder",
    x: 8,
    y: 44,
  },
];

export default function MindmapDemoPage() {
  const [theme, setTheme] = useState<Theme>("light");
  const [activeNode, setActiveNode] = useState<MapNode | null>(null);

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

  const nodeStyles = {
    contact:
      theme === "light"
        ? "border-transparent bg-white/80 text-gray-900 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.6)] backdrop-blur"
        : "border-transparent bg-gray-900/80 text-gray-100 shadow-[0_12px_35px_-20px_rgba(0,0,0,0.7)] backdrop-blur",
    quick:
      theme === "light"
        ? "border-transparent bg-emerald-50 text-emerald-900 shadow-[0_10px_30px_-20px_rgba(16,185,129,0.6)]"
        : "border-transparent bg-emerald-950 text-emerald-100 shadow-[0_12px_35px_-20px_rgba(16,185,129,0.45)]",
    placeholder:
      theme === "light"
        ? "border-dashed border-gray-300 bg-white/60 text-gray-600"
        : "border-dashed border-gray-600 bg-gray-900/60 text-gray-300",
  } as const;

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
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
          <div className="flex items-center gap-3">
            <h1
              className={`text-xl font-semibold ${
                theme === "light" ? "text-gray-900" : "text-gray-100"
              }`}
            >
              Relationship Map
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-xs ${
                theme === "light"
                  ? "bg-gray-100 text-gray-600"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              Demo
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                theme === "light"
                  ? "border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600"
                  : "border-gray-700 text-gray-300 hover:border-cyan-700 hover:text-cyan-400"
              }`}
            >
              Add Node
            </button>
            <button
              className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                theme === "light"
                  ? "border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600"
                  : "border-gray-700 text-gray-300 hover:border-cyan-700 hover:text-cyan-400"
              }`}
            >
              Add Link
            </button>
            <button
              onClick={toggleTheme}
              className={`px-3 py-2 rounded-lg transition-all duration-200 text-lg ${
                theme === "light"
                  ? "bg-gray-100 hover:bg-gray-200"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>

        <div
          className={`rounded-3xl border p-6 ${
            theme === "light"
              ? "border-gray-200 bg-white"
              : "border-gray-800 bg-gray-950"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-3">
              <span
                className={`text-xs uppercase tracking-wide ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Legend
              </span>
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  theme === "light"
                    ? "bg-white text-gray-600 border border-gray-200"
                    : "bg-gray-900 text-gray-300 border border-gray-700"
                }`}
              >
                Contact
              </span>
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  theme === "light"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-cyan-950 text-cyan-200 border border-cyan-700"
                }`}
              >
                Quick Contact
              </span>
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  theme === "light"
                    ? "bg-gray-50 text-gray-500 border border-dashed border-gray-300"
                    : "bg-gray-800 text-gray-400 border border-dashed border-gray-600"
                }`}
              >
                Placeholder
              </span>
            </div>
            <div
              className={`text-xs ${
                theme === "light" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Drag to reposition · Double click to edit
            </div>
          </div>

          <div
            className={`relative mt-6 h-[520px] w-full rounded-2xl border ${
              theme === "light"
                ? "border-gray-200 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.18)_1px,transparent_0)] bg-[size:24px_24px]"
                : "border-gray-800 bg-[radial-gradient(circle_at_1px_1px,rgba(71,85,105,0.3)_1px,transparent_0)] bg-[size:24px_24px]"
            }`}
          >
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path d="M50 10 C50 18,35 20,25 30" stroke="rgba(148,163,184,0.55)" strokeWidth="0.7" fill="none" />
              <path d="M50 10 C50 18,65 20,75 30" stroke="rgba(148,163,184,0.55)" strokeWidth="0.7" fill="none" />
              <path d="M25 30 C25 40,30 46,35 55" stroke="rgba(148,163,184,0.55)" strokeWidth="0.7" fill="none" />
              <path d="M75 30 C75 40,70 46,65 55" stroke="rgba(148,163,184,0.55)" strokeWidth="0.7" fill="none" />
              <path d="M35 55 C38 64,44 70,50 78" stroke="rgba(148,163,184,0.55)" strokeWidth="0.7" fill="none" />
              <path d="M65 55 C62 64,56 70,50 78" stroke="rgba(148,163,184,0.55)" strokeWidth="0.7" fill="none" />
              <path d="M35 55 C26 62,20 66,15 70" stroke="rgba(148,163,184,0.55)" strokeWidth="0.7" fill="none" />
              <path d="M65 55 C74 62,80 66,85 70" stroke="rgba(148,163,184,0.55)" strokeWidth="0.7" fill="none" />
              <path d="M25 30 C18 36,12 40,8 44" stroke="rgba(148,163,184,0.4)" strokeWidth="0.6" fill="none" />
            </svg>

            {nodes.map((node) => (
              <div
                key={node.id}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-4 py-2 text-sm cursor-pointer ${
                  nodeStyles[node.type]
                }`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                onClick={() => setActiveNode(node)}
              >
                <div className="font-semibold">{node.label}</div>
                {node.sublabel && (
                  <div
                    className={`text-[11px] ${
                      node.type === "contact"
                        ? theme === "light"
                          ? "text-gray-500"
                          : "text-gray-400"
                        : "text-current"
                    }`}
                  >
                    {node.sublabel}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          className={`rounded-2xl border p-5 text-sm ${
            theme === "light"
              ? "border-gray-200 bg-white text-gray-600"
              : "border-gray-800 bg-gray-900 text-gray-300"
          }`}
        >
          Build family trees, work webs, or friend-of-a-friend maps. Link quick
          contacts now and convert them later when the relationship deepens.
        </div>
      </div>
      {activeNode && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setActiveNode(null)}
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
              onClick={() => setActiveNode(null)}
              className={`absolute right-3 top-3 rounded-md px-2 py-1 text-lg transition-colors ${
                theme === "light"
                  ? "text-gray-500 hover:bg-gray-100"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
              aria-label="Close"
            >
              ×
            </button>
            <div className="space-y-2">
              <div
                className={`text-xs uppercase tracking-wide ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {activeNode.type === "quick"
                  ? "Quick Contact"
                  : activeNode.type === "placeholder"
                  ? "Placeholder"
                  : "Contact"}
              </div>
              <div
                className={`text-lg font-semibold ${
                  theme === "light" ? "text-gray-900" : "text-gray-100"
                }`}
              >
                {activeNode.label}
              </div>
              {activeNode.sublabel && (
                <div
                  className={`text-sm ${
                    theme === "light" ? "text-gray-600" : "text-gray-300"
                  }`}
                >
                  {activeNode.sublabel}
                </div>
              )}
            </div>
            <div className="mt-4 space-y-3 text-sm">
              {activeNode.type === "contact" && (
                <div className="space-y-3">
                  <div
                    className={`rounded-xl border p-3 ${
                      theme === "light"
                        ? "border-gray-200 bg-gray-50 text-gray-700"
                        : "border-gray-800 bg-gray-950 text-gray-300"
                    }`}
                  >
                    <div className="text-xs uppercase tracking-wide text-gray-400">
                      Location
                    </div>
                    <div className="text-sm">
                      {contactDetails[activeNode.id]?.location ||
                        "Austin, US"}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(contactDetails[activeNode.id]?.tags || ["Family"]).map(
                      (tag) => (
                        <span
                          key={tag}
                          className={`rounded-full px-3 py-1 text-xs ${
                            theme === "light"
                              ? "bg-white text-gray-600 border border-gray-200"
                              : "bg-gray-900 text-gray-300 border border-gray-700"
                          }`}
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                  <div
                    className={`rounded-xl border p-3 ${
                      theme === "light"
                        ? "border-gray-200 bg-white text-gray-700"
                        : "border-gray-800 bg-gray-950 text-gray-300"
                    }`}
                  >
                    <div className="space-y-2">
                      {(contactDetails[activeNode.id]?.fields || []).map(
                        (field) => (
                          <div
                            key={field.label}
                            className="flex items-start justify-between gap-4 text-xs"
                          >
                            <span className="text-gray-400">{field.label}</span>
                            <span>{field.value}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
              {activeNode.type !== "contact" && (
                <div
                  className={`rounded-xl border p-3 ${
                    theme === "light"
                      ? "border-gray-200 bg-gray-50 text-gray-600"
                      : "border-gray-800 bg-gray-950 text-gray-300"
                  }`}
                >
                  {activeNode.type === "quick"
                    ? "Quick note: met during a morning walk. Loves trail running."
                    : "Placeholder node — link to a contact later."}
                </div>
              )}
              <div className="flex items-center justify-end gap-2">
                {activeNode.type === "quick" && (
                  <button
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      theme === "light"
                        ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                    }`}
                  >
                    Convert to Contact
                  </button>
                )}
                <button
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    theme === "light"
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-cyan-600 text-white hover:bg-cyan-500"
                  }`}
                >
                  {activeNode.type === "quick" ? "Edit Quick" : "Open Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
