import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class AutoSaveService {
  private timer: NodeJS.Timeout | null = null;
  private isCommitting = false;

  async gitCommit() {
    if (this.isCommitting) return;
    
    try {
      this.isCommitting = true;
      
      const response = await fetch('/api/git', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅', data.message);
      } else {
        console.error('❌ שגיאה בשמירה אוטומטית:', data.error);
      }
    } catch (error) {
      console.error('❌ שגיאה בשמירה אוטומטית:', error);
    } finally {
      this.isCommitting = false;
    }
  }

  startAutoSave(intervalMinutes: number = 5) {
    if (this.timer) {
      clearInterval(this.timer);
    }

    // המרת דקות למילישניות
    const interval = intervalMinutes * 60 * 1000;

    this.timer = setInterval(() => {
      this.gitCommit();
    }, interval);

    console.log(`🔄 הופעלה שמירה אוטומטית כל ${intervalMinutes} דקות`);
  }

  stopAutoSave() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('⏹️ שמירה אוטומטית הופסקה');
    }
  }
}

export const autoSaveService = new AutoSaveService(); 