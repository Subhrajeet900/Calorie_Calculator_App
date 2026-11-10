package calculator

import (
	"math"
	"strings"
)

// CalculationParams holds user profile parameters for calorie & macro calculation
type CalculationParams struct {
	Age           int     `json:"age" binding:"required,min=10,max=120"`
	Gender        string  `json:"gender" binding:"required,oneof=male female"`
	Height        float64 `json:"height" binding:"required,min=50,max=260"` // in cm
	Weight        float64 `json:"weight" binding:"required,min=20,max=400"` // in kg
	ActivityLevel string  `json:"activity_level" binding:"required,oneof=sedentary light moderate active very_active"`
	Goal          string  `json:"goal" binding:"required,oneof=lose maintain gain"`
}

// CalculationResult holds the calculated calorie and macro targets
type CalculationResult struct {
	BMR            float64 `json:"bmr"`
	TDEE           float64 `json:"tdee"`
	TargetCalories float64 `json:"target_calories"`
	TargetProtein  float64 `json:"target_protein"` // grams (30%)
	TargetCarbs    float64 `json:"target_carbs"`   // grams (45%)
	TargetFat      float64 `json:"target_fat"`     // grams (25%)
}

// ActivityMultipliers map for TDEE calculation
var ActivityMultipliers = map[string]float64{
	"sedentary":   1.2,
	"light":       1.375,
	"moderate":    1.55,
	"active":      1.725,
	"very_active": 1.9,
}

// CalculateBMR computes Basal Metabolic Rate using the Mifflin-St Jeor equation:
// Men:   10 * kg + 6.25 * cm - 5 * age + 5
// Women: 10 * kg + 6.25 * cm - 5 * age - 161
func CalculateBMR(gender string, weightKg, heightCm float64, age int) float64 {
	base := (10.0 * weightKg) + (6.25 * heightCm) - (5.0 * float64(age))
	if strings.ToLower(gender) == "male" {
		return base + 5.0
	}
	return base - 161.0
}

// CalculateTDEE computes Total Daily Energy Expenditure = BMR * activity factor
func CalculateTDEE(bmr float64, activityLevel string) float64 {
	factor, ok := ActivityMultipliers[strings.ToLower(activityLevel)]
	if !ok {
		factor = 1.2
	}
	return bmr * factor
}

// AdjustForGoal adjusts TDEE according to user's fitness goal:
// - lose:     TDEE - 500 kcal
// - maintain: TDEE
// - gain:     TDEE + 300 kcal
func AdjustForGoal(tdee float64, goal string) float64 {
	switch strings.ToLower(goal) {
	case "lose":
		target := tdee - 500.0
		if target < 1000.0 {
			return 1000.0 // Safe lower floor
		}
		return target
	case "gain":
		return tdee + 300.0
	default: // maintain
		return tdee
	}
}

// CalculateMacros calculates daily macro breakdown in grams:
// - Protein: 30% of target kcal (4 kcal/g)
// - Carbs:   45% of target kcal (4 kcal/g)
// - Fat:     25% of target kcal (9 kcal/g)
func CalculateMacros(targetKcal float64) (protein, carbs, fat float64) {
	proteinKcal := targetKcal * 0.30
	carbsKcal := targetKcal * 0.45
	fatKcal := targetKcal * 0.25

	proteinGrams := proteinKcal / 4.0
	carbsGrams := carbsKcal / 4.0
	fatGrams := fatKcal / 9.0

	return roundTo1Decimal(proteinGrams), roundTo1Decimal(carbsGrams), roundTo1Decimal(fatGrams)
}

// CalculateAll computes BMR, TDEE, Target Calories and Macro breakdown
func CalculateAll(p CalculationParams) CalculationResult {
	bmr := CalculateBMR(p.Gender, p.Weight, p.Height, p.Age)
	tdee := CalculateTDEE(bmr, p.ActivityLevel)
	targetKcal := AdjustForGoal(tdee, p.Goal)
	protein, carbs, fat := CalculateMacros(targetKcal)

	return CalculationResult{
		BMR:            roundTo1Decimal(bmr),
		TDEE:           roundTo1Decimal(tdee),
		TargetCalories: math.Round(targetKcal),
		TargetProtein:  protein,
		TargetCarbs:    carbs,
		TargetFat:      fat,
	}
}

// CalculateItemNutrition calculates nutritional values for a given quantity of food
func CalculateItemNutrition(cal100g, prot100g, carb100g, fat100g, quantityGrams float64) (kcal, prot, carbs, fat float64) {
	ratio := quantityGrams / 100.0
	return roundTo1Decimal(cal100g * ratio),
		roundTo1Decimal(prot100g * ratio),
		roundTo1Decimal(carb100g * ratio),
		roundTo1Decimal(fat100g * ratio)
}

func roundTo1Decimal(v float64) float64 {
	return math.Round(v*10.0) / 10.0
}

