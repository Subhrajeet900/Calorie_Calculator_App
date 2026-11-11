import { storage } from '../utils/storage';
import { calculateAll, calculateItemNutrition, getLocalDateStr } from '../utils/calculator';
import { DEFAULT_FOODS } from '../constants/defaultFoods';

// Production Cloud Backend (Render):
const DEFAULT_HOST = 'https://calorie-calculator-app.onrender.com';

let currentServerUrl = `${DEFAULT_HOST}/api`;
let syncInProgress = false;

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

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isLocalOnlyToken(token) {
  return !token || token === 'local-offline-token' || token === 'mock-demo-token' || token === 'mock-demo-jwt-token';
}

async function request(path, options = {}, timeoutMs = 55000) {
  await getApiBaseUrl();
  const token = await storage.getToken();

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token && !isLocalOnlyToken(token) ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${currentServerUrl}${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    let json = {};
    try {
      json = await res.json();
    } catch {
      json = {};
    }

    if (!res.ok) {
      const err = new Error(json.error || `Request failed with status ${res.status}`);
      err.status = res.status;
      err.isNetwork = false;
      throw err;
    }
    return json.data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.isNetwork === undefined) {
      err.isNetwork = true;
    }
    console.log(`Backend API [${options.method || 'GET'} ${path}] note:`, err.message);
    throw err;
  }
}

async function getAllKnownFoods(userEmail) {
  const cached = await storage.getFoodsCache();
  const custom = await storage.getCustomFoods(userEmail);

  // Merge DEFAULT_FOODS + cached server foods + custom foods deduplicated by lowercase name
  const byName = new Map();
  for (const f of DEFAULT_FOODS) {
    byName.set(f.name.toLowerCase(), f);
  }
  for (const f of cached) {
    if (f?.name) {
      byName.set(f.name.toLowerCase(), f);
    }
  }
  for (const f of custom) {
    if (f?.name) {
      byName.set(f.name.toLowerCase(), f);
    }
  }
  return Array.from(byName.values());
}

function buildDaySummary(date, dayMeals, user) {
  const safeMeals = Array.isArray(dayMeals) ? dayMeals : [];
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

  for (const m of safeMeals) {
    const type = String(m.meal_type || '').toLowerCase();
    for (const item of m.items || []) {
      const cals = Number(item.calories) || 0;
      const prot = Number(item.protein) || 0;
      const carbs = Number(item.carbs) || 0;
      const fat = Number(item.fat) || 0;

      totalKcal += cals;
      totalProt += prot;
      totalCarbs += carbs;
      totalFat += fat;

      if (mealTotals[type]) {
        mealTotals[type].calories += cals;
        mealTotals[type].protein += prot;
        mealTotals[type].carbs += carbs;
        mealTotals[type].fat += fat;
        mealTotals[type].item_count += 1;
      }
    }
  }

  for (const key of Object.keys(mealTotals)) {
    mealTotals[key].calories = Math.round(mealTotals[key].calories * 10) / 10;
    mealTotals[key].protein = Math.round(mealTotals[key].protein * 10) / 10;
    mealTotals[key].carbs = Math.round(mealTotals[key].carbs * 10) / 10;
    mealTotals[key].fat = Math.round(mealTotals[key].fat * 10) / 10;
  }

  const targetCal = Number(user?.target_calories || user?.targetCalories) || 2000;
  const targetProt = Number(user?.target_protein || user?.targetProtein) || 150;
  const targetCarbs = Number(user?.target_carbs || user?.targetCarbs) || 225;
  const targetFat = Number(user?.target_fat || user?.targetFat) || 55.6;

  return {
    date,
    target_calories: targetCal,
    target_protein: targetProt,
    target_carbs: targetCarbs,
    target_fat: targetFat,
    total_calories: Math.round(totalKcal * 10) / 10,
    total_protein: Math.round(totalProt * 10) / 10,
    total_carbs: Math.round(totalCarbs * 10) / 10,
    total_fat: Math.round(totalFat * 10) / 10,
    remaining_calories: Math.round((targetCal - totalKcal) * 10) / 10,
    remaining_protein: Math.round((targetProt - totalProt) * 10) / 10,
    remaining_carbs: Math.round((targetCarbs - totalCarbs) * 10) / 10,
    remaining_fat: Math.round((targetFat - totalFat) * 10) / 10,
    meals: safeMeals,
    meal_totals: mealTotals,
  };
}

/**
 * Ensures backend has the current account & valid JWT (for instance if Render ephemeral
 * SQLite container restarted or user registered offline). Returns true if online auth works.
 */
async function ensureServerSession(user) {
  if (!user?.email || user.email === 'alex@example.com') return false;
  const email = normalizeEmail(user.email);
  const acct = await storage.getAccountRecord(email);
  if (!acct?.password) return false;

  // Try login first
  try {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: acct.password }),
    }, 30000);
    if (res?.token) {
      await storage.saveToken(res.token);
      await storage.saveUser(res.user);
      await storage.saveAccountRecord(email, {
        user: res.user,
        token: res.token,
        synced: true,
      });
      return true;
    }
  } catch (loginErr) {
    if (loginErr.isNetwork) return false;

    // If Render returned 401/404 because ephemeral SQLite wiped, re-register silently
    if (loginErr.status === 401 || loginErr.status === 404) {
      try {
        const regRes = await request('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: user.name || acct.user?.name || 'User',
            email,
            password: acct.password,
            age: Number(user.age) || 25,
            gender: user.gender || 'male',
            height: Number(user.height) || 175,
            weight: Number(user.weight) || 70,
            activity_level: user.activity_level || 'moderate',
            goal: user.goal || 'maintain',
          }),
        }, 30000);
        if (regRes?.token) {
          await storage.saveToken(regRes.token);
          await storage.saveUser(regRes.user);
          await storage.saveAccountRecord(email, {
            user: regRes.user,
            token: regRes.token,
            synced: true,
          });
          // Mark all local meals as needing sync so we push them to restored server DB
          const allMeals = await storage.getAllMeals(email);
          let changed = false;
          for (const d of Object.keys(allMeals)) {
            for (const m of allMeals[d] || []) {
              for (const item of m.items || []) {
                item.pendingSync = true;
                changed = true;
              }
            }
          }
          if (changed) {
            await storage.saveAllMeals(email, allMeals);
          }
          return true;
        }
      } catch {
        return false;
      }
    }
  }
  return false;
}

/**
 * Resolves a local food object to the live server's food_id (by matching name) so
 * syncing offline items always maps to the correct DB food row.
 */
async function resolveServerFoodId(item, serverFoods) {
  const foodName = item.food?.name?.trim().toLowerCase();
  if (foodName && Array.isArray(serverFoods) && serverFoods.length > 0) {
    const match = serverFoods.find((f) => f.name?.trim().toLowerCase() === foodName);
    if (match) return match.id;
  }
  return item.food_id || item.food?.id;
}

/**
 * Uploads any pendingSync meal items for the user in the background.
 */
async function syncPendingMeals(userEmail) {
  if (syncInProgress || !userEmail) return;
  syncInProgress = true;
  try {
    const allMeals = await storage.getAllMeals(userEmail);
    const pendingEntries = [];
    for (const date of Object.keys(allMeals)) {
      for (const meal of allMeals[date] || []) {
        for (const item of meal.items || []) {
          if (item.pendingSync) {
            pendingEntries.push({ date, meal, item });
          }
        }
      }
    }
    if (pendingEntries.length === 0) return;

    // Ensure server catalog is cached to match IDs cleanly
    let serverFoods = await storage.getFoodsCache();
    try {
      const fetched = await request('/foods', {}, 25000);
      if (Array.isArray(fetched) && fetched.length > 0) {
        serverFoods = fetched;
        await storage.saveFoodsCache(fetched);
      }
    } catch {
      return;
    }

    let updated = false;
    for (const entry of pendingEntries) {
      const { date, meal, item } = entry;
      try {
        const foodId = await resolveServerFoodId(item, serverFoods);
        if (!foodId) continue;

        const serverMeal = await request('/meals', {
          method: 'POST',
          body: JSON.stringify({
            meal_type: meal.meal_type,
            date,
            items: [{ food_id: foodId, quantity: Number(item.quantity) || 100 }],
          }),
        }, 20000);

        item.pendingSync = false;
        if (serverMeal?.id) {
          meal.id = serverMeal.id;
          const matchingServerItem = (serverMeal.items || []).find(
            (si) =>
              Math.abs((Number(si.quantity) || 0) - (Number(item.quantity) || 0)) < 0.1 &&
              (!item.food?.name || si.food?.name?.toLowerCase() === item.food.name.toLowerCase())
          );
          if (matchingServerItem?.id) {
            item.id = matchingServerItem.id;
            item.meal_id = serverMeal.id;
          }
        }
        updated = true;
      } catch {
        // Keep pendingSync=true for next retry
      }
    }

    if (updated) {
      await storage.saveAllMeals(userEmail, allMeals);
    }
  } finally {
    syncInProgress = false;
  }
}

export const api = {
  // Warm up cloud backend + prefetch catalog on app launch
  async wakeServer() {
    try {
      await request('/health', {}, 60000);
      const serverFoods = await request('/foods', {}, 20000);
      if (Array.isArray(serverFoods) && serverFoods.length > 0) {
        await storage.saveFoodsCache(serverFoods);
      }
      const user = await storage.getUser();
      if (user?.email && user.email !== 'alex@example.com') {
        const token = await storage.getToken();
        if (isLocalOnlyToken(token)) {
          await ensureServerSession(user);
        }
        await syncPendingMeals(user.email);
      }
    } catch {
      // Non-fatal; app works smoothly from local AsyncStorage
    }
  },

  // Auth
  async register(userData) {
    const email = normalizeEmail(userData.email);
    const cleanPayload = {
      ...userData,
      email,
      name: String(userData.name || 'User').trim(),
    };

    try {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(cleanPayload),
      }, 60000);

      if (res?.token) await storage.saveToken(res.token);
      if (res?.user) await storage.saveUser(res.user);
      await storage.saveAccountRecord(email, {
        email,
        password: userData.password,
        user: res.user,
        token: res.token,
        synced: true,
      });
      return res;
    } catch (e) {
      // If email is already registered on server, surface error unless offline
      if (!e.isNetwork) {
        if (e.message?.toLowerCase().includes('already registered')) {
          // Try logging in automatically if same password works
          try {
            return await api.login({ email, password: userData.password });
          } catch {
            throw new Error('This email is already registered. Please Sign In with your password.');
          }
        }
        throw e;
      }

      // Network unreachable / timeout: allow offline registration and save permanently on device
      const targets = calculateAll(cleanPayload);
      const localUser = {
        id: Date.now(),
        name: cleanPayload.name,
        email,
        age: Number(cleanPayload.age) || 25,
        gender: cleanPayload.gender || 'male',
        height: Number(cleanPayload.height) || 175,
        weight: Number(cleanPayload.weight) || 70,
        activity_level: cleanPayload.activity_level || 'moderate',
        goal: cleanPayload.goal || 'maintain',
        ...targets,
      };
      const localToken = 'local-offline-token';
      await storage.saveToken(localToken);
      await storage.saveUser(localUser);
      await storage.saveAccountRecord(email, {
        email,
        password: userData.password,
        user: localUser,
        token: localToken,
        synced: false,
      });
      return { token: localToken, user: localUser };
    }
  },

  async login(credentials) {
    const email = normalizeEmail(credentials.email);
    const password = credentials.password || '';

    try {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }, 60000);

      if (res?.token) await storage.saveToken(res.token);
      if (res?.user) await storage.saveUser(res.user);
      await storage.saveAccountRecord(email, {
        email,
        password,
        user: res.user,
        token: res.token,
        synced: true,
      });
      syncPendingMeals(email);
      return res;
    } catch (e) {
      // Check persistent local account registry (handles offline mode AND ephemeral server resets)
      const localAcct = await storage.getAccountRecord(email);
      if (localAcct && localAcct.password === password) {
        const localUser = localAcct.user;

        // If server returned 401 (e.g. Render SQLite reset after spin-down), silently re-create on server
        if (!e.isNetwork && e.status === 401 && localUser) {
          try {
            const restored = await request('/auth/register', {
              method: 'POST',
              body: JSON.stringify({
                name: localUser.name || 'User',
                email,
                password,
                age: Number(localUser.age) || 25,
                gender: localUser.gender || 'male',
                height: Number(localUser.height) || 175,
                weight: Number(localUser.weight) || 70,
                activity_level: localUser.activity_level || 'moderate',
                goal: localUser.goal || 'maintain',
              }),
            }, 30000);

            if (restored?.token) {
              await storage.saveToken(restored.token);
              await storage.saveUser(restored.user);
              await storage.saveAccountRecord(email, {
                email,
                password,
                user: restored.user,
                token: restored.token,
                synced: true,
              });
              // Mark existing local meals pending so they upload to fresh server DB
              const allMeals = await storage.getAllMeals(email);
              for (const d of Object.keys(allMeals)) {
                for (const m of allMeals[d] || []) {
                  for (const item of m.items || []) {
                    item.pendingSync = true;
                  }
                }
              }
              await storage.saveAllMeals(email, allMeals);
              syncPendingMeals(email);
              return restored;
            }
          } catch {
            // Continue with local persistent session
          }
        }

        const offlineToken = localAcct.token || 'local-offline-token';
        await storage.saveToken(offlineToken);
        await storage.saveUser(localUser);
        return { token: offlineToken, user: localUser };
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
      }, 15000);
    } catch {
      return calculateAll(params);
    }
  },

  // User Profile
  async getProfile() {
    try {
      const profile = await request('/user/profile', {}, 15000);
      if (profile) {
        await storage.saveUser(profile);
        if (profile.email) {
          await storage.saveAccountRecord(profile.email, { user: profile });
        }
      }
      return profile;
    } catch {
      return await storage.getUser();
    }
  },

  async updateProfile(updates) {
    const current = (await storage.getUser()) || {};
    try {
      const updated = await request('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      }, 25000);
      await storage.saveUser(updated);
      if (updated?.email) {
        await storage.saveAccountRecord(updated.email, { user: updated });
      }
      return updated;
    } catch (e) {
      if ((e.status === 401 || e.status === 404) && current?.email) {
        const recovered = await ensureServerSession({ ...current, ...updates });
        if (recovered) {
          try {
            const retried = await request('/user/profile', {
              method: 'PUT',
              body: JSON.stringify(updates),
            }, 25000);
            await storage.saveUser(retried);
            return retried;
          } catch {}
        }
      }

      const merged = { ...current, ...updates };
      const targets = calculateAll(merged);
      const updatedUser = { ...merged, ...targets };
      await storage.saveUser(updatedUser);
      if (updatedUser.email) {
        await storage.saveAccountRecord(updatedUser.email, { user: updatedUser });
      }
      return updatedUser;
    }
  },

  // Foods
  async searchFoods(query = '', category = '') {
    const user = await storage.getUser();
    const userEmail = user?.email || 'guest';

    let serverList = [];
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (category && category !== 'All') params.append('category', category);
      const res = await request(`/foods?${params.toString()}`, {}, 12000);
      if (Array.isArray(res)) {
        serverList = res;
        // Cache complete catalog when fetching unfiltered list
        if (!query && (!category || category === 'All')) {
          await storage.saveFoodsCache(res);
        }
      }
    } catch {
      // Fallback gracefully to rich local catalog
    }

    if (serverList.length > 0) {
      // Also append any unsynced local custom foods matching filter
      const custom = await storage.getCustomFoods(userEmail);
      const serverNames = new Set(serverList.map((f) => f.name?.toLowerCase()));
      const matchingLocalCustom = custom.filter((f) => {
        if (serverNames.has(f.name?.toLowerCase())) return false;
        const matchesQ = !query || f.name?.toLowerCase().includes(query.toLowerCase());
        const matchesC = !category || category === 'All' || f.category === category;
        return matchesQ && matchesC;
      });
      return [...matchingLocalCustom, ...serverList];
    }

    const allKnown = await getAllKnownFoods(userEmail);
    return allKnown
      .filter((f) => {
        const matchesQuery = !query || f.name.toLowerCase().includes(query.toLowerCase());
        const matchesCat = !category || category === 'All' || f.category === category;
        return matchesQuery && matchesCat;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async createCustomFood(food) {
    const user = await storage.getUser();
    const userEmail = user?.email || 'guest';

    try {
      const created = await request('/foods', {
        method: 'POST',
        body: JSON.stringify(food),
      }, 20000);
      await storage.addCustomFood(userEmail, created);
      return created;
    } catch {
      const newFood = {
        id: Date.now(),
        ...food,
        is_custom: true,
      };
      await storage.addCustomFood(userEmail, newFood);
      return newFood;
    }
  },

  // Fast local-first day read for instantaneous UI on reopen
  async getCachedMealsForDay(date) {
    const user = await storage.getUser();
    const userEmail = user?.email || 'guest';
    const localMeals = await storage.getMealsForDate(userEmail, date);
    return buildDaySummary(date, localMeals, user);
  },

  // Meals
  async getMealsForDay(date) {
    const user = await storage.getUser();
    const userEmail = user?.email || 'guest';
    const token = await storage.getToken();
    const localMeals = await storage.getMealsForDate(userEmail, date);

    if (isLocalOnlyToken(token) && user?.email && user.email !== 'alex@example.com') {
      await ensureServerSession(user);
    }

    try {
      const serverSummary = await request(`/meals?date=${date}`, {}, 20000);
      const serverMeals = Array.isArray(serverSummary?.meals) ? serverSummary.meals : [];

      // Collect pending offline items for this date that haven't synced yet
      const pendingByType = {};
      let hasAnyLocalItems = false;
      for (const m of localMeals) {
        if ((m.items || []).length > 0) hasAnyLocalItems = true;
        const pendingItems = (m.items || []).filter((it) => it.pendingSync);
        if (pendingItems.length > 0) {
          pendingByType[m.meal_type] = pendingItems;
        }
      }

      if (serverMeals.length === 0 && hasAnyLocalItems) {
        // Server DB has no meals for this date (e.g., Render SQLite reset or pending offline logs)
        // Preserve local persisted meals and push them back up to server
        for (const m of localMeals) {
          for (const it of m.items || []) {
            it.pendingSync = true;
          }
        }
        await storage.saveMealsForDate(userEmail, date, localMeals);
        syncPendingMeals(userEmail);
        return buildDaySummary(date, localMeals, user);
      }

      // Merge server meals with any unsynced local items
      const mergedMeals = [...serverMeals];
      for (const mType of Object.keys(pendingByType)) {
        let existingMeal = mergedMeals.find((m) => m.meal_type === mType);
        if (!existingMeal) {
          existingMeal = {
            id: Date.now(),
            meal_type: mType,
            date,
            items: [],
          };
          mergedMeals.push(existingMeal);
        }
        for (const pItem of pendingByType[mType]) {
          const alreadyOnServer = existingMeal.items.some(
            (sItem) =>
              sItem.food?.name?.toLowerCase() === pItem.food?.name?.toLowerCase() &&
              Math.abs((Number(sItem.quantity) || 0) - (Number(pItem.quantity) || 0)) < 0.1
          );
          if (!alreadyOnServer) {
            existingMeal.items.push(pItem);
          }
        }
      }

      await storage.saveMealsForDate(userEmail, date, mergedMeals);
      if (Object.keys(pendingByType).length > 0) {
        syncPendingMeals(userEmail);
      }
      return buildDaySummary(date, mergedMeals, user);
    } catch (e) {
      if ((e.status === 401 || e.status === 404) && user?.email && user.email !== 'alex@example.com') {
        ensureServerSession(user).then((ok) => {
          if (ok) syncPendingMeals(userEmail);
        });
      }
      return buildDaySummary(date, localMeals, user);
    }
  },

  async logMeal({ meal_type, date, items }) {
    const user = await storage.getUser();
    const userEmail = user?.email || 'guest';
    const allKnownFoods = await getAllKnownFoods(userEmail);

    // 1. Resolve full food metadata so food names are ALWAYS preserved accurately
    const dayMeals = await storage.getMealsForDate(userEmail, date);
    let meal = dayMeals.find((m) => m.meal_type === meal_type);
    if (!meal) {
      meal = {
        id: Date.now(),
        meal_type,
        date,
        items: [],
      };
      dayMeals.push(meal);
    }

    const addedLocalItems = [];
    for (const itemInput of items) {
      const resolvedFood =
        itemInput.food ||
        allKnownFoods.find((f) => f.id === itemInput.food_id) ||
        allKnownFoods.find(
          (f) => itemInput.food_name && f.name?.toLowerCase() === itemInput.food_name.toLowerCase()
        ) || {
          id: itemInput.food_id,
          name: itemInput.food_name || 'Logged Food',
          serving_unit: '100g',
          serving_size: 100,
          calories_per_100g: 100,
          protein_per_100g: 10,
          carbs_per_100g: 10,
          fat_per_100g: 2,
        };

      const qtyGrams = Number(itemInput.quantity) || 100;
      const nutrition = calculateItemNutrition(resolvedFood, qtyGrams);
      const newItem = {
        id: Date.now() + Math.floor(Math.random() * 10000),
        meal_id: meal.id,
        food_id: resolvedFood.id || itemInput.food_id,
        food: resolvedFood,
        quantity: qtyGrams,
        ...nutrition,
        pendingSync: true,
      };
      meal.items.push(newItem);
      addedLocalItems.push(newItem);
    }

    // 2. Persist immediately to AsyncStorage BEFORE hitting network
    await storage.saveMealsForDate(userEmail, date, dayMeals);

    // 3. Best-effort immediate server sync (with up to 12s wait so UI stays snappy)
    try {
      const cachedServerFoods = await storage.getFoodsCache();
      const serverPayloadItems = [];
      for (const itemInput of items) {
        const localFood = itemInput.food || allKnownFoods.find((f) => f.id === itemInput.food_id);
        const serverFoodId = await resolveServerFoodId(
          { food_id: itemInput.food_id, food: localFood },
          cachedServerFoods
        );
        serverPayloadItems.push({
          food_id: serverFoodId,
          quantity: Number(itemInput.quantity) || 100,
        });
      }

      const serverMeal = await request(
        '/meals',
        {
          method: 'POST',
          body: JSON.stringify({
            meal_type,
            date,
            items: serverPayloadItems,
          }),
        },
        12000
      );

      if (serverMeal?.items) {
        // Update stored items with authoritative server IDs while keeping local food display intact
        meal.id = serverMeal.id;
        for (const localItem of addedLocalItems) {
          localItem.pendingSync = false;
          const match = serverMeal.items.find(
            (si) =>
              Math.abs((Number(si.quantity) || 0) - (Number(localItem.quantity) || 0)) < 0.1 &&
              (!localItem.food?.name ||
                si.food?.name?.toLowerCase() === localItem.food.name.toLowerCase())
          );
          if (match) {
            localItem.id = match.id;
            localItem.meal_id = serverMeal.id;
            if (match.food?.name) {
              localItem.food = match.food;
            }
          }
        }
        await storage.saveMealsForDate(userEmail, date, dayMeals);
      }
    } catch (e) {
      if ((e.status === 401 || e.status === 404) && user?.email && user.email !== 'alex@example.com') {
        ensureServerSession(user).then((ok) => {
          if (ok) syncPendingMeals(userEmail);
        });
      }
      // Keep saved locally with pendingSync: true so it never vanishes
    }

    return meal;
  },

  async deleteMeal(mealId) {
    const user = await storage.getUser();
    const userEmail = user?.email || 'guest';
    const allMeals = await storage.getAllMeals(userEmail);
    for (const date of Object.keys(allMeals)) {
      allMeals[date] = (allMeals[date] || []).filter((m) => m.id !== Number(mealId));
    }
    await storage.saveAllMeals(userEmail, allMeals);

    try {
      return await request(`/meals/${mealId}`, { method: 'DELETE' }, 15000);
    } catch {
      return { success: true };
    }
  },

  async deleteMealItem(itemId) {
    const user = await storage.getUser();
    const userEmail = user?.email || 'guest';
    const allMeals = await storage.getAllMeals(userEmail);

    let wasPendingOnly = false;
    for (const date of Object.keys(allMeals)) {
      for (const m of allMeals[date] || []) {
        const target = (m.items || []).find((item) => item.id === Number(itemId));
        if (target?.pendingSync) wasPendingOnly = true;
        m.items = (m.items || []).filter((item) => item.id !== Number(itemId));
      }
      allMeals[date] = (allMeals[date] || []).filter((m) => (m.items || []).length > 0);
    }
    await storage.saveAllMeals(userEmail, allMeals);

    if (wasPendingOnly) {
      return { success: true };
    }

    try {
      return await request(`/meals/items/${itemId}`, { method: 'DELETE' }, 15000);
    } catch {
      return { success: true };
    }
  },

  // Progress
  async getWeeklyProgress(date) {
    const user = await storage.getUser();
    const userEmail = user?.email || 'guest';
    const target = Number(user?.target_calories || user?.targetCalories) || 2000;
    const endDateStr = date || getLocalDateStr();

    try {
      const serverProgress = await request(`/progress/week?date=${endDateStr}`, {}, 15000);
      if (serverProgress?.days_logged > 0) {
        return serverProgress;
      }
    } catch {
      // Fallback to persistent local AsyncStorage meals
    }

    const allMeals = await storage.getAllMeals(userEmail);
    const days = [];
    const baseDate = new Date(`${endDateStr}T12:00:00`);

    let totalWeeklyKcal = 0;
    let totalProt = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let daysLogged = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const dStr = getLocalDateStr(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayMeals = allMeals[dStr] || [];
      let dayKcal = 0;
      let dayProt = 0;
      let dayCarbs = 0;
      let dayFat = 0;

      for (const m of dayMeals) {
        for (const item of m.items || []) {
          dayKcal += Number(item.calories) || 0;
          dayProt += Number(item.protein) || 0;
          dayCarbs += Number(item.carbs) || 0;
          dayFat += Number(item.fat) || 0;
        }
      }

      const isLogged = dayMeals.some((m) => (m.items || []).length > 0);
      if (isLogged) {
        daysLogged += 1;
        totalWeeklyKcal += dayKcal;
        totalProt += dayProt;
        totalCarbs += dayCarbs;
        totalFat += dayFat;
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
        is_logged: isLogged,
      });
    }

    const avgDivisor = daysLogged > 0 ? daysLogged : 1;
    const avgKcal = daysLogged > 0 ? Math.round(totalWeeklyKcal / avgDivisor) : 0;

    return {
      days,
      target_daily_kcal: target,
      average_daily_kcal: avgKcal,
      total_weekly_kcal: Math.round(totalWeeklyKcal),
      days_logged: daysLogged,
      weekly_deficit: daysLogged > 0 ? Math.round(target * daysLogged - totalWeeklyKcal) : 0,
      average_protein: daysLogged > 0 ? Math.round((totalProt / avgDivisor) * 10) / 10 : 0,
      average_carbs: daysLogged > 0 ? Math.round((totalCarbs / avgDivisor) * 10) / 10 : 0,
      average_fat: daysLogged > 0 ? Math.round((totalFat / avgDivisor) * 10) / 10 : 0,
    };
  },

  async getConsistencyStats() {
    const user = await storage.getUser();
    const userEmail = user?.email || 'guest';
    const allMeals = await storage.getAllMeals(userEmail);
    const today = new Date();
    const flags = [];
    let activeDays = 0;

    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = getLocalDateStr(d);
      const dayMeals = allMeals[dStr] || [];
      const hasLog = dayMeals.some((m) => (m.items || []).length > 0);
      flags.push(hasLog);
      if (hasLog) activeDays += 1;
    }

    return { activeDays, matrixFlags: flags };
  },
};
