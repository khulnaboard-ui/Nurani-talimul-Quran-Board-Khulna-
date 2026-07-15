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

export async function GET() {
  try {
    const payments = await (prisma as any).storePayment.findMany({
      orderBy: { createdAt: "desc" },
      include: { sale: true },
    });
    return NextResponse.json(payments);
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { saleId, payer, purpose, amount, method, status, notes } = await request.json();
    if (!payer || !purpose || amount === undefined) {
      return NextResponse.json({ error: "payer, purpose, and amount are required" }, { status: 400 });
    }

    const payment = await (prisma as any).storePayment.create({
      data: {
        saleId: saleId || null,
        payer,
        purpose,
        amount: parseFloat(amount),
        method: method || "Cash",
        status: status || "Completed",
        notes: notes || "",
      },
      include: { sale: true },
    });

    // If linked to a sale, update the sale's paidAmount and status
    if (saleId) {
      const sale = await (prisma as any).storeSale.findUnique({ where: { id: saleId } });
      if (sale) {
        const newPaid = (sale.paidAmount || 0) + parseFloat(amount);
        const newStatus = newPaid >= sale.totalAmount ? "Paid" : newPaid > 0 ? "Partial" : "Pending";
        await (prisma as any).storeSale.update({
          where: { id: saleId },
          data: { paidAmount: newPaid, status: newStatus },
        });
      }
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Failed to create payment:", error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
