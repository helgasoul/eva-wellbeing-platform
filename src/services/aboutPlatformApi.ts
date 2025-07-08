import { AboutPlatformData } from '@/hooks/useAboutPlatformData';

class AboutPlatformApi {
  private storageKey = 'about-platform-data';

  async getData(): Promise<AboutPlatformData | null> {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Ошибка получения данных:', error);
      return null;
    }
  }

  async saveData(data: AboutPlatformData): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      console.log('Данные сохранены');
    } catch (error) {
      console.error('Ошибка сохранения данных:', error);
      throw error;
    }
  }

  async updateData(data: AboutPlatformData): Promise<void> {
    return this.saveData(data);
  }
}

export const aboutPlatformApi = new AboutPlatformApi();