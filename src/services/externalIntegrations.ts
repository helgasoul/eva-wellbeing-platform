// Интеграции с внешними сервисами для системы питания

export interface OrderResult {
  success: boolean;
  orderId?: string;
  estimatedDelivery?: string;
  totalCost?: number;
  error?: string;
}

export interface ProductLink {
  name: string;
  url: string;
  price: number;
  store: string;
  inStock: boolean;
  rating?: number;
  reviews?: number;
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  date: string;
  meals: Array<{
    name: string;
    calories: number;
    time: string;
  }>;
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: string;
  estimatedPrice?: number;
}

export interface SupplementRecommendation {
  name: string;
  dosage: string;
  form: string;
  brand?: string;
}

// Сервисы доставки продуктов
export class DeliveryService {
  static async createSamokatOrder(shoppingList: ShoppingItem[]): Promise<OrderResult> {
    try {
      // Интеграция с API Самокат
      const response = await fetch('/api/delivery/samocat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: shoppingList.map(item => ({
            name: item.name,
            quantity: item.amount,
            unit: item.unit
          })),
          delivery_type: 'fast'
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка создания заказа');
      }

      const data = await response.json();
      return {
        success: true,
        orderId: data.order_id,
        estimatedDelivery: data.estimated_delivery,
        totalCost: data.total_cost
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  static async createYandexLavkaOrder(shoppingList: ShoppingItem[]): Promise<OrderResult> {
    try {
      // Интеграция с API Яндекс.Лавка
      const response = await fetch('/api/delivery/yandex-lavka', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: shoppingList.map(item => ({
            title: item.name,
            count: item.amount,
            measure: item.unit
          }))
        })
      });

      const data = await response.json();
      return {
        success: response.ok,
        orderId: data.order_id,
        estimatedDelivery: data.delivery_time,
        totalCost: data.total_price
      };
    } catch (error) {
      return {
        success: false,
        error: 'Ошибка подключения к Яндекс.Лавка'
      };
    }
  }

  static async createVkusvillOrder(shoppingList: ShoppingItem[]): Promise<OrderResult> {
    try {
      // Интеграция с API ВкусВилл
      const response = await fetch('/api/delivery/vkusvill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: shoppingList,
          store_type: 'organic'
        })
      });

      const data = await response.json();
      return {
        success: response.ok,
        orderId: data.order_number,
        estimatedDelivery: data.delivery_date,
        totalCost: data.amount
      };
    } catch (error) {
      return {
        success: false,
        error: 'Ошибка подключения к ВкусВилл'
      };
    }
  }
}

// Партнерские магазины БАД
export class SupplementStores {
  static async getIHerbLinks(supplements: SupplementRecommendation[]): Promise<ProductLink[]> {
    try {
      const response = await fetch('/api/supplements/iherb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplements: supplements.map(s => ({
            name: s.name,
            form: s.form,
            brand: s.brand
          }))
        })
      });

      const data = await response.json();
      return data.products?.map((product: any) => ({
        name: product.name,
        url: `https://iherb.com/product/${product.id}?rcode=PARTNER`,
        price: product.price,
        store: 'iHerb',
        inStock: product.in_stock,
        rating: product.rating,
        reviews: product.reviews_count
      })) || [];
    } catch (error) {
      console.error('Ошибка получения ссылок iHerb:', error);
      return [];
    }
  }

  static async getAptekaLinks(supplements: SupplementRecommendation[]): Promise<ProductLink[]> {
    try {
      const response = await fetch('/api/supplements/apteka', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: supplements.map(s => s.name)
        })
      });

      const data = await response.json();
      return data.results?.map((item: any) => ({
        name: item.title,
        url: `https://apteka.ru/product/${item.slug}?partner=eva`,
        price: item.price,
        store: 'Аптека.ру',
        inStock: item.available,
        rating: item.rating
      })) || [];
    } catch (error) {
      console.error('Ошибка получения ссылок Аптека.ру:', error);
      return [];
    }
  }

  static async getOzonLinks(supplements: SupplementRecommendation[]): Promise<ProductLink[]> {
    try {
      const response = await fetch('/api/supplements/ozon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          search_terms: supplements.map(s => s.name)
        })
      });

      const data = await response.json();
      return data.items?.map((product: any) => ({
        name: product.title,
        url: `https://ozon.ru/product/${product.id}/?partner=eva`,
        price: product.price,
        store: 'OZON',
        inStock: product.stock > 0,
        rating: product.rating,
        reviews: product.reviews
      })) || [];
    } catch (error) {
      console.error('Ошибка получения ссылок OZON:', error);
      return [];
    }
  }

  static async getAllSupplementLinks(supplements: SupplementRecommendation[]): Promise<ProductLink[]> {
    const [iherbLinks, aptekaLinks, ozonLinks] = await Promise.all([
      this.getIHerbLinks(supplements),
      this.getAptekaLinks(supplements),
      this.getOzonLinks(supplements)
    ]);

    return [...iherbLinks, ...aptekaLinks, ...ozonLinks];
  }
}

// Трекеры калорий
export class CalorieTrackers {
  static async syncWithMyFitnessPal(userId: string, accessToken: string): Promise<NutritionData | null> {
    try {
      const response = await fetch('/api/trackers/myfitnesspal/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          user_id: userId,
          date: new Date().toISOString().split('T')[0]
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка синхронизации с MyFitnessPal');
      }

      const data = await response.json();
      return {
        calories: data.summary.calories,
        protein: data.summary.protein,
        carbs: data.summary.carbohydrates,
        fat: data.summary.fat,
        fiber: data.summary.fiber,
        date: data.date,
        meals: data.meals?.map((meal: any) => ({
          name: meal.name,
          calories: meal.calories,
          time: meal.time
        })) || []
      };
    } catch (error) {
      console.error('Ошибка синхронизации с MyFitnessPal:', error);
      return null;
    }
  }

  static async syncWithFatSecret(userId: string, accessToken: string): Promise<NutritionData | null> {
    try {
      const response = await fetch('/api/trackers/fatsecret/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          user_id: userId,
          date: new Date().toISOString().split('T')[0]
        })
      });

      const data = await response.json();
      return {
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        fiber: data.fiber,
        date: data.date,
        meals: data.food_entries?.map((entry: any) => ({
          name: entry.food_entry_name,
          calories: entry.calories,
          time: entry.date_int
        })) || []
      };
    } catch (error) {
      console.error('Ошибка синхронизации с FatSecret:', error);
      return null;
    }
  }

  static async syncWithCronometer(userId: string, accessToken: string): Promise<NutritionData | null> {
    try {
      const response = await fetch('/api/trackers/cronometer/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          user_id: userId,
          date: new Date().toISOString().split('T')[0]
        })
      });

      const data = await response.json();
      return {
        calories: data.energy,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        fiber: data.fiber,
        date: data.date,
        meals: data.diary_entries?.map((entry: any) => ({
          name: entry.food.name,
          calories: entry.energy,
          time: entry.timestamp
        })) || []
      };
    } catch (error) {
      console.error('Ошибка синхронизации с Cronometer:', error);
      return null;
    }
  }
}

// Интеграция с рецептами
export class RecipeServices {
  static async searchRecipes(query: string, dietaryRestrictions: string[] = []): Promise<any[]> {
    try {
      const response = await fetch('/api/recipes/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          dietary_restrictions: dietaryRestrictions,
          menopause_friendly: true
        })
      });

      const data = await response.json();
      return data.recipes || [];
    } catch (error) {
      console.error('Ошибка поиска рецептов:', error);
      return [];
    }
  }

  static async getRecipeNutrition(recipeId: string): Promise<NutritionData | null> {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/nutrition`);
      const data = await response.json();
      
      return {
        calories: data.nutrition.calories,
        protein: data.nutrition.protein,
        carbs: data.nutrition.carbs,
        fat: data.nutrition.fat,
        fiber: data.nutrition.fiber,
        date: new Date().toISOString().split('T')[0],
        meals: []
      };
    } catch (error) {
      console.error('Ошибка получения пищевой ценности рецепта:', error);
      return null;
    }
  }
}

// Утилиты для работы с интеграциями
export class IntegrationUtils {
  static async testConnection(service: string, credentials: any): Promise<boolean> {
    try {
      const response = await fetch(`/api/integrations/${service}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      return response.ok;
    } catch (error) {
      console.error(`Ошибка тестирования подключения к ${service}:`, error);
      return false;
    }
  }

  static async saveCredentials(service: string, credentials: any): Promise<boolean> {
    try {
      const response = await fetch(`/api/integrations/${service}/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      return response.ok;
    } catch (error) {
      console.error(`Ошибка сохранения учетных данных для ${service}:`, error);
      return false;
    }
  }

  static async getAvailableServices(): Promise<string[]> {
    try {
      const response = await fetch('/api/integrations/available');
      const data = await response.json();
      return data.services || [];
    } catch (error) {
      console.error('Ошибка получения доступных сервисов:', error);
      return [];
    }
  }
}