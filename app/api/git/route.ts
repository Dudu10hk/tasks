import { exec } from 'child_process';
import { promisify } from 'util';
import { NextResponse } from 'next/server';

const execAsync = promisify(exec);

export async function POST() {
  try {
    // בדיקה אם יש שינויים לשמירה
    const { stdout: status } = await execAsync('git status --porcelain');
    
    if (status) {
      // הוספת כל השינויים
      await execAsync('git add .');
      
      // יצירת commit עם תאריך ושעה
      const timestamp = new Date().toLocaleString('he-IL');
      await execAsync(`git commit -m "שמירה אוטומטית - ${timestamp}"`);
      
      // דחיפה לשרת
      await execAsync('git push');
      
      return NextResponse.json({ success: true, message: 'שינויים נשמרו ונדחפו בהצלחה' });
    }
    
    return NextResponse.json({ success: true, message: 'אין שינויים לשמירה' });
  } catch (error) {
    console.error('שגיאה בשמירה אוטומטית:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 