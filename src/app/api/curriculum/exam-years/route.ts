import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');

  try {
    if (!classId) {
      const distinctYears = await prisma.curriculumExamYear.findMany({
        select: { year: true },
        distinct: ['year'],
        orderBy: { year: 'desc' }
      });
      return NextResponse.json(distinctYears);
    }

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
    if (!data.year) {
      return NextResponse.json({ error: 'year is required' }, { status: 400 });
    }

    // Ensure the anchor class exists so years can exist without visible classes
    let anchorClass = await prisma.curriculumClass.findFirst({ where: { name: '_YEAR_ANCHOR_' } });
    if (!anchorClass) {
      anchorClass = await prisma.curriculumClass.create({ data: { name: '_YEAR_ANCHOR_', order: -1 } });
    }

    let targetClassIds: string[] = [anchorClass.id];

    if (data.copyFromPrevious) {
      const previousYearRecord = await prisma.curriculumExamYear.findFirst({
        orderBy: { year: 'desc' },
        select: { year: true }
      });

      if (previousYearRecord) {
        const previousYearClasses = await prisma.curriculumExamYear.findMany({
          where: { year: previousYearRecord.year },
          select: { classId: true }
        });
        const prevIds = previousYearClasses.map(record => record.classId).filter(id => id !== anchorClass!.id);
        targetClassIds = [...targetClassIds, ...prevIds];
      }
    }

    const operations = targetClassIds.map(classId => {
      return prisma.curriculumExamYear.create({
        data: {
          year: data.year,
          classId: classId
        }
      });
    });

    await prisma.$transaction(operations);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create exam year' }, { status: 500 });
  }
}
