import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Helper to compute daysAgo
function computeDaysAgo(lastContact: Date): number {
  const now = new Date();
  const diff = now.getTime() - lastContact.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// GET /api/contacts/[id] - Get single contact
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const contact = await prisma.contact.findUnique({
    where: {
      id,
    },
  });

  if (!contact) {
    return Response.json({ error: "Contact not found" }, { status: 404 });
  }

  if (contact.userId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const contactWithDaysAgo = {
    ...contact,
    daysAgo: computeDaysAgo(contact.lastContact),
  };

  return Response.json(contactWithDaysAgo);
}

// PATCH /api/contacts/[id] - Update contact
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check if contact exists and user owns it
    const existingContact = await prisma.contact.findUnique({
      where: {
        id,
      },
    });

    if (!existingContact) {
      return Response.json({ error: "Contact not found" }, { status: 404 });
    }

    if (existingContact.userId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      company,
      location,
      title,
      tags,
      isQuickContact,
      profileFields,
      personalNotes,
      lastContact,
      nextMeetDate,
    } = body;

    // Build update data object (only include provided fields)
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (company !== undefined) updateData.company = company;
    if (location !== undefined) updateData.location = location;
    if (title !== undefined) updateData.title = title;
    if (tags !== undefined) updateData.tags = tags;
    if (isQuickContact !== undefined) updateData.isQuickContact = isQuickContact;
    if (profileFields !== undefined) updateData.profileFields = profileFields;
    if (personalNotes !== undefined) updateData.personalNotes = personalNotes;
    if (lastContact !== undefined)
      updateData.lastContact = new Date(lastContact);
    if (nextMeetDate !== undefined)
      updateData.nextMeetDate = nextMeetDate ? new Date(nextMeetDate) : null;

    const contact = await prisma.contact.update({
      where: {
        id,
      },
      data: updateData,
    });

    const contactWithDaysAgo = {
      ...contact,
      daysAgo: computeDaysAgo(contact.lastContact),
    };

    return Response.json(contactWithDaysAgo);
  } catch (error) {
    console.error("Error updating contact:", error);
    return Response.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts/[id] - Delete contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check if contact exists and user owns it
    const existingContact = await prisma.contact.findUnique({
      where: {
        id,
      },
    });

    if (!existingContact) {
      return Response.json({ error: "Contact not found" }, { status: 404 });
    }

    if (existingContact.userId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.contact.delete({
      where: {
        id,
      },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return Response.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
