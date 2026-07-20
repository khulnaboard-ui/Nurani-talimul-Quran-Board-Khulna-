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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const sale = await (prisma as any).storeSale.findUnique({
      where: { id: params.id },
      include: { items: { include: { product: true } }, payments: true },
    });
    if (!sale) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(sale);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sale" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const existingSale = await (prisma as any).storeSale.findUnique({ where: { id: params.id } });
    if (!existingSale) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (body.status !== undefined) data.status = body.status;
    let paymentAmount = 0;
    if (body.paidAmount !== undefined) {
      data.paidAmount = parseFloat(body.paidAmount);
      paymentAmount = (data.paidAmount as number) - (existingSale.paidAmount || 0);
    }
    if (body.notes !== undefined) data.notes = body.notes;
    const sale = await (prisma as any).storeSale.update({
      where: { id: params.id },
      data,
      include: { items: { include: { product: true } }, payments: true },
    });

    if (paymentAmount > 0) {
      await (prisma as any).storePayment.create({
        data: {
          saleId: sale.id,
          payer: sale.customerName,
          purpose: `Payment for Invoice ${sale.invoiceId}`,
          amount: paymentAmount,
          method: "Cash",
          status: "Completed",
          notes: body.notes || "",
        },
      });
    }

    return NextResponse.json(sale);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update sale" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await (prisma as any).storeSale.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete sale" }, { status: 500 });
  }
}
