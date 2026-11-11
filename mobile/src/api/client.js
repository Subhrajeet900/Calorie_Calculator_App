import { storage } from '../utils/storage';
import { calculateAll, calculateItemNutrition } from '../utils/calculator';
import { Platform } from 'react-native';

// Production Cloud Backend (Render):
const DEFAULT_HOST = 'https://calorie-calculator-app.onrender.com';

let currentServerUrl = `${DEFAULT_HOST}/api`;

export async function setApiBaseUrl(url) {
  let cleaned = url.trim().replace(/\/+$/, '');
  if (!cleaned.endsWith('/api')) {
    cleaned = `${cleaned}/api`;
  }
  currentServerUrl = cleaned;
  await storage.saveServerUrl(cleaned);
}

export async function getApiBaseUrl() {
  const saved = await storage.getServerUrl();
  if (saved) {
    currentServerUrl = saved;
  }
  return currentServerUrl;
}

// Built-in offline foods list for demo/offline fallback
const FALLBACK_FOODS = [
  { id: 1, name: 'Chicken Breast (Skinless)', category: 'Meat & Poultry', serving_unit: '100g', calories_per_100g: 165, protein_per_100g: 31.0, carbs_per_100g: 0.0, fat_per_100g: 3.6 },
  { id: 2, name: 'Whole Egg', category: 'Eggs & Dairy', serving_unit: 'large (50g)', calories_per_100g: 143, protein_per_100g: 12.6, carbs_per_100g: 0.7, fat_per_100g: 9.5 },
  { id: 3, name: 'Oatmeal / Rolled Oats', category: 'Grains & Breads', serving_unit: '100g', calories_per_100g: 389, protein_per_100g: 16.9, carbs_per_100g: 66.3, fat_per_100g: 6.9 },
  { id: 4, name: 'White Rice (Cooked)', category: 'Grains & Breads', serving_unit: '100g', calories_per_100g: 130, protein_per_100g: 2.7, carbs_per_100g: 28.2, fat_per_100g: 0.3 },
  { id: 5, name: 'Greek Yogurt (0% Fat)', category: 'Eggs & Dairy', serving_unit: '100g', calories_per_100g: 59, protein_per_100g: 10.0, carbs_per_100g: 3.6, fat_per_100g: 0.4 },
  { id: 6, name: 'Banana', category: 'Fruits', serving_unit: 'medium (118g)', calories_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 22.8, fat_per_100g: 0.3 },
  { id: 7, name: 'Almonds', category: 'Nuts & Seeds', serving_unit: 'handful (28g)', calories_per_100g: 579, protein_per_100g: 21.2, carbs_per_100g: 21.6, fat_per_100g: 49.9 },
  { id: 8, name: 'Salmon (Atlantic)', category: 'Seafood', serving_unit: '100g', calories_per_100g: 208, protein_per_100g: 20.4, carbs_per_100g: 0.0, fat_per_100g: 13.4 },
  { id: 9, name: 'Broccoli', category: 'Vegetables', serving_unit: '100g', calories_per_100g: 34, protein_per_100g: 2.8, carbs_per_100g: 7.0, fat_per_100g: 0.4 },
  { id: 10, name: 'Apple', category: 'Fruits', serving_unit: 'medium (180g)', calories_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 13.8, fat_per_100g: 0.2 },
  { id: 11, name: 'Peanut Butter', category: 'Nuts & Seeds', serving_unit: 'tbsp (16g)', calories_per_100g: 588, protein_per_100g: 25.1, carbs_per_100g: 20.0, fat_per_100g: 50.4 },
  { id: 12, name: 'Whey Protein Powder', category: 'Supplements', serving_unit: 'scoop (30g)', calories_per_100g: 400, protein_per_100g: 80.0, carbs_per_100g: 6.7, fat_per_100g: 5.0 },
];

let mockMeals = {};

async function request(path, options = {}) {
  await getApiBaseUrl();
  const token = await storage.getToken();

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${currentServerUrl}${path}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || `Request failed with status ${res.status}`);
    }
    return json.data;
  } catch (err) {
    console.log(`Backend API [${options.method || 'GET'} ${path}] note:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  async register(userData) {
    try {
      return await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (e) {
      // Local fallback for offline/demo
      const targets = calculateAll(userData);
      const mockUser = {
        id: 1,
        name: userData.name || 'Demo User',
        email: userData.email,
        ...userData,
        ...targets,
      };
      const mockToken = 'mock-demo-jwt-token';
      await storage.saveToken(mockToken);
      await storage.saveUser(mockUser);
      return { token: mockToken, user: mockUser };
    }
  },

  async login(credentials) {
    try {
      return await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch (e) {
      // Offline fallback
      const savedUser = await storage.getUser();
      if (savedUser) {
        return { token: 'mock-demo-jwt-token', user: savedUser };
      }
      throw e;
    }
  },

  // Calculate
  async calculate(params) {
    try {
      return await request('/calculate', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch (e) {
      return calculateAll(params);
    }
  },

  // User Profile
  async getProfile() {
    try {
      return await request('/user/profile');
    } catch (e) {
      const saved = await storage.getUser();
      return saved;
    }
  },

  async updateProfile(updates) {
    try {
      return await request('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (e) {
      const user = (await storage.getUser()) || {};
      const merged = { ...user, ...updates };
      const targets = calculateAll(merged);
      const updatedUser = { ...merged, ...targets };
      await storage.saveUser(updatedUser);
      return updatedUser;
    }
  },

  // Foods
  async searchFoods(query = '', category = '') {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (category && category !== 'All') params.append('category', category);
      return await request(`/foods?${params.toString()}`);
    } catch (e) {
      return FALLBACK_FOODS.filter((f) => {
        const matchesQuery = !query || f.name.toLowerCase().includes(query.toLowerCase());
        const matchesCat = !category || category === 'All' || f.category === category;
        return matchesQuery && matchesCat;
      });
    }
  },

  async createCustomFood(food) {
    try {
      return await request('/foods', {
        method: 'POST',
        body: JSON.stringify(food),
      });
    } catch (e) {
      const newFood = {
        id: Date.now(),
        ...food,
        is_custom: true,
      };
      FALLBACK_FOODS.unshift(newFood);
      return newFood;
    }
  },

  // Meals
  async getMealsForDay(date) {
    try {
      return await request(`/meals?date=${date}`);
    } catch (e) {
      // Compute offline day summary
      const user = (await storage.getUser()) || {
        target_calories: 2000,
        target_protein: 150,
        target_carbs: 225,
        target_fat: 55.6,
      };

      const dayMeals = mockMeals[date] || [];
      let totalKcal = 0;
      let totalProt = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      const mealTotals = {
        breakfast: { calories: 0, protein: 0, carbs: 0, fat: 0, item_count: 0 },
        lunch: { calories: 0, protein: 0, carbs: 0, fat: 0, item_count: 0 },
        dinner: { calories: 0, protein: 0, carbs: 0, fat: 0, item_count: 0 },
        snack: { calories: 0, protein: 0, carbs: 0, fat: 0, item_count: 0 },
      };

      for (const m of dayMeals) {
        const type = m.meal_type;
        for (const item of m.items) {
          totalKcal += item.calories;
          totalProt += item.protein;
          totalCarbs += item.carbs;
          totalFat += item.fat;

          if (mealTotals[type]) {
            mealTotals[type].calories += item.calories;
            mealTotals[type].protein += item.protein;
            mealTotals[type].carbs += item.carbs;
            mealTotals[type].fat += item.fat;
            mealTotals[type].item_count += 1;
          }
        }
      }

      return {
        date,
        target_calories: user.target_calories || user.targetCalories || 2000,
        target_protein: user.target_protein || user.targetProtein || 150,
        target_carbs: user.target_carbs || user.targetCarbs || 225,
        target_fat: user.target_fat || user.targetFat || 55.6,
        total_calories: Math.round(totalKcal * 10) / 10,
        total_protein: Math.round(totalProt * 10) / 10,
        total_carbs: Math.round(totalCarbs * 10) / 10,
        total_fat: Math.round(totalFat * 10) / 10,
        remaining_calories: Math.round(((user.target_calories || 2000) - totalKcal) * 10) / 10,
        remaining_protein: Math.round(((user.target_protein || 150) - totalProt) * 10) / 10,
        remaining_carbs: Math.round(((user.target_carbs || 225) - totalCarbs) * 10) / 10,
        remaining_fat: Math.round(((user.target_fat || 55.6) - totalFat) * 10) / 10,
        meals: dayMeals,
        meal_totals: mealTotals,
      };
    }
  },

  async logMeal({ meal_type, date, items }) {
    try {
      return await request('/meals', {
        method: 'POST',
        body: JSON.stringify({ meal_type, date, items }),
      });
    } catch (e) {
      if (!mockMeals[date]) mockMeals[date] = [];

      let meal = mockMeals[date].find((m) => m.meal_type === meal_type);
      if (!meal) {
        meal = {
          id: Date.now(),
          meal_type,
          date,
          items: [],
        };
        mockMeals[date].push(meal);
      }

      for (const itemInput of items) {
        const food = FALLBACK_FOODS.find((f) => f.id === itemInput.food_id) || {
          name: 'Custom Food',
          calories_per_100g: 100,
          protein_per_100g: 10,
          carbs_per_100g: 10,
          fat_per_100g: 2,
        };
        const nutrition = calculateItemNutrition(food, itemInput.quantity);
        meal.items.push({
          id: Date.now() + Math.random(),
          meal_id: meal.id,
          food_id: itemInput.food_id,
          food,
          quantity: itemInput.quantity,
          ...nutrition,
        });
      }

      return meal;
    }
  },

  async deleteMeal(mealId) {
    try {
      return await request(`/meals/${mealId}`, { method: 'DELETE' });
    } catch (e) {
      for (const date in mockMeals) {
        mockMeals[date] = mockMeals[date].filter((m) => m.id !== Number(mealId));
      }
      return { success: true };
    }
  },

  async deleteMealItem(itemId) {
    try {
      return await request(`/meals/items/${itemId}`, { method: 'DELETE' });
    } catch (e) {
      for (const date in mockMeals) {
        for (const m of mockMeals[date]) {
          m.items = m.items.filter((item) => item.id !== Number(itemId));
        }
      }
      return { success: true };
    }
  },

  // Progress
  async getWeeklyProgress(date) {
    try {
      return await request(`/progress/week?date=${date}`);
    } catch (e) {
      const user = (await storage.getUser()) || { target_calories: 2000 };
      const target = user.target_calories || 2000;
      const days = [];
      const now = new Date(date || Date.now());

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

        const dayMeals = mockMeals[dStr] || [];
        let dayKcal = 0;
        let dayProt = 0;
        let dayCarbs = 0;
        let dayFat = 0;

        for (const m of dayMeals) {
          for (const item of m.items) {
            dayKcal += item.calories;
            dayProt += item.protein;
            dayCarbs += item.carbs;
            dayFat += item.fat;
          }
        }

        days.push({
          date: dStr,
          day_name: dayName,
          target_kcal: target,
          consumed_kcal: Math.round(dayKcal),
          consumed_prot: Math.round(dayProt),
          consumed_carbs: Math.round(dayCarbs),
          consumed_fat: Math.round(dayFat),
          percentage: target > 0 ? Math.round((dayKcal / target) * 100) : 0,
          is_logged: dayMeals.length > 0,
        });
      }

      return {
        days,
        target_daily_kcal: target,
        average_daily_kcal: target,
        total_weekly_kcal: target * 7,
        days_logged: days.filter((d) => d.is_logged).length,
        weekly_deficit: 0,
        average_protein: 140,
        average_carbs: 210,
        average_fat: 50,
      };
    }
  },
};

