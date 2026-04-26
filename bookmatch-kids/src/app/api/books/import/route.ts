import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { parseBookList } from '@/lib/parseBookList';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const contentType = req.headers.get('content-type') ?? '';

  let rawText: string;

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = file.name.toLowerCase();

    if (name.endsWith('.csv')) {
      rawText = buffer.toString('utf-8');
    } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rawText = XLSX.utils.sheet_to_csv(sheet);
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Use .csv, .xlsx, or .xls' },
        { status: 400 }
      );
    }
  } else {
    const body = await req.json();
    rawText = body.text;
    if (!rawText || typeof rawText !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }
  }

  if (rawText.trim().length === 0) {
    return NextResponse.json({ error: 'Empty input' }, { status: 400 });
  }

  // Cap input size to avoid huge Claude calls
  if (rawText.length > 50000) {
    return NextResponse.json(
      { error: 'Input too large. Try a smaller list (under 500 books).' },
      { status: 400 }
    );
  }

  try {
    const books = await parseBookList(rawText);
    return NextResponse.json({ books });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to parse book list';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
