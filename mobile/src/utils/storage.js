import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@calorie_token';
const USER_KEY = '@calorie_user';
const SERVER_URL_KEY = '@calorie_server_url';
const ACCOUNTS_KEY = '@calorie_accounts_v1';
const MEALS_PREFIX = '@calorie_meals_v1_';
const FOODS_CACHE_KEY = '@calorie_foods_cache_v1';
const CUSTOM_FOODS_PREFIX = '@calorie_custom_foods_v1_';

function normalizeEmail(email) {
  return String(email || 'guest').trim().toLowerCase() || 'guest';
}

export const storage = {
  async saveToken(token) {
    try {
      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      } else {
        await AsyncStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.warn('Storage saveToken error:', e);
    }
  },

  async getToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Storage getToken error:', e);
      return null;
    }
  },

  async saveUser(user) {
    try {
      if (user) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(USER_KEY);
      }
    } catch (e) {
      console.warn('Storage saveUser error:', e);
    }
  },

  async getUser() {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Storage getUser error:', e);
      return null;
    }
  },

  async saveServerUrl(url) {
    try {
      await AsyncStorage.setItem(SERVER_URL_KEY, url);
    } catch (e) {
      console.warn('Storage saveServerUrl error:', e);
    }
  },

  async getServerUrl() {
    try {
      return await AsyncStorage.getItem(SERVER_URL_KEY);
    } catch (e) {
      console.warn('Storage getServerUrl error:', e);
      return null;
    }
  },

  // --- Persistent Multi-Account Registry (survives logout & server cold starts) ---
  async getAccounts() {
    try {
      const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('Storage getAccounts error:', e);
      return {};
    }
  },

  async saveAccountRecord(email, record) {
    try {
      const key = normalizeEmail(email);
      const accounts = await storage.getAccounts();
      accounts[key] = {
        ...(accounts[key] || {}),
        ...record,
        email: key,
        updatedAt: Date.now(),
      };
      await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      return accounts[key];
    } catch (e) {
      console.warn('Storage saveAccountRecord error:', e);
      return null;
    }
  },

  async getAccountRecord(email) {
    try {
      const key = normalizeEmail(email);
      const accounts = await storage.getAccounts();
      return accounts[key] || null;
    } catch (e) {
      return null;
    }
  },

  // --- Persistent Per-User Meals Map ({ [YYYY-MM-DD]: Meal[] }) ---
  async getAllMeals(email) {
    try {
      const key = `${MEALS_PREFIX}${normalizeEmail(email)}`;
      const raw = await AsyncStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('Storage getAllMeals error:', e);
      return {};
    }
  },

  async saveAllMeals(email, mealsByDate) {
    try {
      const key = `${MEALS_PREFIX}${normalizeEmail(email)}`;
      await AsyncStorage.setItem(key, JSON.stringify(mealsByDate || {}));
    } catch (e) {
      console.warn('Storage saveAllMeals error:', e);
    }
  },

  async getMealsForDate(email, date) {
    const all = await storage.getAllMeals(email);
    return Array.isArray(all[date]) ? all[date] : [];
  },

  async saveMealsForDate(email, date, dayMeals) {
    const all = await storage.getAllMeals(email);
    all[date] = Array.isArray(dayMeals) ? dayMeals : [];
    await storage.saveAllMeals(email, all);
  },

  // --- Foods Catalog & Custom Foods Cache ---
  async saveFoodsCache(foods) {
    try {
      if (Array.isArray(foods) && foods.length > 0) {
        await AsyncStorage.setItem(FOODS_CACHE_KEY, JSON.stringify(foods));
      }
    } catch (e) {
      console.warn('Storage saveFoodsCache error:', e);
    }
  },

  async getFoodsCache() {
    try {
      const raw = await AsyncStorage.getItem(FOODS_CACHE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  async getCustomFoods(email) {
    try {
      const key = `${CUSTOM_FOODS_PREFIX}${normalizeEmail(email)}`;
      const raw = await AsyncStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  async addCustomFood(email, food) {
    try {
      const key = `${CUSTOM_FOODS_PREFIX}${normalizeEmail(email)}`;
      const existing = await storage.getCustomFoods(email);
      const filtered = existing.filter(
        (f) => f.name?.toLowerCase() !== food.name?.toLowerCase()
      );
      filtered.unshift(food);
      await AsyncStorage.setItem(key, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Storage addCustomFood error:', e);
    }
  },

  // Clears ONLY the active login session so saved meals/accounts remain for sign-back-in
  async clearAll() {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (e) {
      console.warn('Storage clearAll error:', e);
    }
  },
};
