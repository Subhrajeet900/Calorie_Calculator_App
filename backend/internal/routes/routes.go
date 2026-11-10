package routes

import (
	"calorie-calculator/config"
	"calorie-calculator/internal/handlers"
	"calorie-calculator/internal/middleware"
	"calorie-calculator/pkg/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupRouter registers all application routes
func SetupRouter(db *gorm.DB, cfg *config.Config) *gin.Engine {
	if cfg.GinMode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()
	r.Use(middleware.CORS())

	authHandler := handlers.NewAuthHandler(db, cfg)
	userHandler := handlers.NewUserHandler(db)
	calcHandler := handlers.NewCalculatorHandler()
	foodHandler := handlers.NewFoodHandler(db)
	mealHandler := handlers.NewMealHandler(db)
	progHandler := handlers.NewProgressHandler(db)

	api := r.Group("/api")
	{
		// Health check
		api.GET("/health", func(c *gin.Context) {
			utils.JSONSuccess(c, gin.H{
				"status":  "healthy",
				"service": "Calorie Calculator API",
				"driver":  cfg.DBDriver,
			})
		})

		// Public endpoints
		api.POST("/auth/register", authHandler.Register)
		api.POST("/auth/login", authHandler.Login)
		api.POST("/calculate", calcHandler.Calculate)
		api.GET("/foods", foodHandler.SearchFoods)

		// Protected endpoints
		protected := api.Group("")
		protected.Use(middleware.AuthRequired(cfg.JWTSecret))
		{
			// User Profile
			protected.GET("/user/profile", userHandler.GetProfile)
			protected.PUT("/user/profile", userHandler.UpdateProfile)

			// Foods (Custom)
			protected.POST("/foods", foodHandler.CreateFood)

			// Meals
			protected.POST("/meals", mealHandler.LogMeal)
			protected.GET("/meals", mealHandler.GetMealsForDay)
			protected.DELETE("/meals/:id", mealHandler.DeleteMeal)
			protected.DELETE("/meals/items/:id", mealHandler.DeleteMealItem)

			// Progress History
			protected.GET("/progress/week", progHandler.GetWeeklyProgress)
		}
	}

	return r
}

