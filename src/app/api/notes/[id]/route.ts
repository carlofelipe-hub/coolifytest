import { NextResponse } from 'next/server';
import pool from '@/lib/db';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { content } = await request.json();
    const { rows } = await pool.query(
      'UPDATE notes SET content = $1 WHERE id = $2 RETURNING *',
      [content, context.params.id]
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await pool.query('DELETE FROM notes WHERE id = $1', [context.params.id]);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
