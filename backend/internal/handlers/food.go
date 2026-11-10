package handlers

import (
	"calorie-calculator/internal/middleware"
	"calorie-calculator/internal/models"
	"calorie-calculator/pkg/utils"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type FoodHandler struct {
	DB *gorm.DB
}

func NewFoodHandler(db *gorm.DB) *FoodHandler {
	return &FoodHandler{DB: db}
}

type CreateFoodRequest struct {
	Name            string  `json:"name" binding:"required"`
	Category        string  `json:"category"`
	ServingUnit     string  `json:"serving_unit"`
	ServingSize     float64 `json:"serving_size"`
	CaloriesPer100g float64 `json:"calories_per_100g" binding:"required,min=0"`
	ProteinPer100g  float64 `json:"protein_per_100g" binding:"required,min=0"`
	CarbsPer100g    float64 `json:"carbs_per_100g" binding:"required,min=0"`
	FatPer100g      float64 `json:"fat_per_100g" binding:"required,min=0"`
}

// SearchFoods searches the food database with optional query and category
func (h *FoodHandler) SearchFoods(c *gin.Context) {
	query := strings.TrimSpace(c.Query("q"))
	category := strings.TrimSpace(c.Query("category"))

	var foods []models.Food
	tx := h.DB.Model(&models.Food{})

	// Check if user is authenticated to also show their custom foods
	if userID, ok := middleware.GetUserID(c); ok {
		tx = tx.Where("is_custom = false OR user_id = ?", userID)
	} else {
		tx = tx.Where("is_custom = false")
	}

	if query != "" {
		tx = tx.Where("LOWER(name) LIKE ?", "%"+strings.ToLower(query)+"%")
	}

	if category != "" && category != "All" {
		tx = tx.Where("category = ?", category)
	}

	if err := tx.Order("name ASC").Limit(100).Find(&foods).Error; err != nil {
		utils.JSONInternalError(c, "Failed to fetch foods")
		return
	}

	utils.JSONSuccess(c, foods)
}

// CreateFood adds a new custom food item
func (h *FoodHandler) CreateFood(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		utils.JSONUnauthorized(c, "Unauthorized")
		return
	}

	var req CreateFoodRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONBadRequest(c, err.Error())
		return
	}

	servingUnit := req.ServingUnit
	if servingUnit == "" {
		servingUnit = "g"
	}
	servingSize := req.ServingSize
	if servingSize <= 0 {
		servingSize = 100
	}
	category := req.Category
	if category == "" {
		category = "Custom"
	}

	food := models.Food{
		Name:            strings.TrimSpace(req.Name),
		Category:        category,
		ServingUnit:     servingUnit,
		ServingSize:     servingSize,
		CaloriesPer100g: req.CaloriesPer100g,
		ProteinPer100g:  req.ProteinPer100g,
		CarbsPer100g:    req.CarbsPer100g,
		FatPer100g:      req.FatPer100g,
		IsCustom:        true,
		UserID:          &userID,
	}

	if err := h.DB.Create(&food).Error; err != nil {
		utils.JSONInternalError(c, "Failed to create custom food")
		return
	}

	utils.JSONCreated(c, food, "Food added successfully")
}

