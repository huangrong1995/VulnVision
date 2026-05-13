import { NextRequest, NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export async function POST(request: NextRequest) {
  console.log('[API] Received import request');

  try {
    const formData = await request.formData();
    console.log('[API] FormData parsed, entries:', [...formData.entries()].length);

    const res = await fetch('http://localhost:8001/api/import/cves', {
      method: 'POST',
      body: formData,
    });

    console.log('[API] Backend response status:', res.status);
    const text = await res.text();
    console.log('[API] Backend response body:', text.substring(0, 200));

    if (!res.ok) {
      console.error('[API] Backend error:', text);
      return NextResponse.json(
        { error: 'Backend error', detail: text },
        { status: res.status }
      );
    }

    return NextResponse.json(JSON.parse(text), { status: 200 });
  } catch (err) {
    console.error('[API] Route error:', err);
    return NextResponse.json(
      { error: String(err), stack: err instanceof Error ? err.stack : undefined },
      { status: 500 }
    );
  }
}