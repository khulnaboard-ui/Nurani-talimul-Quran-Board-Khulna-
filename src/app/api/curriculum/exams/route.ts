import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.name || !data.yearId) {
      return NextResponse.json({ error: 'name and yearId are required' }, { status: 400 });
    }

    const newExam = await prisma.curriculumExam.create({
      data: {
        name: data.name,
        yearId: data.yearId
      }
    });
    return NextResponse.json(newExam, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 });
  }
}
