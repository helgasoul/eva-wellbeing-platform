// Унифицированная система сбора и хранения данных о здоровье
import { format, startOfDay, parseISO } from 'date-fns';

// Интерфейсы для всех типов данных
export interface SymptomEntry {
  id: string;
  date: string;
  symptoms: string[];
  severity: number;
  notes?: string;
  location?: string;
  weatherData?: WeatherData;
  timestamp: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  cloudCover: number;
  precipitation: number;
  uvIndex: number;
  airQualityIndex?: number;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
  };
}

export interface NutritionEntry {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
  waterIntake?: number; // мл
  caffeineIntake?: number; // мг
  alcoholIntake?: number; // единицы
  digestiveSymptoms?: string[];
  mood?: number; // 1-5
  energyLevel?: number; // 1-5
  timestamp: string;
}

export interface FoodItem {
  name: string;
  portion: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface WearableData {
  id: string;
  date: string;
  steps?: number;
  sleepHours?: number;
  sleepQuality?: number; // 1-5
  heartRateAvg?: number;
  heartRateMax?: number;
  heartRateResting?: number;
  stressLevel?: number; // 1-5
  activeMinutes?: number;
  caloriesBurned?: number;
  source: 'apple_health' | 'fitbit' | 'garmin' | 'mock';
  timestamp: string;
}

export interface HealthDataTimelineEntry {
  id: string;
  date: string;
  type: 'symptom' | 'nutrition' | 'wearable' | 'weather';
  data: SymptomEntry | NutritionEntry | WearableData | WeatherData;
  timestamp: string;
}

export interface AggregatedHealthData {
  symptoms: SymptomEntry[];
  nutrition: NutritionEntry[];
  wearables: WearableData[];
  timeline: HealthDataTimelineEntry[];
}

class HealthDataAggregator {
  private static instance: HealthDataAggregator;
  private readonly STORAGE_KEY = 'eva_health_data';

  static getInstance(): HealthDataAggregator {
    if (!HealthDataAggregator.instance) {
      HealthDataAggregator.instance = new HealthDataAggregator();
    }
    return HealthDataAggregator.instance;
  }

  // Получение всех данных
  getAllData(): AggregatedHealthData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return {
          symptoms: [],
          nutrition: [],
          wearables: [],
          timeline: []
        };
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading health data:', error);
      return {
        symptoms: [],
        nutrition: [],
        wearables: [],
        timeline: []
      };
    }
  }

  // Сохранение всех данных
  private saveAllData(data: AggregatedHealthData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log('Health data saved successfully');
    } catch (error) {
      console.error('Error saving health data:', error);
    }
  }

  // Добавление симптома с автоматическим сбором погоды
  async addSymptom(symptomData: Omit<SymptomEntry, 'id' | 'timestamp' | 'weatherData'>): Promise<SymptomEntry> {
    const id = this.generateId();
    const timestamp = new Date().toISOString();
    
    // Получаем погодные данные для даты симптома
    const weatherData = await this.getWeatherForDate(symptomData.date);
    
    const entry: SymptomEntry = {
      ...symptomData,
      id,
      timestamp,
      weatherData
    };

    const allData = this.getAllData();
    allData.symptoms.push(entry);
    
    // Добавляем в timeline
    allData.timeline.push({
      id: this.generateId(),
      date: entry.date,
      type: 'symptom',
      data: entry,
      timestamp
    });

    this.saveAllData(allData);
    console.log('Symptom added with weather data:', entry);
    return entry;
  }

  // Добавление записи питания
  addNutritionEntry(nutritionData: Omit<NutritionEntry, 'id' | 'timestamp'>): NutritionEntry {
    const id = this.generateId();
    const timestamp = new Date().toISOString();
    
    const entry: NutritionEntry = {
      ...nutritionData,
      id,
      timestamp
    };

    const allData = this.getAllData();
    allData.nutrition.push(entry);
    
    // Добавляем в timeline
    allData.timeline.push({
      id: this.generateId(),
      date: entry.date,
      type: 'nutrition',
      data: entry,
      timestamp
    });

    this.saveAllData(allData);
    console.log('Nutrition entry added:', entry);
    return entry;
  }

  // Добавление данных носимых устройств
  addWearableData(wearableData: Omit<WearableData, 'id' | 'timestamp'>): WearableData {
    const id = this.generateId();
    const timestamp = new Date().toISOString();
    
    const entry: WearableData = {
      ...wearableData,
      id,
      timestamp
    };

    const allData = this.getAllData();
    
    // Проверяем, есть ли уже данные за эту дату
    const existingIndex = allData.wearables.findIndex(
      w => w.date === entry.date && w.source === entry.source
    );
    
    if (existingIndex >= 0) {
      // Обновляем существующую запись
      allData.wearables[existingIndex] = entry;
    } else {
      // Добавляем новую запись
      allData.wearables.push(entry);
      
      // Добавляем в timeline
      allData.timeline.push({
        id: this.generateId(),
        date: entry.date,
        type: 'wearable',
        data: entry,
        timestamp
      });
    }

    this.saveAllData(allData);
    console.log('Wearable data added:', entry);
    return entry;
  }

  // Получение погодных данных через Open-Meteo API
  async getWeatherForDate(date: string): Promise<WeatherData | undefined> {
    try {
      // Получаем геолокацию пользователя
      const location = await this.getUserLocation();
      if (!location) {
        console.warn('Location not available for weather data');
        return undefined;
      }

      const formattedDate = format(parseISO(date), 'yyyy-MM-dd');
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m,surface_pressure,wind_speed_10m_max,precipitation_sum,uv_index_max&timezone=auto&start_date=${formattedDate}&end_date=${formattedDate}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      const daily = data.daily;

      if (!daily || !daily.temperature_2m_max?.[0]) {
        throw new Error('No weather data available for this date');
      }

      const weatherData: WeatherData = {
        temperature: Math.round((daily.temperature_2m_max[0] + daily.temperature_2m_min[0]) / 2),
        humidity: daily.relative_humidity_2m?.[0] || 0,
        pressure: daily.surface_pressure?.[0] || 0,
        windSpeed: daily.wind_speed_10m_max?.[0] || 0,
        cloudCover: 0, // Open-Meteo free tier doesn't include this
        precipitation: daily.precipitation_sum?.[0] || 0,
        uvIndex: daily.uv_index_max?.[0] || 0,
        location
      };

      console.log('Weather data fetched for', date, ':', weatherData);
      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return undefined;
    }
  }

  // Получение геолокации пользователя
  private async getUserLocation(): Promise<{ latitude: number; longitude: number; city?: string } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Fallback к примерным координатам Москвы
          resolve({
            latitude: 55.7558,
            longitude: 37.6176,
            city: 'Moscow'
          });
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    });
  }

  // Получение данных для ИИ-анализа
  getDataForAIAnalysis(days: number = 30): {
    symptoms: SymptomEntry[];
    nutrition: NutritionEntry[];
    wearables: WearableData[];
    correlations: any;
  } {
    const allData = this.getAllData();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffString = format(cutoffDate, 'yyyy-MM-dd');

    const recentSymptoms = allData.symptoms.filter(s => s.date >= cutoffString);
    const recentNutrition = allData.nutrition.filter(n => n.date >= cutoffString);
    const recentWearables = allData.wearables.filter(w => w.date >= cutoffString);

    // Базовый корреляционный анализ
    const correlations = this.calculateBasicCorrelations(recentSymptoms, recentNutrition, recentWearables);

    return {
      symptoms: recentSymptoms,
      nutrition: recentNutrition,
      wearables: recentWearables,
      correlations
    };
  }

  // Базовый корреляционный анализ
  private calculateBasicCorrelations(symptoms: SymptomEntry[], nutrition: NutritionEntry[], wearables: WearableData[]): any {
    const correlations: any = {
      weatherSymptoms: {},
      nutritionSymptoms: {},
      sleepSymptoms: {},
      activitySymptoms: {}
    };

    // Анализ корреляции симптомов с погодой
    symptoms.forEach(symptom => {
      if (symptom.weatherData) {
        symptom.symptoms.forEach(s => {
          if (!correlations.weatherSymptoms[s]) {
            correlations.weatherSymptoms[s] = {
              temperatures: [],
              pressures: [],
              humidities: []
            };
          }
          correlations.weatherSymptoms[s].temperatures.push(symptom.weatherData!.temperature);
          correlations.weatherSymptoms[s].pressures.push(symptom.weatherData!.pressure);
          correlations.weatherSymptoms[s].humidities.push(symptom.weatherData!.humidity);
        });
      }
    });

    // Анализ корреляции с питанием и сном
    const symptomDates = symptoms.map(s => s.date);
    
    symptomDates.forEach(date => {
      const dayNutrition = nutrition.filter(n => n.date === date);
      const dayWearables = wearables.find(w => w.date === date);
      const daySymptoms = symptoms.filter(s => s.date === date);

      if (daySymptoms.length > 0) {
        const symptomSeverity = daySymptoms.reduce((sum, s) => sum + s.severity, 0) / daySymptoms.length;
        
        // Корреляция со сном
        if (dayWearables?.sleepHours) {
          if (!correlations.sleepSymptoms.data) correlations.sleepSymptoms.data = [];
          correlations.sleepSymptoms.data.push({
            sleep: dayWearables.sleepHours,
            severity: symptomSeverity
          });
        }

        // Корреляция с активностью
        if (dayWearables?.steps) {
          if (!correlations.activitySymptoms.data) correlations.activitySymptoms.data = [];
          correlations.activitySymptoms.data.push({
            steps: dayWearables.steps,
            severity: symptomSeverity
          });
        }
      }
    });

    console.log('Correlations calculated:', correlations);
    return correlations;
  }

  // Получение timeline событий
  getTimeline(days: number = 7): HealthDataTimelineEntry[] {
    const allData = this.getAllData();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffString = format(cutoffDate, 'yyyy-MM-dd');

    return allData.timeline
      .filter(entry => entry.date >= cutoffString)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Генерация уникального ID
  private generateId(): string {
    return `eva_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Мигрировать старые данные симптомов из localStorage
  migrateOldSymptomData(): void {
    try {
      const oldSymptoms = localStorage.getItem('symptom-entries');
      if (oldSymptoms) {
        const parsed = JSON.parse(oldSymptoms);
        const allData = this.getAllData();
        
        // Проверяем, не мигрировали ли уже
        if (allData.symptoms.length === 0 && parsed.length > 0) {
          console.log('Migrating old symptom data...');
          
          parsed.forEach((oldEntry: any) => {
            const symptomEntry: SymptomEntry = {
              id: this.generateId(),
              date: oldEntry.date,
              symptoms: oldEntry.symptoms || [],
              severity: oldEntry.severity || 1,
              notes: oldEntry.notes,
              location: oldEntry.location,
              timestamp: oldEntry.timestamp || new Date().toISOString()
            };
            
            allData.symptoms.push(symptomEntry);
            allData.timeline.push({
              id: this.generateId(),
              date: symptomEntry.date,
              type: 'symptom',
              data: symptomEntry,
              timestamp: symptomEntry.timestamp
            });
          });
          
          this.saveAllData(allData);
          console.log(`Migrated ${parsed.length} symptom entries`);
        }
      }
    } catch (error) {
      console.error('Error migrating old symptom data:', error);
    }
  }

  // Получение статистики данных
  getDataStats(): {
    totalEntries: number;
    symptomEntries: number;
    nutritionEntries: number;
    wearableEntries: number;
    daysWithData: number;
    lastEntry?: string;
  } {
    const allData = this.getAllData();
    const uniqueDates = new Set([
      ...allData.symptoms.map(s => s.date),
      ...allData.nutrition.map(n => n.date),
      ...allData.wearables.map(w => w.date)
    ]);

    const allTimestamps = [
      ...allData.symptoms.map(s => s.timestamp),
      ...allData.nutrition.map(n => n.timestamp),
      ...allData.wearables.map(w => w.timestamp)
    ].filter(Boolean).sort();

    return {
      totalEntries: allData.symptoms.length + allData.nutrition.length + allData.wearables.length,
      symptomEntries: allData.symptoms.length,
      nutritionEntries: allData.nutrition.length,
      wearableEntries: allData.wearables.length,
      daysWithData: uniqueDates.size,
      lastEntry: allTimestamps[allTimestamps.length - 1]
    };
  }
}

export const healthDataAggregator = HealthDataAggregator.getInstance();