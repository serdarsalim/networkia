import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET /api/circles - Get user's circles
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const circles = await prisma.circle.findMany({
    where: {
      userId,
    },
    orderBy: {
      order: "asc",
    },
  });

  return Response.json(circles);
}

// POST /api/circles - Sync all circles (delete old ones, create/update new ones)
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const { circles } = body;

    if (!Array.isArray(circles)) {
      return Response.json(
        { error: "circles must be an array" },
        { status: 400 }
      );
    }

    // Get current circles
    const existingCircles = await prisma.circle.findMany({
      where: { userId },
    });

    // Build a map of new circles by order position
    const newCirclesByOrder = new Map<number, { name: string; isActive: boolean }>();
    circles.forEach((circle: any, index: number) => {
      if (circle.name?.trim()) {
        newCirclesByOrder.set(circle.order ?? index, {
          name: circle.name.trim(),
          isActive: circle.isActive ?? true,
        });
      }
    });

    // Delete circles that no longer exist
    const existingOrders = new Set(existingCircles.map(c => c.order));
    const newOrders = new Set(newCirclesByOrder.keys());
    const ordersToDelete = [...existingOrders].filter(o => !newOrders.has(o));

    if (ordersToDelete.length > 0) {
      await prisma.circle.deleteMany({
        where: {
          userId,
          order: { in: ordersToDelete },
        },
      });
    }

    // Upsert circles by order position (not by name)
    const results = await Promise.all(
      [...newCirclesByOrder.entries()].map(([order, data]) => {
        const existing = existingCircles.find(c => c.order === order);
        if (existing) {
          // Update existing circle at this order position
          return prisma.circle.update({
            where: { id: existing.id },
            data: {
              name: data.name,
              isActive: data.isActive,
            },
          });
        } else {
          // Create new circle at this order position
          return prisma.circle.create({
            data: {
              userId,
              name: data.name,
              isActive: data.isActive,
              order,
            },
          });
        }
      })
    );

    return Response.json(results);
  } catch (error) {
    console.error("Error syncing circles:", error);
    return Response.json(
      { error: "Failed to update circles" },
      { status: 500 }
    );
  }
}
