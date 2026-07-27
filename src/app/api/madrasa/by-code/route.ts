import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const normalizedCode = code.replace(/[০-৯]/g, d => '0123456789'[d.charCodeAt(0) - 2534]);

    const madrasa = await (prisma as any).madrasa.findFirst({
      where: {
        OR: [
          { code: normalizedCode },
          { contactNo: { contains: normalizedCode } },
          { code },
          { contactNo: { contains: code } }
        ]
      },
    });

    if (!madrasa) {
      return NextResponse.json({ error: "Madrasa not found" }, { status: 404 });
    }

    return NextResponse.json(madrasa);
  } catch (error) {
    console.error("Failed to fetch madrasa by code:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
