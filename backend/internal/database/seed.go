package database

import (
	"calorie-calculator/internal/models"
	"log"
	"strings"

	"gorm.io/gorm"
)

// SeedFoods populates initial foods and ensures any newly added catalog items exist
func SeedFoods(db *gorm.DB) error {
	initialFoods := []models.Food{
		// Meat & Poultry
		{Name: "Chicken Breast (Skinless)", Category: "Meat & Poultry", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 165, ProteinPer100g: 31.0, CarbsPer100g: 0.0, FatPer100g: 3.6},
		{Name: "Chicken Thigh (Skinless)", Category: "Meat & Poultry", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 209, ProteinPer100g: 26.0, CarbsPer100g: 0.0, FatPer100g: 10.9},
		{Name: "Lean Beef (90/10)", Category: "Meat & Poultry", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 217, ProteinPer100g: 26.1, CarbsPer100g: 0.0, FatPer100g: 11.8},
		{Name: "Pork Tenderloin", Category: "Meat & Poultry", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 143, ProteinPer100g: 26.0, CarbsPer100g: 0.0, FatPer100g: 3.5},
		{Name: "Turkey Breast", Category: "Meat & Poultry", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 135, ProteinPer100g: 30.0, CarbsPer100g: 0.0, FatPer100g: 1.0},
		{Name: "Chicken Drumstick / Leg", Category: "Meat & Poultry", ServingUnit: "piece (100g)", ServingSize: 100, CaloriesPer100g: 172, ProteinPer100g: 24.2, CarbsPer100g: 0.0, FatPer100g: 7.5},
		{Name: "Mutton / Goat Meat (Lean)", Category: "Meat & Poultry", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 143, ProteinPer100g: 27.1, CarbsPer100g: 0.0, FatPer100g: 3.0},

		// Seafood
		{Name: "Salmon (Atlantic)", Category: "Seafood", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 208, ProteinPer100g: 20.4, CarbsPer100g: 0.0, FatPer100g: 13.4},
		{Name: "Canned Tuna (in water)", Category: "Seafood", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 116, ProteinPer100g: 25.5, CarbsPer100g: 0.0, FatPer100g: 1.0},
		{Name: "Shrimp / Prawns", Category: "Seafood", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 99, ProteinPer100g: 24.0, CarbsPer100g: 0.2, FatPer100g: 0.3},
		{Name: "Tilapia", Category: "Seafood", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 96, ProteinPer100g: 20.1, CarbsPer100g: 0.0, FatPer100g: 1.7},
		{Name: "Rohu / River Fish", Category: "Seafood", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 97, ProteinPer100g: 16.6, CarbsPer100g: 0.0, FatPer100g: 1.4},

		// Eggs & Dairy
		{Name: "Whole Egg", Category: "Eggs & Dairy", ServingUnit: "egg (50g)", ServingSize: 50, CaloriesPer100g: 143, ProteinPer100g: 12.6, CarbsPer100g: 0.7, FatPer100g: 9.5},
		{Name: "Boiled Egg", Category: "Eggs & Dairy", ServingUnit: "egg (50g)", ServingSize: 50, CaloriesPer100g: 155, ProteinPer100g: 12.6, CarbsPer100g: 1.1, FatPer100g: 10.6},
		{Name: "Egg Omelette (Plain)", Category: "Eggs & Dairy", ServingUnit: "egg (60g)", ServingSize: 60, CaloriesPer100g: 154, ProteinPer100g: 10.6, CarbsPer100g: 0.6, FatPer100g: 12.0},
		{Name: "Egg White", Category: "Eggs & Dairy", ServingUnit: "white (33g)", ServingSize: 33, CaloriesPer100g: 52, ProteinPer100g: 10.9, CarbsPer100g: 0.7, FatPer100g: 0.2},
		{Name: "Greek Yogurt (0% Fat)", Category: "Eggs & Dairy", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 59, ProteinPer100g: 10.0, CarbsPer100g: 3.6, FatPer100g: 0.4},
		{Name: "Cottage Cheese (Low Fat)", Category: "Eggs & Dairy", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 72, ProteinPer100g: 12.4, CarbsPer100g: 2.7, FatPer100g: 1.0},
		{Name: "Paneer (Cottage Cheese)", Category: "Eggs & Dairy", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 265, ProteinPer100g: 18.3, CarbsPer100g: 1.2, FatPer100g: 20.8},
		{Name: "Low-Fat Paneer", Category: "Eggs & Dairy", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 173, ProteinPer100g: 21.0, CarbsPer100g: 3.5, FatPer100g: 8.0},
		{Name: "Curd / Plain Dahi", Category: "Eggs & Dairy", ServingUnit: "bowl (150g)", ServingSize: 150, CaloriesPer100g: 60, ProteinPer100g: 3.1, CarbsPer100g: 4.7, FatPer100g: 3.3},
		{Name: "Whole Milk", Category: "Eggs & Dairy", ServingUnit: "glass (250ml)", ServingSize: 250, CaloriesPer100g: 61, ProteinPer100g: 3.2, CarbsPer100g: 4.8, FatPer100g: 3.3},
		{Name: "Skimmed Milk", Category: "Eggs & Dairy", ServingUnit: "glass (250ml)", ServingSize: 250, CaloriesPer100g: 35, ProteinPer100g: 3.4, CarbsPer100g: 5.0, FatPer100g: 0.1},
		{Name: "Toned Milk", Category: "Eggs & Dairy", ServingUnit: "glass (250ml)", ServingSize: 250, CaloriesPer100g: 58, ProteinPer100g: 3.0, CarbsPer100g: 4.7, FatPer100g: 3.0},
		{Name: "Cheddar Cheese", Category: "Eggs & Dairy", ServingUnit: "slice (28g)", ServingSize: 28, CaloriesPer100g: 403, ProteinPer100g: 24.9, CarbsPer100g: 1.3, FatPer100g: 33.1},
		{Name: "Mozzarella Cheese", Category: "Eggs & Dairy", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 300, ProteinPer100g: 22.2, CarbsPer100g: 2.2, FatPer100g: 22.4},

		// Grains & Breads
		{Name: "White Rice (Cooked)", Category: "Grains & Breads", ServingUnit: "bowl (150g)", ServingSize: 150, CaloriesPer100g: 130, ProteinPer100g: 2.7, CarbsPer100g: 28.2, FatPer100g: 0.3},
		{Name: "Brown Rice (Cooked)", Category: "Grains & Breads", ServingUnit: "bowl (150g)", ServingSize: 150, CaloriesPer100g: 112, ProteinPer100g: 2.6, CarbsPer100g: 23.5, FatPer100g: 0.9},
		{Name: "Roti / Chapati (Whole Wheat)", Category: "Grains & Breads", ServingUnit: "roti (40g)", ServingSize: 40, CaloriesPer100g: 297, ProteinPer100g: 9.8, CarbsPer100g: 46.1, FatPer100g: 7.4},
		{Name: "Plain Paratha", Category: "Grains & Breads", ServingUnit: "paratha (60g)", ServingSize: 60, CaloriesPer100g: 326, ProteinPer100g: 6.4, CarbsPer100g: 45.0, FatPer100g: 13.0},
		{Name: "Aloo Paratha", Category: "Grains & Breads", ServingUnit: "paratha (120g)", ServingSize: 120, CaloriesPer100g: 245, ProteinPer100g: 5.0, CarbsPer100g: 36.0, FatPer100g: 9.0},
		{Name: "Oatmeal / Rolled Oats", Category: "Grains & Breads", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 389, ProteinPer100g: 16.9, CarbsPer100g: 66.3, FatPer100g: 6.9},
		{Name: "Whole Wheat Bread", Category: "Grains & Breads", ServingUnit: "slice (35g)", ServingSize: 35, CaloriesPer100g: 247, ProteinPer100g: 13.0, CarbsPer100g: 41.0, FatPer100g: 3.4},
		{Name: "White Bread", Category: "Grains & Breads", ServingUnit: "slice (30g)", ServingSize: 30, CaloriesPer100g: 265, ProteinPer100g: 9.0, CarbsPer100g: 49.0, FatPer100g: 3.2},
		{Name: "Pasta (Cooked)", Category: "Grains & Breads", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 158, ProteinPer100g: 5.8, CarbsPer100g: 30.9, FatPer100g: 0.9},
		{Name: "Quinoa (Cooked)", Category: "Grains & Breads", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 120, ProteinPer100g: 4.4, CarbsPer100g: 21.3, FatPer100g: 1.9},
		{Name: "Sweet Potato (Boiled)", Category: "Grains & Breads", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 86, ProteinPer100g: 1.6, CarbsPer100g: 20.1, FatPer100g: 0.1},
		{Name: "Potato (Baked)", Category: "Grains & Breads", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 93, ProteinPer100g: 2.5, CarbsPer100g: 21.2, FatPer100g: 0.1},
		{Name: "Potato (Boiled)", Category: "Grains & Breads", ServingUnit: "potato (150g)", ServingSize: 150, CaloriesPer100g: 87, ProteinPer100g: 1.9, CarbsPer100g: 20.1, FatPer100g: 0.1},
		{Name: "Cornflakes", Category: "Grains & Breads", ServingUnit: "bowl (30g)", ServingSize: 30, CaloriesPer100g: 357, ProteinPer100g: 7.5, CarbsPer100g: 84.0, FatPer100g: 0.4},
		{Name: "Muesli", Category: "Grains & Breads", ServingUnit: "bowl (50g)", ServingSize: 50, CaloriesPer100g: 380, ProteinPer100g: 10.0, CarbsPer100g: 68.0, FatPer100g: 7.0},

		// Home Meals & Curries
		{Name: "Idli (Steamed)", Category: "Home Meals", ServingUnit: "idli (50g)", ServingSize: 50, CaloriesPer100g: 156, ProteinPer100g: 4.8, CarbsPer100g: 30.2, FatPer100g: 1.5},
		{Name: "Plain Dosa", Category: "Home Meals", ServingUnit: "dosa (100g)", ServingSize: 100, CaloriesPer100g: 168, ProteinPer100g: 3.9, CarbsPer100g: 28.0, FatPer100g: 4.2},
		{Name: "Masala Dosa", Category: "Home Meals", ServingUnit: "dosa (175g)", ServingSize: 175, CaloriesPer100g: 206, ProteinPer100g: 4.1, CarbsPer100g: 29.5, FatPer100g: 7.8},
		{Name: "Poha (Flattened Rice)", Category: "Home Meals", ServingUnit: "bowl (150g)", ServingSize: 150, CaloriesPer100g: 130, ProteinPer100g: 2.5, CarbsPer100g: 24.5, FatPer100g: 2.4},
		{Name: "Upma (Semolina)", Category: "Home Meals", ServingUnit: "bowl (150g)", ServingSize: 150, CaloriesPer100g: 145, ProteinPer100g: 3.5, CarbsPer100g: 23.0, FatPer100g: 4.0},
		{Name: "Khichdi (Dal Rice)", Category: "Home Meals", ServingUnit: "bowl (200g)", ServingSize: 200, CaloriesPer100g: 125, ProteinPer100g: 4.4, CarbsPer100g: 20.5, FatPer100g: 2.8},
		{Name: "Toor Dal / Tadka Dal", Category: "Home Meals", ServingUnit: "bowl (150g)", ServingSize: 150, CaloriesPer100g: 112, ProteinPer100g: 6.0, CarbsPer100g: 15.0, FatPer100g: 3.0},
		{Name: "Moong Dal (Cooked)", Category: "Home Meals", ServingUnit: "bowl (150g)", ServingSize: 150, CaloriesPer100g: 105, ProteinPer100g: 6.8, CarbsPer100g: 14.5, FatPer100g: 2.2},
		{Name: "Rajma Masala (Kidney Beans)", Category: "Home Meals", ServingUnit: "bowl (180g)", ServingSize: 180, CaloriesPer100g: 118, ProteinPer100g: 5.5, CarbsPer100g: 16.5, FatPer100g: 3.2},
		{Name: "Chole / Chana Masala", Category: "Home Meals", ServingUnit: "bowl (180g)", ServingSize: 180, CaloriesPer100g: 135, ProteinPer100g: 6.2, CarbsPer100g: 18.0, FatPer100g: 4.2},
		{Name: "Dal Makhani", Category: "Home Meals", ServingUnit: "bowl (180g)", ServingSize: 180, CaloriesPer100g: 158, ProteinPer100g: 5.8, CarbsPer100g: 15.0, FatPer100g: 8.2},
		{Name: "Palak Paneer", Category: "Home Meals", ServingUnit: "bowl (180g)", ServingSize: 180, CaloriesPer100g: 145, ProteinPer100g: 8.0, CarbsPer100g: 5.5, FatPer100g: 10.5},
		{Name: "Mixed Sabzi (Veg Curry)", Category: "Home Meals", ServingUnit: "bowl (150g)", ServingSize: 150, CaloriesPer100g: 85, ProteinPer100g: 2.2, CarbsPer100g: 10.5, FatPer100g: 4.0},
		{Name: "Aloo Gobhi (Cooked)", Category: "Home Meals", ServingUnit: "bowl (150g)", ServingSize: 150, CaloriesPer100g: 95, ProteinPer100g: 2.4, CarbsPer100g: 12.0, FatPer100g: 4.2},
		{Name: "Sambar", Category: "Home Meals", ServingUnit: "bowl (150g)", ServingSize: 150, CaloriesPer100g: 65, ProteinPer100g: 3.1, CarbsPer100g: 9.2, FatPer100g: 1.8},
		{Name: "Puri (Whole Wheat)", Category: "Home Meals", ServingUnit: "puri (25g)", ServingSize: 25, CaloriesPer100g: 360, ProteinPer100g: 6.5, CarbsPer100g: 48.0, FatPer100g: 16.0},
		{Name: "Besan Chilla (Gram Crepe)", Category: "Home Meals", ServingUnit: "chilla (70g)", ServingSize: 70, CaloriesPer100g: 190, ProteinPer100g: 9.5, CarbsPer100g: 22.0, FatPer100g: 7.0},

		// Vegetables
		{Name: "Broccoli", Category: "Vegetables", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 34, ProteinPer100g: 2.8, CarbsPer100g: 7.0, FatPer100g: 0.4},
		{Name: "Spinach", Category: "Vegetables", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 23, ProteinPer100g: 2.9, CarbsPer100g: 3.6, FatPer100g: 0.4},
		{Name: "Carrot", Category: "Vegetables", ServingUnit: "carrot (60g)", ServingSize: 60, CaloriesPer100g: 41, ProteinPer100g: 0.9, CarbsPer100g: 9.6, FatPer100g: 0.2},
		{Name: "Cucumber", Category: "Vegetables", ServingUnit: "cucumber (150g)", ServingSize: 150, CaloriesPer100g: 15, ProteinPer100g: 0.7, CarbsPer100g: 3.6, FatPer100g: 0.1},
		{Name: "Tomato", Category: "Vegetables", ServingUnit: "tomato (120g)", ServingSize: 120, CaloriesPer100g: 18, ProteinPer100g: 0.9, CarbsPer100g: 3.9, FatPer100g: 0.2},
		{Name: "Bell Pepper", Category: "Vegetables", ServingUnit: "pepper (120g)", ServingSize: 120, CaloriesPer100g: 26, ProteinPer100g: 1.0, CarbsPer100g: 6.0, FatPer100g: 0.3},
		{Name: "Onion", Category: "Vegetables", ServingUnit: "onion (110g)", ServingSize: 110, CaloriesPer100g: 40, ProteinPer100g: 1.1, CarbsPer100g: 9.3, FatPer100g: 0.1},
		{Name: "Cauliflower", Category: "Vegetables", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 25, ProteinPer100g: 1.9, CarbsPer100g: 5.0, FatPer100g: 0.3},
		{Name: "Okra / Bhindi (Lady Finger)", Category: "Vegetables", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 33, ProteinPer100g: 1.9, CarbsPer100g: 7.5, FatPer100g: 0.2},
		{Name: "Bottle Gourd (Lauki)", Category: "Vegetables", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 15, ProteinPer100g: 0.6, CarbsPer100g: 3.4, FatPer100g: 0.0},
		{Name: "Bitter Gourd (Karela)", Category: "Vegetables", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 17, ProteinPer100g: 1.0, CarbsPer100g: 3.7, FatPer100g: 0.2},
		{Name: "Brinjal / Eggplant (Baingan)", Category: "Vegetables", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 25, ProteinPer100g: 1.0, CarbsPer100g: 5.9, FatPer100g: 0.2},
		{Name: "Cabbage (Patta Gobhi)", Category: "Vegetables", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 25, ProteinPer100g: 1.3, CarbsPer100g: 5.8, FatPer100g: 0.1},
		{Name: "Green Peas (Matar)", Category: "Vegetables", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 81, ProteinPer100g: 5.4, CarbsPer100g: 14.5, FatPer100g: 0.4},
		{Name: "French Beans (Green Beans)", Category: "Vegetables", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 31, ProteinPer100g: 1.8, CarbsPer100g: 7.0, FatPer100g: 0.2},
		{Name: "Beetroot", Category: "Vegetables", ServingUnit: "piece (100g)", ServingSize: 100, CaloriesPer100g: 43, ProteinPer100g: 1.6, CarbsPer100g: 9.6, FatPer100g: 0.2},
		{Name: "Radish (Mooli)", Category: "Vegetables", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 16, ProteinPer100g: 0.7, CarbsPer100g: 3.4, FatPer100g: 0.1},
		{Name: "Pumpkin (Kaddu)", Category: "Vegetables", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 26, ProteinPer100g: 1.0, CarbsPer100g: 6.5, FatPer100g: 0.1},
		{Name: "Mushroom (Button)", Category: "Vegetables", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 22, ProteinPer100g: 3.1, CarbsPer100g: 3.3, FatPer100g: 0.3},
		{Name: "Sweet Corn", Category: "Vegetables", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 86, ProteinPer100g: 3.3, CarbsPer100g: 18.7, FatPer100g: 1.4},
		{Name: "Zucchini", Category: "Vegetables", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 17, ProteinPer100g: 1.2, CarbsPer100g: 3.1, FatPer100g: 0.3},
		{Name: "Lettuce", Category: "Vegetables", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 15, ProteinPer100g: 1.4, CarbsPer100g: 2.9, FatPer100g: 0.2},
		{Name: "Ridge Gourd (Turai)", Category: "Vegetables", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 20, ProteinPer100g: 1.2, CarbsPer100g: 4.4, FatPer100g: 0.2},
		{Name: "Drumstick (Moringa)", Category: "Vegetables", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 37, ProteinPer100g: 2.1, CarbsPer100g: 8.5, FatPer100g: 0.2},
		{Name: "Pointed Gourd (Parwal)", Category: "Vegetables", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 20, ProteinPer100g: 2.0, CarbsPer100g: 2.2, FatPer100g: 0.3},
		{Name: "Fenugreek Leaves (Methi)", Category: "Vegetables", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 49, ProteinPer100g: 4.4, CarbsPer100g: 6.0, FatPer100g: 0.9},

		// Fruits
		{Name: "Banana", Category: "Fruits", ServingUnit: "banana (118g)", ServingSize: 118, CaloriesPer100g: 89, ProteinPer100g: 1.1, CarbsPer100g: 22.8, FatPer100g: 0.3},
		{Name: "Apple", Category: "Fruits", ServingUnit: "apple (180g)", ServingSize: 180, CaloriesPer100g: 52, ProteinPer100g: 0.3, CarbsPer100g: 13.8, FatPer100g: 0.2},
		{Name: "Orange", Category: "Fruits", ServingUnit: "orange (130g)", ServingSize: 130, CaloriesPer100g: 47, ProteinPer100g: 0.9, CarbsPer100g: 11.8, FatPer100g: 0.1},
		{Name: "Strawberries", Category: "Fruits", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 32, ProteinPer100g: 0.7, CarbsPer100g: 7.7, FatPer100g: 0.3},
		{Name: "Blueberries", Category: "Fruits", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 57, ProteinPer100g: 0.7, CarbsPer100g: 14.5, FatPer100g: 0.3},
		{Name: "Avocado", Category: "Fruits", ServingUnit: "avocado (150g)", ServingSize: 150, CaloriesPer100g: 160, ProteinPer100g: 2.0, CarbsPer100g: 8.5, FatPer100g: 14.7},
		{Name: "Watermelon", Category: "Fruits", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 30, ProteinPer100g: 0.6, CarbsPer100g: 7.6, FatPer100g: 0.2},
		{Name: "Mango", Category: "Fruits", ServingUnit: "mango (200g)", ServingSize: 200, CaloriesPer100g: 60, ProteinPer100g: 0.8, CarbsPer100g: 15.0, FatPer100g: 0.4},
		{Name: "Papaya", Category: "Fruits", ServingUnit: "bowl (150g)", ServingSize: 150, CaloriesPer100g: 43, ProteinPer100g: 0.5, CarbsPer100g: 10.8, FatPer100g: 0.3},
		{Name: "Guava", Category: "Fruits", ServingUnit: "guava (100g)", ServingSize: 100, CaloriesPer100g: 68, ProteinPer100g: 2.6, CarbsPer100g: 14.3, FatPer100g: 1.0},
		{Name: "Pomegranate", Category: "Fruits", ServingUnit: "bowl (150g)", ServingSize: 150, CaloriesPer100g: 83, ProteinPer100g: 1.7, CarbsPer100g: 18.7, FatPer100g: 1.2},
		{Name: "Grapes", Category: "Fruits", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 69, ProteinPer100g: 0.7, CarbsPer100g: 18.1, FatPer100g: 0.2},
		{Name: "Pineapple", Category: "Fruits", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 50, ProteinPer100g: 0.5, CarbsPer100g: 13.1, FatPer100g: 0.1},
		{Name: "Dates (Khajoor)", Category: "Fruits", ServingUnit: "date (8g)", ServingSize: 8, CaloriesPer100g: 282, ProteinPer100g: 2.5, CarbsPer100g: 75.0, FatPer100g: 0.4},

		// Legumes, Nuts & Seeds
		{Name: "Almonds", Category: "Nuts & Seeds", ServingUnit: "handful (28g)", ServingSize: 28, CaloriesPer100g: 579, ProteinPer100g: 21.2, CarbsPer100g: 21.6, FatPer100g: 49.9},
		{Name: "Peanuts", Category: "Nuts & Seeds", ServingUnit: "handful (28g)", ServingSize: 28, CaloriesPer100g: 567, ProteinPer100g: 25.8, CarbsPer100g: 16.1, FatPer100g: 49.2},
		{Name: "Walnuts", Category: "Nuts & Seeds", ServingUnit: "handful (28g)", ServingSize: 28, CaloriesPer100g: 654, ProteinPer100g: 15.2, CarbsPer100g: 13.7, FatPer100g: 65.2},
		{Name: "Cashews (Kaju)", Category: "Nuts & Seeds", ServingUnit: "handful (28g)", ServingSize: 28, CaloriesPer100g: 553, ProteinPer100g: 18.2, CarbsPer100g: 30.2, FatPer100g: 43.9},
		{Name: "Peanut Butter", Category: "Nuts & Seeds", ServingUnit: "tbsp (16g)", ServingSize: 16, CaloriesPer100g: 588, ProteinPer100g: 25.1, CarbsPer100g: 20.0, FatPer100g: 50.4},
		{Name: "Chia Seeds", Category: "Nuts & Seeds", ServingUnit: "tbsp (12g)", ServingSize: 12, CaloriesPer100g: 486, ProteinPer100g: 16.5, CarbsPer100g: 42.1, FatPer100g: 30.7},
		{Name: "Flax Seeds", Category: "Nuts & Seeds", ServingUnit: "tbsp (10g)", ServingSize: 10, CaloriesPer100g: 534, ProteinPer100g: 18.3, CarbsPer100g: 28.9, FatPer100g: 42.2},
		{Name: "Lentils (Cooked)", Category: "Legumes", ServingUnit: "bowl (150g)", ServingSize: 150, CaloriesPer100g: 116, ProteinPer100g: 9.0, CarbsPer100g: 20.1, FatPer100g: 0.4},
		{Name: "Chickpeas / Garbanzo (Cooked)", Category: "Legumes", ServingUnit: "bowl (150g)", ServingSize: 150, CaloriesPer100g: 164, ProteinPer100g: 8.9, CarbsPer100g: 27.4, FatPer100g: 2.6},
		{Name: "Black Beans (Cooked)", Category: "Legumes", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 132, ProteinPer100g: 8.9, CarbsPer100g: 23.7, FatPer100g: 0.5},
		{Name: "Tofu (Firm)", Category: "Legumes", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 76, ProteinPer100g: 8.1, CarbsPer100g: 1.9, FatPer100g: 4.8},
		{Name: "Sprouted Moong", Category: "Legumes", ServingUnit: "bowl (100g)", ServingSize: 100, CaloriesPer100g: 98, ProteinPer100g: 7.5, CarbsPer100g: 16.0, FatPer100g: 0.5},
		{Name: "Soya Chunks (Dry)", Category: "Legumes", ServingUnit: "bowl (50g)", ServingSize: 50, CaloriesPer100g: 345, ProteinPer100g: 52.0, CarbsPer100g: 33.0, FatPer100g: 0.5},
		{Name: "Soya Chunks (Boiled)", Category: "Legumes", ServingUnit: "100g", ServingSize: 100, CaloriesPer100g: 115, ProteinPer100g: 17.3, CarbsPer100g: 11.0, FatPer100g: 0.2},
		{Name: "Roasted Chana", Category: "Legumes", ServingUnit: "handful (30g)", ServingSize: 30, CaloriesPer100g: 369, ProteinPer100g: 18.6, CarbsPer100g: 58.0, FatPer100g: 6.5},

		// Fats & Oils
		{Name: "Olive Oil", Category: "Fats & Oils", ServingUnit: "tbsp (14g)", ServingSize: 14, CaloriesPer100g: 884, ProteinPer100g: 0.0, CarbsPer100g: 0.0, FatPer100g: 100.0},
		{Name: "Butter", Category: "Fats & Oils", ServingUnit: "pat (10g)", ServingSize: 10, CaloriesPer100g: 717, ProteinPer100g: 0.9, CarbsPer100g: 0.1, FatPer100g: 81.1},
		{Name: "Ghee (Clarified Butter)", Category: "Fats & Oils", ServingUnit: "tsp (5g)", ServingSize: 5, CaloriesPer100g: 900, ProteinPer100g: 0.0, CarbsPer100g: 0.0, FatPer100g: 100.0},
		{Name: "Mustard / Cooking Oil", Category: "Fats & Oils", ServingUnit: "tbsp (14g)", ServingSize: 14, CaloriesPer100g: 884, ProteinPer100g: 0.0, CarbsPer100g: 0.0, FatPer100g: 100.0},

		// Snacks, Supplements & Beverages
		{Name: "Whey Protein Powder", Category: "Supplements", ServingUnit: "scoop (30g)", ServingSize: 30, CaloriesPer100g: 400, ProteinPer100g: 80.0, CarbsPer100g: 6.7, FatPer100g: 5.0},
		{Name: "Dark Chocolate (70-85%)", Category: "Snacks", ServingUnit: "square (20g)", ServingSize: 20, CaloriesPer100g: 598, ProteinPer100g: 7.8, CarbsPer100g: 45.9, FatPer100g: 42.6},
		{Name: "Honey", Category: "Snacks", ServingUnit: "tbsp (21g)", ServingSize: 21, CaloriesPer100g: 304, ProteinPer100g: 0.3, CarbsPer100g: 82.4, FatPer100g: 0.0},
		{Name: "Makhana (Fox Nuts, Roasted)", Category: "Snacks", ServingUnit: "bowl (30g)", ServingSize: 30, CaloriesPer100g: 347, ProteinPer100g: 9.7, CarbsPer100g: 76.9, FatPer100g: 0.1},
		{Name: "Samosa (Potato)", Category: "Snacks", ServingUnit: "samosa (80g)", ServingSize: 80, CaloriesPer100g: 262, ProteinPer100g: 3.5, CarbsPer100g: 24.0, FatPer100g: 17.0},
		{Name: "Marie Biscuit", Category: "Snacks", ServingUnit: "biscuit (6g)", ServingSize: 6, CaloriesPer100g: 440, ProteinPer100g: 7.5, CarbsPer100g: 74.0, FatPer100g: 12.5},
		{Name: "Milk Tea / Chai (with sugar)", Category: "Beverages", ServingUnit: "cup (150ml)", ServingSize: 150, CaloriesPer100g: 65, ProteinPer100g: 2.1, CarbsPer100g: 9.0, FatPer100g: 2.2},
		{Name: "Black Coffee / Espresso", Category: "Beverages", ServingUnit: "cup (200ml)", ServingSize: 200, CaloriesPer100g: 2, ProteinPer100g: 0.1, CarbsPer100g: 0.0, FatPer100g: 0.0},
		{Name: "Milk Coffee (with sugar)", Category: "Beverages", ServingUnit: "cup (200ml)", ServingSize: 200, CaloriesPer100g: 58, ProteinPer100g: 2.0, CarbsPer100g: 7.5, FatPer100g: 2.1},
		{Name: "Coconut Water", Category: "Beverages", ServingUnit: "glass (250ml)", ServingSize: 250, CaloriesPer100g: 19, ProteinPer100g: 0.7, CarbsPer100g: 3.7, FatPer100g: 0.2},
		{Name: "Buttermilk / Chaas", Category: "Beverages", ServingUnit: "glass (250ml)", ServingSize: 250, CaloriesPer100g: 40, ProteinPer100g: 3.3, CarbsPer100g: 4.8, FatPer100g: 0.9},
		{Name: "Sweet Lassi", Category: "Beverages", ServingUnit: "glass (250ml)", ServingSize: 250, CaloriesPer100g: 78, ProteinPer100g: 2.8, CarbsPer100g: 11.5, FatPer100g: 2.3},
	}

	var existing []models.Food
	if err := db.Where("is_custom = ?", false).Find(&existing).Error; err != nil {
		return err
	}

	existingMap := make(map[string]models.Food, len(existing))
	for _, f := range existing {
		existingMap[strings.ToLower(strings.TrimSpace(f.Name))] = f
	}

	var toInsert []models.Food
	for _, item := range initialFoods {
		key := strings.ToLower(strings.TrimSpace(item.Name))
		if found, ok := existingMap[key]; ok {
			if found.ServingUnit != item.ServingUnit || found.ServingSize != item.ServingSize || found.Category != item.Category {
				db.Model(&found).Updates(map[string]interface{}{
					"serving_unit": item.ServingUnit,
					"serving_size": item.ServingSize,
					"category":     item.Category,
				})
			}
			continue
		}
		toInsert = append(toInsert, item)
	}

	if len(toInsert) > 0 {
		if err := db.Create(&toInsert).Error; err != nil {
			log.Printf("Error seeding foods: %v", err)
			return err
		}
		log.Printf("Successfully seeded %d new foods into database (total catalog: %d)", len(toInsert), len(initialFoods))
	}

	return nil
}
