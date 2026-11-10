package database

import (
	"calorie-calculator/config"
	"calorie-calculator/internal/models"
	"fmt"
	"log"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Connect connects to the database based on configuration and runs AutoMigrate
func Connect(cfg *config.Config) (*gorm.DB, error) {
	var dialector gorm.Dialector

	if cfg.DBDriver == "postgres" {
		log.Printf("Connecting to PostgreSQL at: %s", cfg.DBDSN)
		dialector = postgres.Open(cfg.DBDSN)
	} else {
		log.Printf("Connecting to SQLite database file: %s", cfg.DBDSN)
		dialector = sqlite.Open(cfg.DBDSN)
	}

	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	}

	db, err := gorm.Open(dialector, gormConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Auto-migrate tables
	err = db.AutoMigrate(
		&models.User{},
		&models.Food{},
		&models.Meal{},
		&models.MealItem{},
		&models.DailyGoal{},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to run database migrations: %w", err)
	}

	// Seed foods
	if err := SeedFoods(db); err != nil {
		log.Printf("Warning: failed to seed foods: %v", err)
	}

	return db, nil
}

