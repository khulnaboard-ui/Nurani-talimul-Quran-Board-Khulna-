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
      // If not found in Madrasa, check StoreSale for returning customers
      const lastSale = await (prisma as any).storeSale.findFirst({
        where: { customerPhone: normalizedCode },
        orderBy: { createdAt: 'desc' }
      });

      if (lastSale) {
        let extractedAddress = "";
        if (lastSale.notes) {
          const match = lastSale.notes.match(/ঠিকানা:\s*([^()]+)/);
          extractedAddress = match ? match[1].trim() : lastSale.notes;
        }

        return NextResponse.json({
          ownerName: lastSale.customerName,
          name: lastSale.instituteId || "",
          contactNo: lastSale.customerPhone || "",
          address: extractedAddress
        });
      }

      return NextResponse.json({ error: "Madrasa or Customer not found" }, { status: 404 });
    }

    // Madrasa is found, but let's see if we have a previous order to pre-fill ownerName
    const pastSale = await (prisma as any).storeSale.findFirst({
      where: { 
        OR: [
          { customerPhone: normalizedCode },
          { instituteId: madrasa.name }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      ...madrasa, 
      ownerName: pastSale ? pastSale.customerName : "" 
    });
  } catch (error) {
    console.error("Failed to fetch madrasa by code:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
