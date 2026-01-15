"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

type PublicShareContact = {
  name: string;
  title: string;
  location: string;
  tags: string[];
  profileFields: { id: string; label: string; value: string; subValue?: string }[];
  personalNotes?: string;
  interactionNotes?: { id: string; title: string; body: string; date: string }[];
};

export default function SharedProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tokenParam = params?.token;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
  const [sharedContact, setSharedContact] = useState<PublicShareContact | null>(
    null
  );
  const [notFound, setNotFound] = useState(false);
  const shouldPrint = searchParams?.get("print") === "1";

  useEffect(() => {
    if (!token || typeof token !== "string") {
      setNotFound(true);
      return;
    }
    try {
      const stored = localStorage.getItem(`networkia_share_${token}`);
      if (!stored) {
        setNotFound(true);
        return;
      }
      setSharedContact(JSON.parse(stored));
    } catch {
      setNotFound(true);
    }
  }, [token]);

  useEffect(() => {
    if (!shouldPrint || !sharedContact) {
      return;
    }
    const timer = window.setTimeout(() => {
      window.print();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [shouldPrint, sharedContact]);

  if (notFound) {
    return (
      <div className="h-screen overflow-y-auto bg-gray-50 px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Shared profile not found
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          This link may have been removed or expired.
        </p>
      </div>
    );
  }

  if (!sharedContact) {
    return (
      <div className="h-screen overflow-y-auto bg-gray-50 px-4 py-20 text-center text-sm text-gray-500">
        Loading shared profile...
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-2xl font-semibold text-gray-900">
            {sharedContact.name || "Untitled profile"}
          </div>
          <div className="mt-1 text-sm text-gray-600">
            {sharedContact.title || "No title"}
          </div>
          <div className="mt-1 text-sm text-gray-600">
            {sharedContact.location || "No location"}
          </div>
          {sharedContact.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {sharedContact.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {sharedContact.personalNotes && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Personal notes
            </div>
            <div className="mt-3 text-sm text-gray-700 whitespace-pre-line">
              {sharedContact.personalNotes}
            </div>
          </div>
        )}

        {sharedContact.profileFields?.some(
          (field) => field.value?.trim() || field.subValue?.trim()
        ) && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Profile details
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {sharedContact.profileFields
                .filter((field) => field.value?.trim() || field.subValue?.trim())
                .map((field) => (
                  <div key={field.id}>
                    <div className="text-xs font-semibold text-gray-500">
                      {field.label}
                    </div>
                    {field.value?.trim() && (
                      <div className="text-sm text-gray-800">{field.value}</div>
                    )}
                    {field.subValue?.trim() && (
                      <div className="text-xs text-gray-500">
                        {field.subValue}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {sharedContact.interactionNotes?.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Notes on interactions
            </div>
            <div className="mt-4 space-y-4">
              {sharedContact.interactionNotes.map((note) => (
                <div key={note.id} className="rounded-xl border border-gray-100 p-4">
                  <div className="text-sm font-semibold text-gray-900">
                    {note.title || "Interaction"}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {note.date}
                  </div>
                  <div className="mt-3 text-sm text-gray-700 whitespace-pre-line">
                    {note.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
