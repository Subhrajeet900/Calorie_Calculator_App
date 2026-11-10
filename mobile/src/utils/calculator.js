/**
 * Mifflin-St Jeor Calorie & Macro Engine
 * Men:   10 x kg + 6.25 x cm - 5 x age + 5
 * Women: 10 x kg + 6.25 x cm - 5 x age - 161
 */

export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise', factor: 1.2 },
  { id: 'light', label: 'Lightly Active', desc: 'Exercise 1-3 days/week', factor: 1.375 },
  { id: 'moderate', label: 'Moderately Active', desc: 'Exercise 3-5 days/week', factor: 1.55 },
  { id: 'active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week', factor: 1.725 },
  { id: 'very_active', label: 'Extremely Active', desc: 'Hard physical job / 2x training', factor: 1.9 },
];

export const GOALS = [
  { id: 'lose', label: 'Lose Weight', delta: -500, desc: '-500 kcal / day (steady fat loss)' },
  { id: 'maintain', label: 'Maintain Weight', delta: 0, desc: 'Balance energy in and out' },
  { id: 'gain', label: 'Gain Muscle', delta: 300, desc: '+300 kcal / day (lean mass growth)' },
];

export function calculateBMR(gender, weightKg, heightCm, age) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender?.toLowerCase() === 'female' ? base - 161 : base + 5;
}

export function calculateTDEE(bmr, activityLevel) {
  const activity = ACTIVITY_LEVELS.find((a) => a.id === activityLevel) || ACTIVITY_LEVELS[2];
  return bmr * activity.factor;
}

export function adjustForGoal(tdee, goal) {
  const goalObj = GOALS.find((g) => g.id === goal) || GOALS[1];
  const target = tdee + goalObj.delta;
  return Math.max(1000, target);
}

export function calculateMacros(targetKcal) {
  // Protein: 30% (4 kcal/g)
  // Carbs: 45% (4 kcal/g)
  // Fat: 25% (9 kcal/g)
  const protein = (targetKcal * 0.3) / 4;
  const carbs = (targetKcal * 0.45) / 4;
  const fat = (targetKcal * 0.25) / 9;

  return {
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
  };
}

export function calculateAll({ age, gender, height, weight, activityLevel, goal }) {
  const bmr = calculateBMR(gender, Number(weight), Number(height), Number(age));
  const tdee = calculateTDEE(bmr, activityLevel);
  const targetKcal = adjustForGoal(tdee, goal);
  const macros = calculateMacros(targetKcal);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetKcal),
    targetProtein: macros.protein,
    targetCarbs: macros.carbs,
    targetFat: macros.fat,
  };
}

export function calculateItemNutrition(food, quantityGrams) {
  const ratio = (Number(quantityGrams) || 0) / 100;
  return {
    calories: Math.round((food.calories_per_100g || 0) * ratio * 10) / 10,
    protein: Math.round((food.protein_per_100g || 0) * ratio * 10) / 10,
    carbs: Math.round((food.carbs_per_100g || 0) * ratio * 10) / 10,
    fat: Math.round((food.fat_per_100g || 0) * ratio * 10) / 10,
  };
}

