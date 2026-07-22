import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: { year: string } }) {
  try {
    // Delete the year mappings and their exams
    await prisma.curriculumExamYear.deleteMany({
      where: { year: params.year }
    });

    // Clean up any classes that are now orphaned (not attached to any year)
    const orphanedClasses = await prisma.curriculumClass.findMany({
      where: {
        examYears: { none: {} },
        name: { not: '_YEAR_ANCHOR_' }
      },
      select: { id: true }
    });

    if (orphanedClasses.length > 0) {
      await prisma.curriculumClass.deleteMany({
        where: { id: { in: orphanedClasses.map(c => c.id) } }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete global year' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { year: string } }) {
  try {
    const data = await request.json();
    if (!data.year) {
      return NextResponse.json({ error: 'New year string is required' }, { status: 400 });
    }

    await prisma.curriculumExamYear.updateMany({
      where: { year: params.year },
      data: { year: data.year }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update global year' }, { status: 500 });
  }
}
