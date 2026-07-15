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
    const products = await (prisma as any).storeProduct.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { name, category, price, stock, unit, imageUrl, barcode, className, subject } = await request.json();
    
    // Convert to numbers safely
    const parsedPrice = Number(price);
    const parsedStock = Number(stock) || 0;
    
    if (!name || !category || isNaN(parsedPrice)) {
      return NextResponse.json({ error: "Valid name, category, and price are required" }, { status: 400 });
    }
    
    const product = await (prisma as any).storeProduct.create({
      data: { 
        name, 
        category, 
        price: parsedPrice, 
        stock: parsedStock, 
        unit: unit || "টি",
        imageUrl: imageUrl || null,
        barcode: barcode?.trim() || null,
        className: className || null,
        subject: subject || null
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
