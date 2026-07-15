import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const books = await prisma.curriculumBook.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(books);
  } catch (error) {
    console.error('Fetch curriculum books error:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.title || !data.classId) {
      return NextResponse.json({ error: 'Title and classId are required' }, { status: 400 });
    }

    const newBook = await prisma.curriculumBook.create({
      data: {
        title: data.title,
        description: data.description,
        coverImage: data.coverImage,
        pdfUrl: data.pdfUrl,
        classId: data.classId
      }
    });

    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error('Create curriculum book error:', error);
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
