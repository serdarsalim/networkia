"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function MigrationBanner() {
  const { data: session } = useSession();
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);
  const [alreadyMigrated, setAlreadyMigrated] = useState(false);

  // Check on mount
  useEffect(() => {
    const checkIfAlreadyMigrated = async () => {
      try {
        // Check if user already has contacts in database
        const response = await fetch("/api/contacts");
        if (response.ok) {
          const contacts = await response.json();
          if (contacts.length > 0) {
            setAlreadyMigrated(true);
          }
        }
      } catch (error) {
        // Ignore errors, show banner anyway
      }
    };

    if (session?.user?.email) {
      checkIfAlreadyMigrated();
    }
  }, [session?.user?.email]);

  if (!session?.user?.email || dismissed || alreadyMigrated) {
    return null;
  }

  const migrateData = async () => {
    if (!session?.user?.email) return;

    setMigrating(true);
    try {
      // Get localStorage data
      const extraContactsKey = `live_full_contacts_${session.user.email}`;
      const quickContactsKey = `live_quick_contacts_${session.user.email}`;

      const extraContacts = JSON.parse(
        localStorage.getItem(extraContactsKey) || "[]"
      );
      const quickContacts = JSON.parse(
        localStorage.getItem(quickContactsKey) || "[]"
      );

      // Combine both types
      const allContacts = [...extraContacts, ...quickContacts];

      if (allContacts.length === 0) {
        setResult({ total: 0, created: 0, message: "No contacts to migrate" });
        return;
      }

      // Send to API
      const response = await fetch("/api/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: allContacts }),
      });

      const data = await response.json();
      setResult(data);

      // If migration was successful, mark as already migrated
      if (data.created > 0) {
        setAlreadyMigrated(true);
      }
    } catch (error) {
      setResult({ error: "Migration failed" });
    } finally {
      setMigrating(false);
    }
  };

  // Check if there's data to migrate
  const extraContactsKey = `live_full_contacts_${session.user.email}`;
  const quickContactsKey = `live_quick_contacts_${session.user.email}`;
  const hasLocalData =
    (localStorage.getItem(extraContactsKey) &&
      JSON.parse(localStorage.getItem(extraContactsKey) || "[]").length > 0) ||
    (localStorage.getItem(quickContactsKey) &&
      JSON.parse(localStorage.getItem(quickContactsKey) || "[]").length > 0);

  if (!hasLocalData && !result) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-full mx-4">
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 shadow-lg backdrop-blur-sm">
        {!result ? (
          <>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Migrate your contacts to database
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  You have contacts stored in localStorage. Migrate them to the
                  database for better reliability and sync across devices.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={migrateData}
                    disabled={migrating}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    {migrating ? "Migrating..." : "Migrate Now"}
                  </button>
                  <button
                    onClick={() => setDismissed(true)}
                    className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-900 dark:text-blue-100 text-sm font-medium rounded-md border border-blue-200 dark:border-blue-800 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Migration Complete!
            </h3>
            {result.error ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                {result.error}
              </p>
            ) : (
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p>
                  <strong>Total contacts:</strong> {result.total}
                </p>
                <p>
                  <strong>Created:</strong> {result.created}
                </p>
                {result.skipped > 0 && (
                  <p>
                    <strong>Skipped (already exist):</strong> {result.skipped}
                  </p>
                )}
                {result.errors && result.errors.length > 0 && (
                  <div className="text-red-600 dark:text-red-400 mt-2">
                    <p className="font-semibold">Errors ({result.errors.length}):</p>
                    <div className="text-xs mt-1 space-y-1 max-h-40 overflow-y-auto">
                      {result.errors.map((err: any, i: number) => (
                        <div key={i} className="border-l-2 border-red-400 pl-2">
                          <div className="font-medium">{err.contact}</div>
                          <div className="text-red-500">{err.error}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="mt-3 text-xs">
                  Refresh the page to see your migrated contacts!
                </p>
              </div>
            )}
            <button
              onClick={() => setDismissed(true)}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
