"use client";

import { useContacts } from "@/hooks/use-contacts";
import { useSession } from "next-auth/react";

export default function TestContactsPage() {
  const { data: session } = useSession();
  const { contacts, isLoading, addContact, isDemo } = useContacts();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Contacts Page</h1>

      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <p><strong>Mode:</strong> {isDemo ? "Demo (localStorage)" : "Live (Database)"}</p>
        <p><strong>User:</strong> {session?.user?.email || "Not logged in"}</p>
        <p><strong>Contact Count:</strong> {contacts.length}</p>
      </div>

      <h2 className="text-xl font-semibold mb-3">Contacts:</h2>

      {contacts.length === 0 ? (
        <p className="text-gray-500">No contacts found</p>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact: any) => (
            <div key={contact.id} className="p-3 border rounded">
              <p className="font-semibold">{contact.name}</p>
              <p className="text-sm text-gray-600">{contact.location}</p>
              <p className="text-xs text-gray-400">Tags: {contact.tags?.join(", ") || "None"}</p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={async () => {
          await addContact({
            name: "Test Contact " + Date.now(),
            location: "Test City",
            tags: ["Test"],
          });
        }}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add Test Contact
      </button>
    </div>
  );
}
