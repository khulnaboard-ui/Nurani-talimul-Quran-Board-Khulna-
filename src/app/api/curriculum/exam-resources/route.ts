import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.examId || !data.type || !data.fileUrl) {
      return NextResponse.json({ error: 'examId, type, and fileUrl are required' }, { status: 400 });
    }

    const newResource = await prisma.curriculumExamResource.create({
      data: {
        examId: data.examId,
        type: data.type,
        title: data.title,
        fileUrl: data.fileUrl
      }
    });
    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create exam resource' }, { status: 500 });
  }
}
