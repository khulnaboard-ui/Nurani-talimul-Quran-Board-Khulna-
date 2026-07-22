import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.curriculumClass.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete curriculum class error:', error);
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    if (!data.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const updatedClass = await prisma.curriculumClass.update({
      where: { id: params.id },
      data: { name: data.name }
    });
    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('Update curriculum class error:', error);
    return NextResponse.json({ error: 'Failed to update class' }, { status: 500 });
  }
}
