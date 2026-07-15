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

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { quantity, reason } = await request.json();
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty === 0) {
      return NextResponse.json({ error: "Valid quantity is required" }, { status: 400 });
    }

    // Atomic update to add the stock and create history in a transaction
    const [history, product] = await prisma.$transaction([
      (prisma as any).stockHistory.create({
        data: {
          productId: params.id,
          quantity: qty,
          reason: reason || "Stock update"
        }
      }),
      (prisma as any).storeProduct.update({
        where: { id: params.id },
        data: {
          stock: { increment: qty }
        }
      })
    ]);

    return NextResponse.json({ product, history });
  } catch (error) {
    console.error("Failed to update stock:", error);
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const history = await (prisma as any).stockHistory.findMany({
      where: { productId: params.id },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(history);
  } catch (error) {
    console.error("Failed to fetch stock history:", error);
    return NextResponse.json({ error: "Failed to fetch stock history" }, { status: 500 });
  }
}
