"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

type Theme = "light" | "dark";

type AppNavbarProps = {
  theme: Theme;
  active: "dashboard" | "contacts";
  onToggleTheme: () => void;
  onAddContact?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
};

export function AppNavbar({
  theme,
  active,
  onToggleTheme,
  onAddContact,
  searchValue = "",
  onSearchChange,
}: AppNavbarProps) {
  const { data: session } = useSession();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  return (
    <nav
      className={`sticky top-0 z-20 w-full border-b ${
        theme === "light"
          ? "bg-[#213343]/95 border-[#1b2a3a] shadow-lg"
          : "bg-[#0b141f]/95 border-[#0f1b2a] shadow-xl"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-4 py-2 pl-2 pr-4 md:gap-6 md:pl-4 md:pr-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-bold tracking-tight"
        >
          <Image
            src="/networkia-logo.png"
            alt="Networkia logo"
            width={34}
            height={34}
            className="h-8 w-8"
            priority
          />
          <span className="hidden sm:inline bg-gradient-to-r from-[#00a4bd] via-[#4fb06d] to-[#ff7a59] bg-clip-text text-transparent">
            Networkia
          </span>
        </Link>
        <div className="flex-1 min-w-0 overflow-x-auto">
          <div className="flex items-center justify-end gap-4 text-sm font-medium whitespace-nowrap md:gap-6">
          <Link
            href="/"
            className={`transition-colors ${
              active === "dashboard"
                ? theme === "light"
                  ? "text-white"
                  : "text-slate-100"
                : theme === "light"
                ? "text-slate-300 hover:text-white"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/contacts"
            className={`transition-colors ${
              active === "contacts"
                ? theme === "light"
                  ? "text-white"
                  : "text-slate-100"
                : theme === "light"
                ? "text-slate-300 hover:text-white"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            Contacts
          </Link>
          {onAddContact && (
            <button
              onClick={onAddContact}
              className={`transition-colors ${
                theme === "light"
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              Add new
            </button>
          )}
        </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {isSearchOpen ? (
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(event) => onSearchChange?.(event.target.value)}
              onBlur={() => {
                if (!searchValue) {
                  setIsSearchOpen(false);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsSearchOpen(false);
                  onSearchChange?.("");
                }
              }}
              className={`px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                theme === "light"
                  ? "border-[#2b3f55] bg-[#1b2d42] text-slate-100 placeholder-slate-400 focus:border-[#00a4bd]"
                  : "border-slate-700 bg-[#0f1b2a] text-slate-100 placeholder-slate-500 focus:border-[#00a4bd]"
              } focus:outline-none`}
            />
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`px-2 py-1.5 rounded-lg transition-all duration-200 text-base ${
                theme === "light"
                  ? "text-slate-200 hover:text-white"
                  : "text-slate-200 hover:text-white"
              }`}
              aria-label="Open search"
            >
              🔍
            </button>
          )}
          <button
            onClick={onToggleTheme}
            className={`px-2 py-1.5 rounded-lg transition-all duration-200 text-lg ${
              theme === "light"
                ? "text-slate-200 hover:text-white"
                : "text-slate-200 hover:text-white"
            }`}
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          {!session && (
            <button
              onClick={() => signIn("google")}
              className={`hidden sm:inline-flex px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                theme === "light"
                  ? "bg-[#ff7a59] text-white hover:bg-[#ff8f70]"
                  : "bg-[#00a4bd] text-white hover:bg-[#1bb4c5]"
              }`}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
