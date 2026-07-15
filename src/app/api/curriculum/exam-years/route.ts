import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');
  if (!classId) return NextResponse.json({ error: 'classId is required' }, { status: 400 });

  try {
    const years = await prisma.curriculumExamYear.findMany({
      where: { classId },
      include: {
        exams: {
          include: {
            resources: true
          }
        }
      },
      orderBy: { year: 'desc' }
    });
    return NextResponse.json(years);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch exam years' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.year || !data.classId) {
      return NextResponse.json({ error: 'year and classId are required' }, { status: 400 });
    }

    const newYear = await prisma.curriculumExamYear.create({
      data: {
        year: data.year,
        classId: data.classId
      }
    });
    return NextResponse.json(newYear, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create exam year' }, { status: 500 });
  }
}
