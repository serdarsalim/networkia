import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Helper to generate slug from name
function generateSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const shortId = Math.random().toString(36).substring(2, 8);
  return `${slug}-${shortId}`;
}

// Helper to generate initials
function generateInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

// POST /api/migrate - Migrate localStorage contacts to database
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { contacts } = body;

    if (!Array.isArray(contacts)) {
      return Response.json(
        { error: "contacts must be an array" },
        { status: 400 }
      );
    }

    const results = {
      total: contacts.length,
      created: 0,
      skipped: 0,
      errors: [],
    };

    for (const contact of contacts) {
      try {
        // Skip if contact with same name already exists for this user
        const existing = await prisma.contact.findFirst({
          where: {
            userId: session.user.id,
            name: contact.name,
          },
        });

        if (existing) {
          results.skipped++;
          continue;
        }

        // Create contact in database
        await prisma.contact.create({
          data: {
            userId: session.user.id,
            name: contact.name,
            email: contact.email || null,
            phone: contact.phone || null,
            company: contact.company || null,
            location: contact.location || "",
            title: contact.title || null,
            slug: contact.slug || generateSlug(contact.name),
            initials: contact.initials || generateInitials(contact.name),
            tags: contact.tags || [],
            isQuickContact: contact.isQuickContact || false,
            profileFields: contact.profileFields || null,
            personalNotes: contact.personalNotes || null,
            lastContact: contact.lastContact
              ? new Date(contact.lastContact)
              : new Date(),
            nextMeetDate: contact.nextMeetDate
              ? new Date(contact.nextMeetDate)
              : null,
            shareToken: contact.shareToken || null,
            isShared: contact.isShared || false,
          },
        });

        results.created++;
      } catch (error: any) {
        results.errors.push({
          contact: contact.name,
          error: error.message,
        });
      }
    }

    return Response.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error("Error migrating contacts:", error);
    return Response.json(
      { error: "Failed to migrate contacts" },
      { status: 500 }
    );
  }
}
