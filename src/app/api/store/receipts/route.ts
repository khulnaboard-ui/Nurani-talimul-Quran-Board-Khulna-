import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET() {
  try {
    const receipts = await (prisma as any).moneyReceipt.findMany({
      orderBy: { createdAt: 'desc' },
      include: { usages: true }
    });
    return NextResponse.json(receipts);
  } catch (error) {
    console.error("Failed to fetch receipts:", error);
    return NextResponse.json({ error: "Failed to fetch receipts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { receiptNumber, amount, customerPhone } = await request.json();
    
    if (!receiptNumber || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const existing = await (prisma as any).moneyReceipt.findUnique({
      where: { receiptNumber }
    });

    if (existing) {
      return NextResponse.json({ error: "Receipt number already exists" }, { status: 400 });
    }

    const receipt = await (prisma as any).moneyReceipt.create({
      data: {
        receiptNumber,
        amount,
        customerPhone: customerPhone || null,
        status: "Active"
      }
    });

    return NextResponse.json(receipt);
  } catch (error) {
    console.error("Failed to create receipt:", error);
    return NextResponse.json({ error: "Failed to create receipt" }, { status: 500 });
  }
}
