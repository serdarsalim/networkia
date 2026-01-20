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

// Helper to compute daysAgo
function computeDaysAgo(lastContact: Date | null): number | null {
  if (!lastContact) {
    return null;
  }
  const now = new Date();
  const diff = now.getTime() - lastContact.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function normalizeNextMeetCadence(value: unknown) {
  if (value === undefined) {
    return undefined;
  }
  if (value === null || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  switch (normalized) {
    case "weekly":
      return "WEEKLY";
    case "biweekly":
      return "BIWEEKLY";
    case "monthly":
      return "MONTHLY";
    case "quarterly":
      return "QUARTERLY";
    default:
      return null;
  }
}

// GET /api/contacts - List all user's contacts
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contacts = await prisma.contact.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      interactions: true,
    },
  });

  // Add computed daysAgo field
  const contactsWithDaysAgo = contacts.map((contact) => ({
    ...contact,
    daysAgo: computeDaysAgo(contact.lastContact),
    nextMeetCadence: contact.nextMeetCadence
      ? contact.nextMeetCadence.toLowerCase()
      : null,
    interactionNotes: contact.interactions.map((interaction) => ({
      id: interaction.id,
      title: interaction.title,
      body: interaction.body,
      date: interaction.date.toISOString(),
    })),
  }));

  return Response.json(contactsWithDaysAgo);
}

// POST /api/contacts - Create new contact
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      company,
      location = "",
      title,
      tags = [],
      isQuickContact = false,
      profileFields,
      personalNotes,
      lastContact,
      nextMeetDate,
      nextMeetCadence,
    } = body;

    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = generateSlug(name);
    const initials = generateInitials(name);

    const contact = await prisma.contact.create({
      data: {
        userId: session.user.id,
        name,
        email,
        phone,
        company,
        location,
        title,
        slug,
        initials,
        tags,
        isQuickContact,
        profileFields: profileFields || undefined,
        personalNotes,
        lastContact: lastContact ? new Date(lastContact) : null,
        nextMeetDate: nextMeetDate ? new Date(nextMeetDate) : null,
        nextMeetCadence: normalizeNextMeetCadence(nextMeetCadence),
      },
    });

    // Add computed daysAgo field
    const contactWithDaysAgo = {
      ...contact,
      daysAgo: computeDaysAgo(contact.lastContact),
      nextMeetCadence: contact.nextMeetCadence
        ? contact.nextMeetCadence.toLowerCase()
        : null,
    };

    return Response.json(contactWithDaysAgo, { status: 201 });
  } catch (error) {
    console.error("Error creating contact:", error);
    return Response.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
