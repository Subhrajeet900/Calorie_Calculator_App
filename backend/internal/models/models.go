package models

import (
	"time"
)

// User represents a registered user
type User struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	Name           string    `gorm:"size:100;not null" json:"name"`
	Email          string    `gorm:"size:191;uniqueIndex;not null" json:"email"`
	PasswordHash   string    `gorm:"not null" json:"-"`
	Age            int       `json:"age"`
	Gender         string    `gorm:"size:10" json:"gender"` // male, female
	Height         float64   `json:"height"`                // in cm
	Weight         float64   `json:"weight"`                // in kg
	ActivityLevel  string    `gorm:"size:20" json:"activity_level"`
	Goal           string    `gorm:"size:20" json:"goal"` // lose, maintain, gain
	BMR            float64   `json:"bmr"`
	TDEE           float64   `json:"tdee"`
	TargetCalories float64   `json:"target_calories"`
	TargetProtein  float64   `json:"target_protein"`
	TargetCarbs    float64   `json:"target_carbs"`
	TargetFat      float64   `json:"target_fat"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// Food represents a food item in the database
type Food struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Name            string    `gorm:"size:191;index;not null" json:"name"`
	Category        string    `gorm:"size:100;index" json:"category"`
	ServingUnit     string    `gorm:"size:50;default:'g'" json:"serving_unit"`
	ServingSize     float64   `gorm:"default:100" json:"serving_size"`
	CaloriesPer100g float64   `gorm:"not null" json:"calories_per_100g"`
	ProteinPer100g  float64   `gorm:"not null" json:"protein_per_100g"`
	CarbsPer100g    float64   `gorm:"not null" json:"carbs_per_100g"`
	FatPer100g      float64   `gorm:"not null" json:"fat_per_100g"`
	IsCustom        bool      `gorm:"default:false" json:"is_custom"`
	UserID          *uint     `gorm:"index" json:"user_id,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// Meal represents a logged meal session for a user (Breakfast, Lunch, Dinner, Snack)
type Meal struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	UserID    uint       `gorm:"index;not null" json:"user_id"`
	MealType  string     `gorm:"size:20;not null" json:"meal_type"` // breakfast, lunch, dinner, snack
	Date      string     `gorm:"size:20;index;not null" json:"date"` // YYYY-MM-DD
	Items     []MealItem `gorm:"foreignKey:MealID;constraint:OnDelete:CASCADE" json:"items"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

// MealItem represents an individual food item and quantity in a meal
type MealItem struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	MealID    uint      `gorm:"index;not null" json:"meal_id"`
	FoodID    uint      `gorm:"index;not null" json:"food_id"`
	Food      Food      `gorm:"foreignKey:FoodID" json:"food"`
	Quantity  float64   `gorm:"not null" json:"quantity"` // in grams
	Calories  float64   `gorm:"not null" json:"calories"`
	Protein   float64   `gorm:"not null" json:"protein"`
	Carbs     float64   `gorm:"not null" json:"carbs"`
	Fat       float64   `gorm:"not null" json:"fat"`
	CreatedAt time.Time `json:"created_at"`
}

// DailyGoal stores historical or custom daily targets for a user
type DailyGoal struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	UserID        uint      `gorm:"uniqueIndex:idx_user_date;not null" json:"user_id"`
	Date          string    `gorm:"size:20;uniqueIndex:idx_user_date;not null" json:"date"` // YYYY-MM-DD
	TargetKcal    float64   `gorm:"not null" json:"target_kcal"`
	TargetProtein float64   `gorm:"not null" json:"target_protein"`
	TargetCarbs   float64   `gorm:"not null" json:"target_carbs"`
	TargetFat     float64   `gorm:"not null" json:"target_fat"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

