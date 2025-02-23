import { exec } from 'child_process';
import { promisify } from 'util';
import { NextResponse } from 'next/server';

const execAsync = promisify(exec);

export async function POST() {
  try {
    const date = new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' });
    
    await execAsync('git add .');
    await execAsync(`git commit -m "שמירה אוטומטית - ${date}"`);
    await execAsync('git push');

    return NextResponse.json({ 
      success: true, 
      message: `בוצעה שמירה אוטומטית - ${date}` 
    });
  } catch (error) {
    console.error('שגיאה בביצוע פעולות Git:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'שגיאה בביצוע פעולות Git' 
    }, { status: 500 });
  }
} 