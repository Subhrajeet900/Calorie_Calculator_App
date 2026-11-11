// Full default catalog synced with backend seed.go for instant search & offline resilience
export const DEFAULT_FOODS = [
  // Meat & Poultry
  { id: 1, name: 'Chicken Breast (Skinless)', category: 'Meat & Poultry', serving_unit: '100g', serving_size: 100, calories_per_100g: 165, protein_per_100g: 31.0, carbs_per_100g: 0.0, fat_per_100g: 3.6 },
  { id: 2, name: 'Chicken Thigh (Skinless)', category: 'Meat & Poultry', serving_unit: '100g', serving_size: 100, calories_per_100g: 209, protein_per_100g: 26.0, carbs_per_100g: 0.0, fat_per_100g: 10.9 },
  { id: 3, name: 'Lean Beef (90/10)', category: 'Meat & Poultry', serving_unit: '100g', serving_size: 100, calories_per_100g: 217, protein_per_100g: 26.1, carbs_per_100g: 0.0, fat_per_100g: 11.8 },
  { id: 4, name: 'Pork Tenderloin', category: 'Meat & Poultry', serving_unit: '100g', serving_size: 100, calories_per_100g: 143, protein_per_100g: 26.0, carbs_per_100g: 0.0, fat_per_100g: 3.5 },
  { id: 5, name: 'Turkey Breast', category: 'Meat & Poultry', serving_unit: '100g', serving_size: 100, calories_per_100g: 135, protein_per_100g: 30.0, carbs_per_100g: 0.0, fat_per_100g: 1.0 },
  { id: 6, name: 'Chicken Drumstick / Leg', category: 'Meat & Poultry', serving_unit: 'piece (100g)', serving_size: 100, calories_per_100g: 172, protein_per_100g: 24.2, carbs_per_100g: 0.0, fat_per_100g: 7.5 },
  { id: 7, name: 'Mutton / Goat Meat (Lean)', category: 'Meat & Poultry', serving_unit: '100g', serving_size: 100, calories_per_100g: 143, protein_per_100g: 27.1, carbs_per_100g: 0.0, fat_per_100g: 3.0 },

  // Seafood
  { id: 8, name: 'Salmon (Atlantic)', category: 'Seafood', serving_unit: '100g', serving_size: 100, calories_per_100g: 208, protein_per_100g: 20.4, carbs_per_100g: 0.0, fat_per_100g: 13.4 },
  { id: 9, name: 'Canned Tuna (in water)', category: 'Seafood', serving_unit: '100g', serving_size: 100, calories_per_100g: 116, protein_per_100g: 25.5, carbs_per_100g: 0.0, fat_per_100g: 1.0 },
  { id: 10, name: 'Shrimp / Prawns', category: 'Seafood', serving_unit: '100g', serving_size: 100, calories_per_100g: 99, protein_per_100g: 24.0, carbs_per_100g: 0.2, fat_per_100g: 0.3 },
  { id: 11, name: 'Tilapia', category: 'Seafood', serving_unit: '100g', serving_size: 100, calories_per_100g: 96, protein_per_100g: 20.1, carbs_per_100g: 0.0, fat_per_100g: 1.7 },
  { id: 12, name: 'Rohu / River Fish', category: 'Seafood', serving_unit: '100g', serving_size: 100, calories_per_100g: 97, protein_per_100g: 16.6, carbs_per_100g: 0.0, fat_per_100g: 1.4 },

  // Eggs & Dairy
  { id: 13, name: 'Whole Egg', category: 'Eggs & Dairy', serving_unit: 'egg (50g)', serving_size: 50, calories_per_100g: 143, protein_per_100g: 12.6, carbs_per_100g: 0.7, fat_per_100g: 9.5 },
  { id: 14, name: 'Boiled Egg', category: 'Eggs & Dairy', serving_unit: 'egg (50g)', serving_size: 50, calories_per_100g: 155, protein_per_100g: 12.6, carbs_per_100g: 1.1, fat_per_100g: 10.6 },
  { id: 15, name: 'Egg Omelette (Plain)', category: 'Eggs & Dairy', serving_unit: 'egg (60g)', serving_size: 60, calories_per_100g: 154, protein_per_100g: 10.6, carbs_per_100g: 0.6, fat_per_100g: 12.0 },
  { id: 16, name: 'Egg White', category: 'Eggs & Dairy', serving_unit: 'white (33g)', serving_size: 33, calories_per_100g: 52, protein_per_100g: 10.9, carbs_per_100g: 0.7, fat_per_100g: 0.2 },
  { id: 17, name: 'Greek Yogurt (0% Fat)', category: 'Eggs & Dairy', serving_unit: '100g', serving_size: 100, calories_per_100g: 59, protein_per_100g: 10.0, carbs_per_100g: 3.6, fat_per_100g: 0.4 },
  { id: 18, name: 'Cottage Cheese (Low Fat)', category: 'Eggs & Dairy', serving_unit: '100g', serving_size: 100, calories_per_100g: 72, protein_per_100g: 12.4, carbs_per_100g: 2.7, fat_per_100g: 1.0 },
  { id: 19, name: 'Paneer (Cottage Cheese)', category: 'Eggs & Dairy', serving_unit: '100g', serving_size: 100, calories_per_100g: 265, protein_per_100g: 18.3, carbs_per_100g: 1.2, fat_per_100g: 20.8 },
  { id: 20, name: 'Low-Fat Paneer', category: 'Eggs & Dairy', serving_unit: '100g', serving_size: 100, calories_per_100g: 173, protein_per_100g: 21.0, carbs_per_100g: 3.5, fat_per_100g: 8.0 },
  { id: 21, name: 'Curd / Plain Dahi', category: 'Eggs & Dairy', serving_unit: 'bowl (150g)', serving_size: 150, calories_per_100g: 60, protein_per_100g: 3.1, carbs_per_100g: 4.7, fat_per_100g: 3.3 },
  { id: 22, name: 'Whole Milk', category: 'Eggs & Dairy', serving_unit: 'glass (250ml)', serving_size: 250, calories_per_100g: 61, protein_per_100g: 3.2, carbs_per_100g: 4.8, fat_per_100g: 3.3 },
  { id: 23, name: 'Skimmed Milk', category: 'Eggs & Dairy', serving_unit: 'glass (250ml)', serving_size: 250, calories_per_100g: 35, protein_per_100g: 3.4, carbs_per_100g: 5.0, fat_per_100g: 0.1 },
  { id: 24, name: 'Toned Milk', category: 'Eggs & Dairy', serving_unit: 'glass (250ml)', serving_size: 250, calories_per_100g: 58, protein_per_100g: 3.0, carbs_per_100g: 4.7, fat_per_100g: 3.0 },
  { id: 25, name: 'Cheddar Cheese', category: 'Eggs & Dairy', serving_unit: 'slice (28g)', serving_size: 28, calories_per_100g: 403, protein_per_100g: 24.9, carbs_per_100g: 1.3, fat_per_100g: 33.1 },
  { id: 26, name: 'Mozzarella Cheese', category: 'Eggs & Dairy', serving_unit: '100g', serving_size: 100, calories_per_100g: 300, protein_per_100g: 22.2, carbs_per_100g: 2.2, fat_per_100g: 22.4 },

  // Grains & Breads
  { id: 27, name: 'White Rice (Cooked)', category: 'Grains & Breads', serving_unit: 'bowl (150g)', serving_size: 150, calories_per_100g: 130, protein_per_100g: 2.7, carbs_per_100g: 28.2, fat_per_100g: 0.3 },
  { id: 28, name: 'Brown Rice (Cooked)', category: 'Grains & Breads', serving_unit: 'bowl (150g)', serving_size: 150, calories_per_100g: 112, protein_per_100g: 2.6, carbs_per_100g: 23.5, fat_per_100g: 0.9 },
  { id: 29, name: 'Roti / Chapati (Whole Wheat)', category: 'Grains & Breads', serving_unit: 'roti (40g)', serving_size: 40, calories_per_100g: 297, protein_per_100g: 9.8, carbs_per_100g: 46.1, fat_per_100g: 7.4 },
  { id: 30, name: 'Plain Paratha', category: 'Grains & Breads', serving_unit: 'paratha (60g)', serving_size: 60, calories_per_100g: 326, protein_per_100g: 6.4, carbs_per_100g: 45.0, fat_per_100g: 13.0 },
  { id: 31, name: 'Aloo Paratha', category: 'Grains & Breads', serving_unit: 'paratha (120g)', serving_size: 120, calories_per_100g: 245, protein_per_100g: 5.0, carbs_per_100g: 36.0, fat_per_100g: 9.0 },
  { id: 32, name: 'Oatmeal / Rolled Oats', category: 'Grains & Breads', serving_unit: '100g', serving_size: 100, calories_per_100g: 389, protein_per_100g: 16.9, carbs_per_100g: 66.3, fat_per_100g: 6.9 },
  { id: 33, name: 'Whole Wheat Bread', category: 'Grains & Breads', serving_unit: 'slice (35g)', serving_size: 35, calories_per_100g: 247, protein_per_100g: 13.0, carbs_per_100g: 41.0, fat_per_100g: 3.4 },
  { id: 34, name: 'White Bread', category: 'Grains & Breads', serving_unit: 'slice (30g)', serving_size: 30, calories_per_100g: 265, protein_per_100g: 9.0, carbs_per_100g: 49.0, fat_per_100g: 3.2 },
  { id: 35, name: 'Pasta (Cooked)', category: 'Grains & Breads', serving_unit: '100g', serving_size: 100, calories_per_100g: 158, protein_per_100g: 5.8, carbs_per_100g: 30.9, fat_per_100g: 0.9 },
  { id: 36, name: 'Quinoa (Cooked)', category: 'Grains & Breads', serving_unit: '100g', serving_size: 100, calories_per_100g: 120, protein_per_100g: 4.4, carbs_per_100g: 21.3, fat_per_100g: 1.9 },
  { id: 37, name: 'Sweet Potato (Boiled)', category: 'Grains & Breads', serving_unit: '100g', serving_size: 100, calories_per_100g: 86, protein_per_100g: 1.6, carbs_per_100g: 20.1, fat_per_100g: 0.1 },
  { id: 38, name: 'Potato (Baked)', category: 'Grains & Breads', serving_unit: '100g', serving_size: 100, calories_per_100g: 93, protein_per_100g: 2.5, carbs_per_100g: 21.2, fat_per_100g: 0.1 },
  { id: 39, name: 'Potato (Boiled)', category: 'Grains & Breads', serving_unit: 'potato (150g)', serving_size: 150, calories_per_100g: 87, protein_per_100g: 1.9, carbs_per_100g: 20.1, fat_per_100g: 0.1 },
  { id: 40, name: 'Cornflakes', category: 'Grains & Breads', serving_unit: 'bowl (30g)', serving_size: 30, calories_per_100g: 357, protein_per_100g: 7.5, carbs_per_100g: 84.0, fat_per_100g: 0.4 },
  { id: 41, name: 'Muesli', category: 'Grains & Breads', serving_unit: 'bowl (50g)', serving_size: 50, calories_per_100g: 380, protein_per_100g: 10.0, carbs_per_100g: 68.0, fat_per_100g: 7.0 },

  // Home Meals & Curries
  { id: 42, name: 'Idli (Steamed)', category: 'Home Meals', serving_unit: 'idli (50g)', serving_size: 50, calories_per_100g: 156, protein_per_100g: 4.8, carbs_per_100g: 30.2, fat_per_100g: 1.5 },
  { id: 43, name: 'Plain Dosa', category: 'Home Meals', serving_unit: 'dosa (100g)', serving_size: 100, calories_per_100g: 168, protein_per_100g: 3.9, carbs_per_100g: 28.0, fat_per_100g: 4.2 },
  { id: 44, name: 'Masala Dosa', category: 'Home Meals', serving_unit: 'dosa (175g)', serving_size: 175, calories_per_100g: 206, protein_per_100g: 4.1, carbs_per_100g: 29.5, fat_per_100g: 7.8 },
  { id: 45, name: 'Poha (Flattened Rice)', category: 'Home Meals', serving_unit: 'bowl (150g)', serving_size: 150, calories_per_100g: 130, protein_per_100g: 2.5, carbs_per_100g: 24.5, fat_per_100g: 2.4 },
  { id: 46, name: 'Upma (Semolina)', category: 'Home Meals', serving_unit: 'bowl (150g)', serving_size: 150, calories_per_100g: 145, protein_per_100g: 3.5, carbs_per_100g: 23.0, fat_per_100g: 4.0 },
  { id: 47, name: 'Khichdi (Dal Rice)', category: 'Home Meals', serving_unit: 'bowl (200g)', serving_size: 200, calories_per_100g: 125, protein_per_100g: 4.4, carbs_per_100g: 20.5, fat_per_100g: 2.8 },
  { id: 48, name: 'Toor Dal / Tadka Dal', category: 'Home Meals', serving_unit: 'bowl (150g)', serving_size: 150, calories_per_100g: 112, protein_per_100g: 6.0, carbs_per_100g: 15.0, fat_per_100g: 3.0 },
  { id: 49, name: 'Moong Dal (Cooked)', category: 'Home Meals', serving_unit: 'bowl (150g)', serving_size: 150, calories_per_100g: 105, protein_per_100g: 6.8, carbs_per_100g: 14.5, fat_per_100g: 2.2 },
  { id: 50, name: 'Rajma Masala (Kidney Beans)', category: 'Home Meals', serving_unit: 'bowl (180g)', serving_size: 180, calories_per_100g: 118, protein_per_100g: 5.5, carbs_per_100g: 16.5, fat_per_100g: 3.2 },
  { id: 51, name: 'Chole / Chana Masala', category: 'Home Meals', serving_unit: 'bowl (180g)', serving_size: 180, calories_per_100g: 135, protein_per_100g: 6.2, carbs_per_100g: 18.0, fat_per_100g: 4.2 },
  { id: 52, name: 'Dal Makhani', category: 'Home Meals', serving_unit: 'bowl (180g)', serving_size: 180, calories_per_100g: 158, protein_per_100g: 5.8, carbs_per_100g: 15.0, fat_per_100g: 8.2 },
  { id: 53, name: 'Palak Paneer', category: 'Home Meals', serving_unit: 'bowl (180g)', serving_size: 180, calories_per_100g: 145, protein_per_100g: 8.0, carbs_per_100g: 5.5, fat_per_100g: 10.5 },
  { id: 54, name: 'Mixed Sabzi (Veg Curry)', category: 'Home Meals', serving_unit: 'bowl (150g)', serving_size: 150, calories_per_100g: 85, protein_per_100g: 2.2, carbs_per_100g: 10.5, fat_per_100g: 4.0 },
  { id: 55, name: 'Aloo Gobhi (Cooked)', category: 'Home Meals', serving_unit: 'bowl (150g)', serving_size: 150, calories_per_100g: 95, protein_per_100g: 2.4, carbs_per_100g: 12.0, fat_per_100g: 4.2 },
  { id: 56, name: 'Sambar', category: 'Home Meals', serving_unit: 'bowl (150g)', serving_size: 150, calories_per_100g: 65, protein_per_100g: 3.1, carbs_per_100g: 9.2, fat_per_100g: 1.8 },
  { id: 57, name: 'Puri (Whole Wheat)', category: 'Home Meals', serving_unit: 'puri (25g)', serving_size: 25, calories_per_100g: 360, protein_per_100g: 6.5, carbs_per_100g: 48.0, fat_per_100g: 16.0 },
  { id: 58, name: 'Besan Chilla (Gram Crepe)', category: 'Home Meals', serving_unit: 'chilla (70g)', serving_size: 70, calories_per_100g: 190, protein_per_100g: 9.5, carbs_per_100g: 22.0, fat_per_100g: 7.0 },

  // Vegetables
  { id: 59, name: 'Broccoli', category: 'Vegetables', serving_unit: '100g', serving_size: 100, calories_per_100g: 34, protein_per_100g: 2.8, carbs_per_100g: 7.0, fat_per_100g: 0.4 },
  { id: 60, name: 'Spinach', category: 'Vegetables', serving_unit: '100g', serving_size: 100, calories_per_100g: 23, protein_per_100g: 2.9, carbs_per_100g: 3.6, fat_per_100g: 0.4 },
  { id: 61, name: 'Carrot', category: 'Vegetables', serving_unit: 'carrot (60g)', serving_size: 60, calories_per_100g: 41, protein_per_100g: 0.9, carbs_per_100g: 9.6, fat_per_100g: 0.2 },
  { id: 62, name: 'Cucumber', category: 'Vegetables', serving_unit: 'cucumber (150g)', serving_size: 150, calories_per_100g: 15, protein_per_100g: 0.7, carbs_per_100g: 3.6, fat_per_100g: 0.1 },
  { id: 63, name: 'Tomato', category: 'Vegetables', serving_unit: 'tomato (120g)', serving_size: 120, calories_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2 },
  { id: 64, name: 'Bell Pepper', category: 'Vegetables', serving_unit: 'pepper (120g)', serving_size: 120, calories_per_100g: 26, protein_per_100g: 1.0, carbs_per_100g: 6.0, fat_per_100g: 0.3 },
  { id: 65, name: 'Onion', category: 'Vegetables', serving_unit: 'onion (110g)', serving_size: 110, calories_per_100g: 40, protein_per_100g: 1.1, carbs_per_100g: 9.3, fat_per_100g: 0.1 },
  { id: 66, name: 'Cauliflower', category: 'Vegetables', serving_unit: '100g', serving_size: 100, calories_per_100g: 25, protein_per_100g: 1.9, carbs_per_100g: 5.0, fat_per_100g: 0.3 },
  { id: 67, name: 'Okra / Bhindi (Lady Finger)', category: 'Vegetables', serving_unit: '100g', serving_size: 100, calories_per_100g: 33, protein_per_100g: 1.9, carbs_per_100g: 7.5, fat_per_100g: 0.2 },
  { id: 68, name: 'Bottle Gourd (Lauki)', category: 'Vegetables', serving_unit: '100g', serving_size: 100, calories_per_100g: 15, protein_per_100g: 0.6, carbs_per_100g: 3.4, fat_per_100g: 0.0 },
  { id: 69, name: 'Bitter Gourd (Karela)', category: 'Vegetables', serving_unit: '100g', serving_size: 100, calories_per_100g: 17, protein_per_100g: 1.0, carbs_per_100g: 3.7, fat_per_100g: 0.2 },
  { id: 70, name: 'Brinjal / Eggplant (Baingan)', category: 'Vegetables', serving_unit: '100g', serving_size: 100, calories_per_100g: 25, protein_per_100g: 1.0, carbs_per_100g: 5.9, fat_per_100g: 0.2 },
  { id: 71, name: 'Cabbage (Patta Gobhi)', category: 'Vegetables', serving_unit: '100g', serving_size: 100, calories_per_100g: 25, protein_per_100g: 1.3, carbs_per_100g: 5.8, fat_per_100g: 0.1 },
  { id: 72, name: 'Green Peas (Matar)', category: 'Vegetables', serving_unit: '100g', serving_size: 100, calories_per_100g: 81, protein_per_100g: 5.4, carbs_per_100g: 14.5, fat_per_100g: 0.4 },
  { id: 73, name: 'French Beans (Green Beans)', category: 'Vegetables', serving_unit: '100g', serving_size: 100, calories_per_100g: 31, protein_per_100g: 1.8, carbs_per_100g: 7.0, fat_per_100g: 0.2 },
  { id: 74, name: 'Beetroot', category: 'Vegetables', serving_unit: 'piece (100g)', serving_size: 100, calories_per_100g: 43, protein_per_100g: 1.6, carbs_per_100g: 9.6, fat_per_100g: 0.2 },
  { id: 75, name: 'Radish (Mooli)', category: 'Vegetables', serving_unit: '100g', serving_size: 100, calories_per_100g: 16, protein_per_100g: 0.7, carbs_per_100g: 3.4, fat_per_100g: 0.1 },
  { id: 76, name: 'Pumpkin (Kaddu)', category: 'Vegetables', serving_unit: '100g', serving_size: 100, calories_per_100g: 26, protein_per_100g: 1.0, carbs_per_100g: 6.5, fat_per_100g: 0.1 },
  { id: 77, name: 'Mushroom (Button)', category: 'Vegetables', serving_unit: '100g', serving_size: 100, calories_per_100g: 22, protein_per_100g: 3.1, carbs_per_100g: 3.3, fat_per_100g: 0.3 },
  { id: 78, name: 'Sweet Corn', category: 'Vegetables', serving_unit: '100g', serving_size: 100, calories_per_100g: 86, protein_per_100g: 3.3, carbs_per_100g: 18.7, fat_per_100g: 1.4 },
  { id: 79, name: 'Zucchini', category: 'Vegetables', serving_unit: '100g', serving_size: 100, calories_per_100g: 17, protein_per_100g: 1.2, carbs_per_100g: 3.1, fat_per_100g: 0.3 },
  { id: 80, name: 'Lettuce', category: 'Vegetables', serving_unit: '100g', serving_size: 100, calories_per_100g: 15, protein_per_100g: 1.4, carbs_per_100g: 2.9, fat_per_100g: 0.2 },
  { id: 81, name: 'Ridge Gourd (Turai)', category: 'Vegetables', serving_unit: '100g', serving_size: 100, calories_per_100g: 20, protein_per_100g: 1.2, carbs_per_100g: 4.4, fat_per_100g: 0.2 },
  { id: 82, name: 'Drumstick (Moringa)', category: 'Vegetables', serving_unit: '100g', serving_size: 100, calories_per_100g: 37, protein_per_100g: 2.1, carbs_per_100g: 8.5, fat_per_100g: 0.2 },
  { id: 83, name: 'Pointed Gourd (Parwal)', category: 'Vegetables', serving_unit: '100g', serving_size: 100, calories_per_100g: 20, protein_per_100g: 2.0, carbs_per_100g: 2.2, fat_per_100g: 0.3 },
  { id: 84, name: 'Fenugreek Leaves (Methi)', category: 'Vegetables', serving_unit: '100g', serving_size: 100, calories_per_100g: 49, protein_per_100g: 4.4, carbs_per_100g: 6.0, fat_per_100g: 0.9 },

  // Fruits
  { id: 85, name: 'Banana', category: 'Fruits', serving_unit: 'banana (118g)', serving_size: 118, calories_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 22.8, fat_per_100g: 0.3 },
  { id: 86, name: 'Apple', category: 'Fruits', serving_unit: 'apple (180g)', serving_size: 180, calories_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 13.8, fat_per_100g: 0.2 },
  { id: 87, name: 'Orange', category: 'Fruits', serving_unit: 'orange (130g)', serving_size: 130, calories_per_100g: 47, protein_per_100g: 0.9, carbs_per_100g: 11.8, fat_per_100g: 0.1 },
  { id: 88, name: 'Strawberries', category: 'Fruits', serving_unit: '100g', serving_size: 100, calories_per_100g: 32, protein_per_100g: 0.7, carbs_per_100g: 7.7, fat_per_100g: 0.3 },
  { id: 89, name: 'Blueberries', category: 'Fruits', serving_unit: '100g', serving_size: 100, calories_per_100g: 57, protein_per_100g: 0.7, carbs_per_100g: 14.5, fat_per_100g: 0.3 },
  { id: 90, name: 'Avocado', category: 'Fruits', serving_unit: 'avocado (150g)', serving_size: 150, calories_per_100g: 160, protein_per_100g: 2.0, carbs_per_100g: 8.5, fat_per_100g: 14.7 },
  { id: 91, name: 'Watermelon', category: 'Fruits', serving_unit: '100g', serving_size: 100, calories_per_100g: 30, protein_per_100g: 0.6, carbs_per_100g: 7.6, fat_per_100g: 0.2 },
  { id: 92, name: 'Mango', category: 'Fruits', serving_unit: 'mango (200g)', serving_size: 200, calories_per_100g: 60, protein_per_100g: 0.8, carbs_per_100g: 15.0, fat_per_100g: 0.4 },
  { id: 93, name: 'Papaya', category: 'Fruits', serving_unit: 'bowl (150g)', serving_size: 150, calories_per_100g: 43, protein_per_100g: 0.5, carbs_per_100g: 10.8, fat_per_100g: 0.3 },
  { id: 94, name: 'Guava', category: 'Fruits', serving_unit: 'guava (100g)', serving_size: 100, calories_per_100g: 68, protein_per_100g: 2.6, carbs_per_100g: 14.3, fat_per_100g: 1.0 },
  { id: 95, name: 'Pomegranate', category: 'Fruits', serving_unit: 'bowl (150g)', serving_size: 150, calories_per_100g: 83, protein_per_100g: 1.7, carbs_per_100g: 18.7, fat_per_100g: 1.2 },
  { id: 96, name: 'Grapes', category: 'Fruits', serving_unit: '100g', serving_size: 100, calories_per_100g: 69, protein_per_100g: 0.7, carbs_per_100g: 18.1, fat_per_100g: 0.2 },
  { id: 97, name: 'Pineapple', category: 'Fruits', serving_unit: '100g', serving_size: 100, calories_per_100g: 50, protein_per_100g: 0.5, carbs_per_100g: 13.1, fat_per_100g: 0.1 },
  { id: 98, name: 'Dates (Khajoor)', category: 'Fruits', serving_unit: 'date (8g)', serving_size: 8, calories_per_100g: 282, protein_per_100g: 2.5, carbs_per_100g: 75.0, fat_per_100g: 0.4 },

  // Legumes, Nuts & Seeds
  { id: 99, name: 'Almonds', category: 'Nuts & Seeds', serving_unit: 'handful (28g)', serving_size: 28, calories_per_100g: 579, protein_per_100g: 21.2, carbs_per_100g: 21.6, fat_per_100g: 49.9 },
  { id: 100, name: 'Peanuts', category: 'Nuts & Seeds', serving_unit: 'handful (28g)', serving_size: 28, calories_per_100g: 567, protein_per_100g: 25.8, carbs_per_100g: 16.1, fat_per_100g: 49.2 },
  { id: 101, name: 'Walnuts', category: 'Nuts & Seeds', serving_unit: 'handful (28g)', serving_size: 28, calories_per_100g: 654, protein_per_100g: 15.2, carbs_per_100g: 13.7, fat_per_100g: 65.2 },
  { id: 102, name: 'Cashews (Kaju)', category: 'Nuts & Seeds', serving_unit: 'handful (28g)', serving_size: 28, calories_per_100g: 553, protein_per_100g: 18.2, carbs_per_100g: 30.2, fat_per_100g: 43.9 },
  { id: 103, name: 'Peanut Butter', category: 'Nuts & Seeds', serving_unit: 'tbsp (16g)', serving_size: 16, calories_per_100g: 588, protein_per_100g: 25.1, carbs_per_100g: 20.0, fat_per_100g: 50.4 },
  { id: 104, name: 'Chia Seeds', category: 'Nuts & Seeds', serving_unit: 'tbsp (12g)', serving_size: 12, calories_per_100g: 486, protein_per_100g: 16.5, carbs_per_100g: 42.1, fat_per_100g: 30.7 },
  { id: 105, name: 'Flax Seeds', category: 'Nuts & Seeds', serving_unit: 'tbsp (10g)', serving_size: 10, calories_per_100g: 534, protein_per_100g: 18.3, carbs_per_100g: 28.9, fat_per_100g: 42.2 },
  { id: 106, name: 'Lentils (Cooked)', category: 'Legumes', serving_unit: 'bowl (150g)', serving_size: 150, calories_per_100g: 116, protein_per_100g: 9.0, carbs_per_100g: 20.1, fat_per_100g: 0.4 },
  { id: 107, name: 'Chickpeas / Garbanzo (Cooked)', category: 'Legumes', serving_unit: 'bowl (150g)', serving_size: 150, calories_per_100g: 164, protein_per_100g: 8.9, carbs_per_100g: 27.4, fat_per_100g: 2.6 },
  { id: 108, name: 'Black Beans (Cooked)', category: 'Legumes', serving_unit: '100g', serving_size: 100, calories_per_100g: 132, protein_per_100g: 8.9, carbs_per_100g: 23.7, fat_per_100g: 0.5 },
  { id: 109, name: 'Tofu (Firm)', category: 'Legumes', serving_unit: '100g', serving_size: 100, calories_per_100g: 76, protein_per_100g: 8.1, carbs_per_100g: 1.9, fat_per_100g: 4.8 },
  { id: 110, name: 'Sprouted Moong', category: 'Legumes', serving_unit: 'bowl (100g)', serving_size: 100, calories_per_100g: 98, protein_per_100g: 7.5, carbs_per_100g: 16.0, fat_per_100g: 0.5 },
  { id: 111, name: 'Soya Chunks (Dry)', category: 'Legumes', serving_unit: 'bowl (50g)', serving_size: 50, calories_per_100g: 345, protein_per_100g: 52.0, carbs_per_100g: 33.0, fat_per_100g: 0.5 },
  { id: 112, name: 'Soya Chunks (Boiled)', category: 'Legumes', serving_unit: '100g', serving_size: 100, calories_per_100g: 115, protein_per_100g: 17.3, carbs_per_100g: 11.0, fat_per_100g: 0.2 },
  { id: 113, name: 'Roasted Chana', category: 'Legumes', serving_unit: 'handful (30g)', serving_size: 30, calories_per_100g: 369, protein_per_100g: 18.6, carbs_per_100g: 58.0, fat_per_100g: 6.5 },

  // Fats & Oils
  { id: 114, name: 'Olive Oil', category: 'Fats & Oils', serving_unit: 'tbsp (14g)', serving_size: 14, calories_per_100g: 884, protein_per_100g: 0.0, carbs_per_100g: 0.0, fat_per_100g: 100.0 },
  { id: 115, name: 'Butter', category: 'Fats & Oils', serving_unit: 'pat (10g)', serving_size: 10, calories_per_100g: 717, protein_per_100g: 0.9, carbs_per_100g: 0.1, fat_per_100g: 81.1 },
  { id: 116, name: 'Ghee (Clarified Butter)', category: 'Fats & Oils', serving_unit: 'tsp (5g)', serving_size: 5, calories_per_100g: 900, protein_per_100g: 0.0, carbs_per_100g: 0.0, fat_per_100g: 100.0 },
  { id: 117, name: 'Mustard / Cooking Oil', category: 'Fats & Oils', serving_unit: 'tbsp (14g)', serving_size: 14, calories_per_100g: 884, protein_per_100g: 0.0, carbs_per_100g: 0.0, fat_per_100g: 100.0 },

  // Snacks, Supplements & Beverages
  { id: 118, name: 'Whey Protein Powder', category: 'Supplements', serving_unit: 'scoop (30g)', serving_size: 30, calories_per_100g: 400, protein_per_100g: 80.0, carbs_per_100g: 6.7, fat_per_100g: 5.0 },
  { id: 119, name: 'Dark Chocolate (70-85%)', category: 'Snacks', serving_unit: 'square (20g)', serving_size: 20, calories_per_100g: 598, protein_per_100g: 7.8, carbs_per_100g: 45.9, fat_per_100g: 42.6 },
  { id: 120, name: 'Honey', category: 'Snacks', serving_unit: 'tbsp (21g)', serving_size: 21, calories_per_100g: 304, protein_per_100g: 0.3, carbs_per_100g: 82.4, fat_per_100g: 0.0 },
  { id: 121, name: 'Makhana (Fox Nuts, Roasted)', category: 'Snacks', serving_unit: 'bowl (30g)', serving_size: 30, calories_per_100g: 347, protein_per_100g: 9.7, carbs_per_100g: 76.9, fat_per_100g: 0.1 },
  { id: 122, name: 'Samosa (Potato)', category: 'Snacks', serving_unit: 'samosa (80g)', serving_size: 80, calories_per_100g: 262, protein_per_100g: 3.5, carbs_per_100g: 24.0, fat_per_100g: 17.0 },
  { id: 123, name: 'Marie Biscuit', category: 'Snacks', serving_unit: 'biscuit (6g)', serving_size: 6, calories_per_100g: 440, protein_per_100g: 7.5, carbs_per_100g: 74.0, fat_per_100g: 12.5 },
  { id: 124, name: 'Milk Tea / Chai (with sugar)', category: 'Beverages', serving_unit: 'cup (150ml)', serving_size: 150, calories_per_100g: 65, protein_per_100g: 2.1, carbs_per_100g: 9.0, fat_per_100g: 2.2 },
  { id: 125, name: 'Black Coffee / Espresso', category: 'Beverages', serving_unit: 'cup (200ml)', serving_size: 200, calories_per_100g: 2, protein_per_100g: 0.1, carbs_per_100g: 0.0, fat_per_100g: 0.0 },
  { id: 126, name: 'Milk Coffee (with sugar)', category: 'Beverages', serving_unit: 'cup (200ml)', serving_size: 200, calories_per_100g: 58, protein_per_100g: 2.0, carbs_per_100g: 7.5, fat_per_100g: 2.1 },
  { id: 127, name: 'Coconut Water', category: 'Beverages', serving_unit: 'glass (250ml)', serving_size: 250, calories_per_100g: 19, protein_per_100g: 0.7, carbs_per_100g: 3.7, fat_per_100g: 0.2 },
  { id: 128, name: 'Buttermilk / Chaas', category: 'Beverages', serving_unit: 'glass (250ml)', serving_size: 250, calories_per_100g: 40, protein_per_100g: 3.3, carbs_per_100g: 4.8, fat_per_100g: 0.9 },
  { id: 129, name: 'Sweet Lassi', category: 'Beverages', serving_unit: 'glass (250ml)', serving_size: 250, calories_per_100g: 78, protein_per_100g: 2.8, carbs_per_100g: 11.5, fat_per_100g: 2.3 },
];

/**
 * Parses a food's serving_unit (e.g. "egg (50g)", "roti (40g)", "100g") to decide
 * whether countable serving mode applies and what singular label to display.
 */
export function getServingMeta(food) {
  const unitRaw = String(food?.serving_unit || '').trim();
  const servingSize = Number(food?.serving_size) || 0;

  if (!unitRaw || servingSize <= 0) {
    return { hasCountUnit: false, unitLabel: 'g', servingSize: 100 };
  }

  const lower = unitRaw.toLowerCase();
  if (lower === 'g' || lower === '100g' || lower === 'ml' || lower === '100ml') {
    return { hasCountUnit: false, unitLabel: lower.includes('ml') ? 'ml' : 'g', servingSize: 100 };
  }

  // Strip trailing "(50g)" or "(250ml)" for clean unit label
  let label = unitRaw.replace(/\s*\([^)]*\)\s*/g, '').trim();
  if (!label || /^\d/.test(label)) {
    return { hasCountUnit: false, unitLabel: 'g', servingSize: 100 };
  }

  // Normalize older "large (50g)" on Whole Egg if still returned by an old cache
  if (label.toLowerCase() === 'large' && food?.name?.toLowerCase().includes('egg')) {
    label = 'egg';
  }

  return {
    hasCountUnit: true,
    unitLabel: label,
    servingSize,
  };
}
