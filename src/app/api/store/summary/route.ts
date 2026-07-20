import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import * as jose from "jose";

const prisma = new PrismaClient();

async function verifyAdmin() {
  const token = cookies().get("auth_token")?.value;
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "nurani_board_khulna_secret_key_2024");
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.role === "ADMIN";
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");

  let dateFilter: any = {};
  if (startDateStr && endDateStr) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    // Ensure end date covers the full day
    end.setHours(23, 59, 59, 999);
    
    dateFilter = {
      createdAt: {
        gte: start,
        lte: end,
      }
    };
  }

  try {
    // We only need to fetch certain fields for summary to be efficient
    const sales = await (prisma as any).storeSale.findMany({
      where: dateFilter,
      select: { totalAmount: true, discount: true, paidAmount: true }
    });

    const payments = await (prisma as any).storePayment.findMany({
      where: dateFilter,
      select: { amount: true }
    });

    const totalSales = sales.reduce((sum: number, s: any) => sum + (s.totalAmount || 0), 0);
    const totalDiscount = sales.reduce((sum: number, s: any) => sum + (s.discount || 0), 0);
    
    // Total received should ideally be the sum of actual payment transactions
    const totalReceived = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    
    // Due is what should have been paid minus what was actually received
    // Note: totalSales already has discount subtracted during sale creation.
    const totalDue = Math.max(0, totalSales - totalReceived);

    return NextResponse.json({
      totalSales,
      totalDiscount,
      totalReceived,
      totalDue
    });
  } catch (error) {
    console.error("Failed to fetch store summary:", error);
    return NextResponse.json({ error: "Failed to fetch store summary" }, { status: 500 });
  }
}
