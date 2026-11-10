package handlers

import (
	"calorie-calculator/internal/calculator"
	"calorie-calculator/pkg/utils"

	"github.com/gin-gonic/gin"
)

type CalculatorHandler struct{}

func NewCalculatorHandler() *CalculatorHandler {
	return &CalculatorHandler{}
}

// Calculate computes BMR, TDEE, target calories and macros for input stats
func (h *CalculatorHandler) Calculate(c *gin.Context) {
	var params calculator.CalculationParams
	if err := c.ShouldBindJSON(&params); err != nil {
		utils.JSONBadRequest(c, err.Error())
		return
	}

	result := calculator.CalculateAll(params)
	utils.JSONSuccess(c, result)
}

