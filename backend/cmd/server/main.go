package main

import (
	"calorie-calculator/config"
	"calorie-calculator/internal/database"
	"calorie-calculator/internal/routes"
	"fmt"
	"log"
)

func main() {
	cfg := config.Load()

	log.Printf("Starting Calorie Calculator API service...")
	log.Printf("Environment: Port=%s, DBDriver=%s", cfg.Port, cfg.DBDriver)

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("Fatal: Database initialization failed: %v", err)
	}

	router := routes.SetupRouter(db, cfg)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Server listening on http://localhost%s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("Server stopped with error: %v", err)
	}
}

