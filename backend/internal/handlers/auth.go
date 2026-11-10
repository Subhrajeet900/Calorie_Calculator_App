package handlers

import (
	"calorie-calculator/config"
	"calorie-calculator/internal/calculator"
	"calorie-calculator/internal/models"
	"calorie-calculator/pkg/utils"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AuthHandler struct {
	DB     *gorm.DB
	Config *config.Config
}

func NewAuthHandler(db *gorm.DB, cfg *config.Config) *AuthHandler {
	return &AuthHandler{DB: db, Config: cfg}
}

type RegisterRequest struct {
	Name          string  `json:"name" binding:"required"`
	Email         string  `json:"email" binding:"required,email"`
	Password      string  `json:"password" binding:"required,min=6"`
	Age           int     `json:"age"`
	Gender        string  `json:"gender"`         // male, female
	Height        float64 `json:"height"`         // cm
	Weight        float64 `json:"weight"`         // kg
	ActivityLevel string  `json:"activity_level"` // sedentary, light, moderate, active, very_active
	Goal          string  `json:"goal"`           // lose, maintain, gain
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

// Register creates a new user account with profile and targets
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONBadRequest(c, err.Error())
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))

	// Check if email already registered
	var existing models.User
	if err := h.DB.Where("LOWER(email) = ?", email).First(&existing).Error; err == nil {
		utils.JSONBadRequest(c, "Email is already registered")
		return
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.JSONInternalError(c, "Failed to hash password")
		return
	}

	user := models.User{
		Name:          strings.TrimSpace(req.Name),
		Email:         email,
		PasswordHash:  hashedPassword,
		Age:           req.Age,
		Gender:        strings.ToLower(req.Gender),
		Height:        req.Height,
		Weight:        req.Weight,
		ActivityLevel: strings.ToLower(req.ActivityLevel),
		Goal:          strings.ToLower(req.Goal),
	}

	// Apply default physical stats if missing
	if user.Age <= 0 {
		user.Age = 25
	}
	if user.Height <= 0 {
		user.Height = 175
	}
	if user.Weight <= 0 {
		user.Weight = 70
	}
	if user.Gender == "" {
		user.Gender = "male"
	}
	if user.ActivityLevel == "" {
		user.ActivityLevel = "moderate"
	}
	if user.Goal == "" {
		user.Goal = "maintain"
	}

	// Calculate targets
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

	if err := h.DB.Create(&user).Error; err != nil {
		utils.JSONInternalError(c, "Failed to create user account")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Email, h.Config.JWTSecret)
	if err != nil {
		utils.JSONInternalError(c, "Failed to generate token")
		return
	}

	utils.JSONCreated(c, AuthResponse{
		Token: token,
		User:  user,
	}, "Account registered successfully")
}

// Login verifies credentials and returns a JWT
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONBadRequest(c, err.Error())
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))

	var user models.User
	if err := h.DB.Where("LOWER(email) = ?", email).First(&user).Error; err != nil {
		utils.JSONUnauthorized(c, "Invalid email or password")
		return
	}

	if !utils.CheckPassword(user.PasswordHash, req.Password) {
		utils.JSONUnauthorized(c, "Invalid email or password")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Email, h.Config.JWTSecret)
	if err != nil {
		utils.JSONInternalError(c, "Failed to generate token")
		return
	}

	utils.JSONSuccess(c, AuthResponse{
		Token: token,
		User:  user,
	})
}

