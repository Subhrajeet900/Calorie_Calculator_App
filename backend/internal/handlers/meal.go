package handlers

import (
	"calorie-calculator/internal/calculator"
	"calorie-calculator/internal/middleware"
	"calorie-calculator/internal/models"
	"calorie-calculator/pkg/utils"
	"math"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type MealHandler struct {
	DB *gorm.DB
}

func NewMealHandler(db *gorm.DB) *MealHandler {
	return &MealHandler{DB: db}
}

type MealItemInput struct {
	FoodID   uint    `json:"food_id" binding:"required"`
	Quantity float64 `json:"quantity" binding:"required,min=1"` // in grams
}

type LogMealRequest struct {
	MealType string          `json:"meal_type" binding:"required,oneof=breakfast lunch dinner snack"`
	Date     string          `json:"date" binding:"required"` // YYYY-MM-DD
	Items    []MealItemInput `json:"items" binding:"required,min=1"`
}

type DaySummary struct {
	Date              string                      `json:"date"`
	TargetCalories    float64                     `json:"target_calories"`
	TargetProtein     float64                     `json:"target_protein"`
	TargetCarbs       float64                     `json:"target_carbs"`
	TargetFat         float64                     `json:"target_fat"`
	TotalCalories     float64                     `json:"total_calories"`
	TotalProtein      float64                     `json:"total_protein"`
	TotalCarbs        float64                     `json:"total_carbs"`
	TotalFat          float64                     `json:"total_fat"`
	RemainingCalories float64                     `json:"remaining_calories"`
	RemainingProtein  float64                     `json:"remaining_protein"`
	RemainingCarbs    float64                     `json:"remaining_carbs"`
	RemainingFat      float64                     `json:"remaining_fat"`
	Meals             []models.Meal               `json:"meals"`
	MealTotals        map[string]MealTypeSummary  `json:"meal_totals"`
}

type MealTypeSummary struct {
	Calories float64 `json:"calories"`
	Protein  float64 `json:"protein"`
	Carbs    float64 `json:"carbs"`
	Fat      float64 `json:"fat"`
	ItemCount int    `json:"item_count"`
}

// LogMeal creates or appends items to a meal
func (h *MealHandler) LogMeal(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		utils.JSONUnauthorized(c, "Unauthorized")
		return
	}

	var req LogMealRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONBadRequest(c, err.Error())
		return
	}

	mealType := strings.ToLower(req.MealType)
	date := strings.TrimSpace(req.Date)

	// Validate date format YYYY-MM-DD
	if _, err := time.Parse("2006-01-02", date); err != nil {
		utils.JSONBadRequest(c, "Date must be in YYYY-MM-DD format")
		return
	}

	// Find existing meal for this user, date and mealType, or create a new one
	var meal models.Meal
	err := h.DB.Where("user_id = ? AND date = ? AND meal_type = ?", userID, date, mealType).First(&meal).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			meal = models.Meal{
				UserID:   userID,
				MealType: mealType,
				Date:     date,
			}
			if err := h.DB.Create(&meal).Error; err != nil {
				utils.JSONInternalError(c, "Failed to create meal")
				return
			}
		} else {
			utils.JSONInternalError(c, "Database error")
			return
		}
	}

	// Add meal items
	for _, itemInput := range req.Items {
		var food models.Food
		if err := h.DB.First(&food, itemInput.FoodID).Error; err != nil {
			utils.JSONBadRequest(c, "Invalid food_id: not found")
			return
		}

		kcal, prot, carbs, fat := calculator.CalculateItemNutrition(
			food.CaloriesPer100g,
			food.ProteinPer100g,
			food.CarbsPer100g,
			food.FatPer100g,
			itemInput.Quantity,
		)

		mealItem := models.MealItem{
			MealID:   meal.ID,
			FoodID:   food.ID,
			Quantity: itemInput.Quantity,
			Calories: kcal,
			Protein:  prot,
			Carbs:    carbs,
			Fat:      fat,
		}

		if err := h.DB.Create(&mealItem).Error; err != nil {
			utils.JSONInternalError(c, "Failed to log meal item")
			return
		}
	}

	// Fetch full meal with preloaded items and foods
	if err := h.DB.Preload("Items.Food").First(&meal, meal.ID).Error; err != nil {
		utils.JSONInternalError(c, "Failed to reload meal")
		return
	}

	utils.JSONCreated(c, meal, "Meal logged successfully")
}

// GetMealsForDay returns all meals and day totals for a given date
func (h *MealHandler) GetMealsForDay(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		utils.JSONUnauthorized(c, "Unauthorized")
		return
	}

	date := strings.TrimSpace(c.Query("date"))
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}

	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		utils.JSONNotFound(c, "User not found")
		return
	}

	var meals []models.Meal
	if err := h.DB.Where("user_id = ? AND date = ?", userID, date).
		Preload("Items.Food").
		Find(&meals).Error; err != nil {
		utils.JSONInternalError(c, "Failed to fetch meals")
		return
	}

	var totalKcal, totalProt, totalCarbs, totalFat float64
	mealTotals := map[string]MealTypeSummary{
		"breakfast": {},
		"lunch":     {},
		"dinner":    {},
		"snack":     {},
	}

	for _, m := range meals {
		mType := strings.ToLower(m.MealType)
		summary := mealTotals[mType]

		for _, item := range m.Items {
			totalKcal += item.Calories
			totalProt += item.Protein
			totalCarbs += item.Carbs
			totalFat += item.Fat

			summary.Calories += item.Calories
			summary.Protein += item.Protein
			summary.Carbs += item.Carbs
			summary.Fat += item.Fat
			summary.ItemCount++
		}

		summary.Calories = math.Round(summary.Calories*10.0) / 10.0
		summary.Protein = math.Round(summary.Protein*10.0) / 10.0
		summary.Carbs = math.Round(summary.Carbs*10.0) / 10.0
		summary.Fat = math.Round(summary.Fat*10.0) / 10.0

		mealTotals[mType] = summary
	}

	totalKcal = math.Round(totalKcal*10.0) / 10.0
	totalProt = math.Round(totalProt*10.0) / 10.0
	totalCarbs = math.Round(totalCarbs*10.0) / 10.0
	totalFat = math.Round(totalFat*10.0) / 10.0

	remKcal := math.Round((user.TargetCalories-totalKcal)*10.0) / 10.0
	remProt := math.Round((user.TargetProtein-totalProt)*10.0) / 10.0
	remCarbs := math.Round((user.TargetCarbs-totalCarbs)*10.0) / 10.0
	remFat := math.Round((user.TargetFat-totalFat)*10.0) / 10.0

	utils.JSONSuccess(c, DaySummary{
		Date:              date,
		TargetCalories:    user.TargetCalories,
		TargetProtein:     user.TargetProtein,
		TargetCarbs:       user.TargetCarbs,
		TargetFat:         user.TargetFat,
		TotalCalories:     totalKcal,
		TotalProtein:      totalProt,
		TotalCarbs:        totalCarbs,
		TotalFat:          totalFat,
		RemainingCalories: remKcal,
		RemainingProtein:  remProt,
		RemainingCarbs:    remCarbs,
		RemainingFat:      remFat,
		Meals:             meals,
		MealTotals:        mealTotals,
	})
}

// DeleteMeal removes an entire logged meal
func (h *MealHandler) DeleteMeal(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		utils.JSONUnauthorized(c, "Unauthorized")
		return
	}

	idParam := c.Param("id")
	mealID, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		utils.JSONBadRequest(c, "Invalid meal ID")
		return
	}

	var meal models.Meal
	if err := h.DB.Where("id = ? AND user_id = ?", mealID, userID).First(&meal).Error; err != nil {
		utils.JSONNotFound(c, "Meal not found")
		return
	}

	// Delete items then meal
	h.DB.Where("meal_id = ?", meal.ID).Delete(&models.MealItem{})
	if err := h.DB.Delete(&meal).Error; err != nil {
		utils.JSONInternalError(c, "Failed to delete meal")
		return
	}

	utils.JSONSuccess(c, gin.H{"deleted": true, "meal_id": mealID})
}

// DeleteMealItem removes a single item from a meal
func (h *MealHandler) DeleteMealItem(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		utils.JSONUnauthorized(c, "Unauthorized")
		return
	}

	idParam := c.Param("id")
	itemID, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		utils.JSONBadRequest(c, "Invalid meal item ID")
		return
	}

	var item models.MealItem
	if err := h.DB.First(&item, itemID).Error; err != nil {
		utils.JSONNotFound(c, "Meal item not found")
		return
	}

	// Ensure the parent meal belongs to the user
	var meal models.Meal
	if err := h.DB.Where("id = ? AND user_id = ?", item.MealID, userID).First(&meal).Error; err != nil {
		utils.JSONUnauthorized(c, "You do not own this meal item")
		return
	}

	if err := h.DB.Delete(&item).Error; err != nil {
		utils.JSONInternalError(c, "Failed to delete meal item")
		return
	}

	// If meal now has no items, optionally clean up meal
	var remainingCount int64
	h.DB.Model(&models.MealItem{}).Where("meal_id = ?", meal.ID).Count(&remainingCount)
	if remainingCount == 0 {
		h.DB.Delete(&meal)
	}

	utils.JSONSuccess(c, gin.H{"deleted": true, "meal_item_id": itemID})
}

