import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { invoiceId: string } }) {
  try {
    const { invoiceId } = params;

    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
    }

    const sale = await (prisma as any).storeSale.findFirst({
      where: { invoiceId: invoiceId },
      include: { items: { include: { product: true } }, payments: true },
    });

    if (!sale) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let currentDueList: any[] = [];
    let currentTotalDue = 0;
    if (sale.customerPhone) {
      const allSales = await (prisma as any).storeSale.findMany({ where: { customerPhone: sale.customerPhone } });
      allSales.forEach((s: any) => {
        // Exclude the current invoice from the "previous/other" due list so we can show it separately
        if (s.invoiceId !== sale.invoiceId) {
          const due = s.totalAmount - s.paidAmount - s.discount;
          if (due > 0) {
            currentTotalDue += due;
            currentDueList.push({
              invoiceId: s.invoiceId,
              date: s.createdAt,
              due: due
            });
          }
        }
      });
    }

    return NextResponse.json({ ...sale, currentDueList, currentTotalDue });
  } catch (error) {
    console.error("Failed to track order:", error);
    return NextResponse.json({ error: "Failed to track order" }, { status: 500 });
  }
}
