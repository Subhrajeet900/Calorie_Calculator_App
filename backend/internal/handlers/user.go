package handlers

import (
	"calorie-calculator/internal/calculator"
	"calorie-calculator/internal/middleware"
	"calorie-calculator/internal/models"
	"calorie-calculator/pkg/utils"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UserHandler struct {
	DB *gorm.DB
}

func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{DB: db}
}

type UpdateProfileRequest struct {
	Name          string  `json:"name"`
	Age           int     `json:"age" binding:"omitempty,min=10,max=120"`
	Gender        string  `json:"gender" binding:"omitempty,oneof=male female"`
	Height        float64 `json:"height" binding:"omitempty,min=50,max=260"`
	Weight        float64 `json:"weight" binding:"omitempty,min=20,max=400"`
	ActivityLevel string  `json:"activity_level" binding:"omitempty,oneof=sedentary light moderate active very_active"`
	Goal          string  `json:"goal" binding:"omitempty,oneof=lose maintain gain"`
}

// GetProfile returns the current logged-in user profile
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		utils.JSONUnauthorized(c, "Unauthorized")
		return
	}

	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		utils.JSONNotFound(c, "User not found")
		return
	}

	utils.JSONSuccess(c, user)
}

// UpdateProfile updates the user's physical parameters and recalculates targets
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		utils.JSONUnauthorized(c, "Unauthorized")
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONBadRequest(c, err.Error())
		return
	}

	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		utils.JSONNotFound(c, "User not found")
		return
	}

	if req.Name != "" {
		user.Name = strings.TrimSpace(req.Name)
	}
	if req.Age > 0 {
		user.Age = req.Age
	}
	if req.Gender != "" {
		user.Gender = strings.ToLower(req.Gender)
	}
	if req.Height > 0 {
		user.Height = req.Height
	}
	if req.Weight > 0 {
		user.Weight = req.Weight
	}
	if req.ActivityLevel != "" {
		user.ActivityLevel = strings.ToLower(req.ActivityLevel)
	}
	if req.Goal != "" {
		user.Goal = strings.ToLower(req.Goal)
	}

	// Recalculate BMR, TDEE, and macros
	calcResult := calculator.CalculateAll(calculator.CalculationParams{
		Age:           user.Age,
		Gender:        user.Gender,
		Height:        user.Height,
		Weight:        user.Weight,
		ActivityLevel: user.ActivityLevel,
		Goal:          user.Goal,
	})

	user.BMR = calcResult.BMR
	user.TDEE = calcResult.TDEE
	user.TargetCalories = calcResult.TargetCalories
	user.TargetProtein = calcResult.TargetProtein
	user.TargetCarbs = calcResult.TargetCarbs
	user.TargetFat = calcResult.TargetFat

	if err := h.DB.Save(&user).Error; err != nil {
		utils.JSONInternalError(c, "Failed to update profile")
		return
	}

	utils.JSONSuccess(c, user)
}

