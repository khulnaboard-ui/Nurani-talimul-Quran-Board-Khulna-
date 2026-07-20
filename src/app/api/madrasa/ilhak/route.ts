import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, contactNo, address } = body;

    if (!code || !name || !address) {
      return NextResponse.json({ error: "Code, name, and address are required" }, { status: 400 });
    }

    // Check if it already exists
    const existing = await (prisma as any).madrasa.findUnique({
      where: { code },
    });

    if (existing) {
      // If it exists, we can optionally update it, but for now we just return it
      return NextResponse.json(existing);
    }

    // Create new Madrasa
    const newMadrasa = await (prisma as any).madrasa.create({
      data: {
        code,
        name,
        address,
        contactNo: contactNo || null,
        isApproved: false, // Default for newly submitted via store
      },
    });

    return NextResponse.json(newMadrasa);
  } catch (error) {
    console.error("Failed to create madrasa:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
