import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');
  if (!classId) return NextResponse.json({ error: 'classId is required' }, { status: 400 });

  try {
    const syllabuses = await prisma.curriculumSyllabus.findMany({
      where: { classId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(syllabuses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch syllabuses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.title || !data.pdfUrl || !data.classId) {
      return NextResponse.json({ error: 'title, pdfUrl, and classId are required' }, { status: 400 });
    }

    const newSyllabus = await prisma.curriculumSyllabus.create({
      data: {
        title: data.title,
        pdfUrl: data.pdfUrl,
        classId: data.classId
      }
    });
    return NextResponse.json(newSyllabus, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create syllabus' }, { status: 500 });
  }
}
