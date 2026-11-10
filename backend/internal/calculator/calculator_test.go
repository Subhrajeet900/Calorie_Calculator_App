package calculator

import (
	"math"
	"testing"
)

func TestCalculateBMR(t *testing.T) {
	// Men: 10 * 80 + 6.25 * 180 - 5 * 25 + 5 = 800 + 1125 - 125 + 5 = 1805
	bmrMale := CalculateBMR("male", 80, 180, 25)
	if math.Abs(bmrMale-1805.0) > 0.001 {
		t.Errorf("Expected male BMR 1805, got %v", bmrMale)
	}

	// Women: 10 * 60 + 6.25 * 165 - 5 * 28 - 161 = 600 + 1031.25 - 140 - 161 = 1330.25
	bmrFemale := CalculateBMR("female", 60, 165, 28)
	if math.Abs(bmrFemale-1330.25) > 0.001 {
		t.Errorf("Expected female BMR 1330.25, got %v", bmrFemale)
	}
}

func TestCalculateTDEE(t *testing.T) {
	bmr := 1800.0

	tests := []struct {
		activity string
		expected float64
	}{
		{"sedentary", 1800.0 * 1.2},
		{"light", 1800.0 * 1.375},
		{"moderate", 1800.0 * 1.55},
		{"active", 1800.0 * 1.725},
		{"very_active", 1800.0 * 1.9},
	}

	for _, tc := range tests {
		got := CalculateTDEE(bmr, tc.activity)
		if math.Abs(got-tc.expected) > 0.001 {
			t.Errorf("For activity %s, expected %v, got %v", tc.activity, tc.expected, got)
		}
	}
}

func TestAdjustForGoal(t *testing.T) {
	tdee := 2200.0

	// Lose: TDEE - 500
	if got := AdjustForGoal(tdee, "lose"); got != 1700.0 {
		t.Errorf("Lose weight expected 1700, got %v", got)
	}

	// Maintain: TDEE
	if got := AdjustForGoal(tdee, "maintain"); got != 2200.0 {
		t.Errorf("Maintain expected 2200, got %v", got)
	}

	// Gain: TDEE + 300
	if got := AdjustForGoal(tdee, "gain"); got != 2500.0 {
		t.Errorf("Gain weight expected 2500, got %v", got)
	}
}

func TestCalculateMacros(t *testing.T) {
	// For 2000 kcal:
	// Protein: 30% of 2000 = 600 kcal / 4 = 150g
	// Carbs: 45% of 2000 = 900 kcal / 4 = 225g
	// Fat: 25% of 2000 = 500 kcal / 9 = 55.6g
	p, c, f := CalculateMacros(2000)

	if p != 150.0 {
		t.Errorf("Expected protein 150g, got %v", p)
	}
	if c != 225.0 {
		t.Errorf("Expected carbs 225g, got %v", c)
	}
	if f != 55.6 {
		t.Errorf("Expected fat 55.6g, got %v", f)
	}
}

func TestCalculateItemNutrition(t *testing.T) {
	// Chicken breast per 100g: 165 kcal, 31g protein, 0g carbs, 3.6g fat
	// 200g should be 2x
	kcal, prot, carbs, fat := CalculateItemNutrition(165, 31, 0, 3.6, 200)

	if kcal != 330.0 {
		t.Errorf("Expected 330 kcal, got %v", kcal)
	}
	if prot != 62.0 {
		t.Errorf("Expected 62 prot, got %v", prot)
	}
	if carbs != 0.0 {
		t.Errorf("Expected 0 carbs, got %v", carbs)
	}
	if fat != 7.2 {
		t.Errorf("Expected 7.2 fat, got %v", fat)
	}
}

