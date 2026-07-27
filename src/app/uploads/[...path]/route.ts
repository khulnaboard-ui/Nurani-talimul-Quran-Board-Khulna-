import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  // Prevent directory traversal
  const safePath = params.path.filter(p => !p.includes("..") && !p.includes("/") && !p.includes("\\"));
  
  const filePath = join(process.cwd(), "public", "uploads", ...safePath);
  
  try {
    const file = await readFile(filePath);
    
    // Determine content type based on extension
    const ext = filePath.split('.').pop()?.toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === "png") contentType = "image/png";
    else if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
    else if (ext === "gif") contentType = "image/gif";
    else if (ext === "webp") contentType = "image/webp";
    else if (ext === "svg") contentType = "image/svg+xml";
    else if (ext === "pdf") contentType = "application/pdf";
    
    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    return new NextResponse("File not found", { status: 404 });
  }
}
