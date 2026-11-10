package config

import (
	"os"

	"github.com/joho/godotenv"
)

// Config holds all backend configurations
type Config struct {
	Port      string
	DBDriver  string // "sqlite" or "postgres"
	DBDSN     string // Database DSN or SQLite file path
	JWTSecret string
	GinMode   string
}

// Load loads the configuration from environment variables or .env file
func Load() *Config {
	_ = godotenv.Load() // Safe to ignore if .env does not exist

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbDriver := os.Getenv("DB_DRIVER")
	if dbDriver == "" {
		dbDriver = "sqlite"
	}

	dbDSN := os.Getenv("DATABASE_URL")
	if dbDSN == "" {
		if dbDriver == "postgres" {
			dbDSN = "host=localhost user=postgres password=postgres dbname=calorie_calculator port=5432 sslmode=disable"
		} else {
			dbDSN = "calorie_calculator.db"
		}
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "calorie-calculator-secret-key-change-in-production-2026"
	}

	ginMode := os.Getenv("GIN_MODE")
	if ginMode == "" {
		ginMode = "debug"
	}

	return &Config{
		Port:      port,
		DBDriver:  dbDriver,
		DBDSN:     dbDSN,
		JWTSecret: jwtSecret,
		GinMode:   ginMode,
	}
}

