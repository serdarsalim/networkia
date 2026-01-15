"use client";

import { useEffect, useRef, useState } from "react";
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
          ? "bg-white/90 border-gray-200 shadow-sm"
          : "bg-gray-900/90 border-gray-800 shadow-lg"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-6 py-3 pl-2 pr-4 md:pl-4 md:pr-6">
        <Link
          href="/"
          className={`text-2xl font-bold tracking-tight ${
            theme === "light" ? "text-gray-900" : "text-gray-100"
          }`}
        >
          Networkia
        </Link>
        <div className="hidden md:flex flex-1 items-center justify-end gap-6 text-sm font-medium">
          <Link
            href="/"
            className={`transition-colors ${
              active === "dashboard"
                ? theme === "light"
                  ? "text-gray-900"
                  : "text-gray-100"
                : theme === "light"
                ? "text-gray-400 hover:text-gray-700"
                : "text-gray-500 hover:text-gray-200"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/contacts"
            className={`transition-colors ${
              active === "contacts"
                ? theme === "light"
                  ? "text-gray-900"
                  : "text-gray-100"
                : theme === "light"
                ? "text-gray-400 hover:text-gray-700"
                : "text-gray-500 hover:text-gray-200"
            }`}
          >
            Contacts
          </Link>
          {onAddContact && (
            <button
              onClick={onAddContact}
              className={`transition-colors ${
                theme === "light"
                  ? "text-gray-400 hover:text-gray-700"
                  : "text-gray-500 hover:text-gray-200"
              }`}
            >
              Add new
            </button>
          )}
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
              className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                theme === "light"
                  ? "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
                  : "border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400 focus:border-cyan-500"
              } focus:outline-none`}
            />
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`px-2 py-2 rounded-lg transition-all duration-200 text-base ${
                theme === "light"
                  ? "text-gray-700 hover:text-gray-900"
                  : "text-gray-200 hover:text-gray-100"
              }`}
              aria-label="Open search"
            >
              🔍
            </button>
          )}
          <button
            onClick={onToggleTheme}
            className={`px-2 py-2 rounded-lg transition-all duration-200 text-lg ${
              theme === "light"
                ? "text-gray-700 hover:text-gray-900"
                : "text-gray-200 hover:text-gray-100"
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
  );
}
