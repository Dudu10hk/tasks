export class AutoSaveService {
  private timer: NodeJS.Timeout | null = null;
  private readonly SAVE_INTERVAL = 5 * 60 * 1000; // 5 דקות

  constructor() {
    this.startAutoSave();
  }

  private async gitCommit() {
    try {
      const response = await fetch('/api/git', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      console.log(data.message);
    } catch (error) {
      console.error('שגיאה בשמירה אוטומטית:', error);
    }
  }

  public startAutoSave() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      this.gitCommit();
    }, this.SAVE_INTERVAL);
  }

  public stopAutoSave() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

// יצירת מופע יחיד של השירות
export const autoSaveService = new AutoSaveService(); 