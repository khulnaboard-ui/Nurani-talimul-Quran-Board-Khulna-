import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const number = searchParams.get("number");
  const phone = searchParams.get("phone"); // optional mobile number to verify
  const showHistory = searchParams.get("history") === "1"; // flag to return usage history

  if (!number) {
    return NextResponse.json({ error: "মানি রিসিট নম্বর প্রদান করুন" }, { status: 400 });
  }

  try {
    const receipt = await (prisma as any).moneyReceipt.findUnique({
      where: { receiptNumber: number },
      include: showHistory ? { usages: { orderBy: { createdAt: 'desc' } } } : undefined,
    });

    if (!receipt) {
      return NextResponse.json({ error: "এই মানি রিসিট নম্বরটি পাওয়া যায়নি" }, { status: 404 });
    }

    // If phone provided and receipt has linked phone, verify they match
    if (phone && receipt.customerPhone && receipt.customerPhone !== phone) {
      return NextResponse.json({ error: "মোবাইল নম্বর এবং মানি রিসিট নম্বর মিলছে না" }, { status: 400 });
    }

    const availableBalance = receipt.amount - receipt.usedAmount;

    // If history mode: return full info even if balance is 0
    if (showHistory) {
      return NextResponse.json({
        success: true,
        receiptNumber: receipt.receiptNumber,
        amount: receipt.amount,
        usedAmount: receipt.usedAmount,
        availableBalance,
        status: receipt.status,
        customerPhone: receipt.customerPhone,
        createdAt: receipt.createdAt,
        usages: receipt.usages || [],
      });
    }

    if (receipt.status !== "Active") {
      return NextResponse.json({ error: "এই মানি রিসিটটি আর সক্রিয় নেই" }, { status: 400 });
    }

    if (availableBalance <= 0) {
      return NextResponse.json({ error: "এই মানি রিসিটে কোন ব্যালেন্স অবশিষ্ট নেই" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      availableBalance,
      amount: receipt.amount,
      usedAmount: receipt.usedAmount,
    });
  } catch (error) {
    console.error("Error verifying receipt:", error);
    return NextResponse.json({ error: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
