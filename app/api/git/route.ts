import { NextResponse } from 'next/server';
import { commitAndPush } from '@/lib/git-handler';

export async function POST() {
  try {
    const result = await commitAndPush();
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('שגיאה בשמירה אוטומטית:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 