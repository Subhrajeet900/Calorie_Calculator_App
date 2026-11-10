package handlers_test

import (
	"bytes"
	"calorie-calculator/config"
	"calorie-calculator/internal/database"
	"calorie-calculator/internal/routes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

func setupTestApp(t *testing.T) (*gin.Engine, func()) {
	gin.SetMode(gin.TestMode)

	// Unique test db file to avoid locking issues
	dbFile := fmt.Sprintf("test_db_%d.db", time.Now().UnixNano())
	cfg := &config.Config{
		Port:      "8080",
		DBDriver:  "sqlite",
		DBDSN:     dbFile,
		JWTSecret: "test-jwt-secret-key-123",
		GinMode:   "test",
	}

	db, err := database.Connect(cfg)
	if err != nil {
		t.Fatalf("Failed to initialize test db: %v", err)
	}

	router := routes.SetupRouter(db, cfg)

	cleanup := func() {
		sqlDB, err := db.DB()
		if err == nil {
			_ = sqlDB.Close()
		}
		_ = os.Remove(dbFile)
	}

	return router, cleanup
}

func performRequest(r http.Handler, method, path string, body interface{}, token string) *httptest.ResponseRecorder {
	var bodyBytes []byte
	if body != nil {
		bodyBytes, _ = json.Marshal(body)
	}

	req, _ := http.NewRequest(method, path, bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func TestHealthCheck(t *testing.T) {
	router, cleanup := setupTestApp(t)
	defer cleanup()

	w := performRequest(router, "GET", "/api/health", nil, "")
	if w.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", w.Code)
	}
}

func TestCalculateEndpoint(t *testing.T) {
	router, cleanup := setupTestApp(t)
	defer cleanup()

	body := map[string]interface{}{
		"age":            25,
		"gender":         "male",
		"height":         180,
		"weight":         80,
		"activity_level": "moderate",
		"goal":           "lose",
	}

	w := performRequest(router, "POST", "/api/calculate", body, "")
	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp struct {
		Success bool `json:"success"`
		Data    struct {
			BMR            float64 `json:"bmr"`
			TDEE           float64 `json:"tdee"`
			TargetCalories float64 `json:"target_calories"`
			TargetProtein  float64 `json:"target_protein"`
			TargetCarbs    float64 `json:"target_carbs"`
			TargetFat      float64 `json:"target_fat"`
		} `json:"data"`
	}

	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse json: %v", err)
	}

	if !resp.Success {
		t.Fatalf("Expected success true")
	}

	// Mifflin-St Jeor: 10*80 + 6.25*180 - 5*25 + 5 = 1805
	if resp.Data.BMR != 1805 {
		t.Errorf("Expected BMR 1805, got %v", resp.Data.BMR)
	}

	// TDEE: 1805 * 1.55 = 2797.75 (round 2797.8)
	// Lose weight: -500 = 2297.75 (round 2298)
	if resp.Data.TargetCalories != 2298 {
		t.Errorf("Expected target calories 2298, got %v", resp.Data.TargetCalories)
	}
}

func TestAuthAndMealsWorkflow(t *testing.T) {
	router, cleanup := setupTestApp(t)
	defer cleanup()

	// 1. Register User
	registerBody := map[string]interface{}{
		"name":           "Subhrajeet",
		"email":          "subhra@example.com",
		"password":       "password123",
		"age":            26,
		"gender":         "male",
		"height":         178,
		"weight":         75,
		"activity_level": "moderate",
		"goal":           "maintain",
	}

	w := performRequest(router, "POST", "/api/auth/register", registerBody, "")
	if w.Code != http.StatusCreated {
		t.Fatalf("Register failed: %d. %s", w.Code, w.Body.String())
	}

	var authResp struct {
		Data struct {
			Token string `json:"token"`
			User  struct {
				ID             uint    `json:"id"`
				Email          string  `json:"email"`
				TargetCalories float64 `json:"target_calories"`
			} `json:"user"`
		} `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &authResp)
	token := authResp.Data.Token
	if token == "" {
		t.Fatalf("Expected non-empty token")
	}

	// 2. Login User
	loginBody := map[string]interface{}{
		"email":    "subhra@example.com",
		"password": "password123",
	}
	w = performRequest(router, "POST", "/api/auth/login", loginBody, "")
	if w.Code != http.StatusOK {
		t.Fatalf("Login failed: %d", w.Code)
	}

	// 3. Search Foods
	w = performRequest(router, "GET", "/api/foods?q=Chicken", nil, token)
	if w.Code != http.StatusOK {
		t.Fatalf("Food search failed: %d", w.Code)
	}

	var foodResp struct {
		Data []struct {
			ID   uint   `json:"id"`
			Name string `json:"name"`
		} `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &foodResp)
	if len(foodResp.Data) == 0 {
		t.Fatalf("Expected at least 1 food result for chicken")
	}
	chickenID := foodResp.Data[0].ID

	// 4. Log Meal
	today := time.Now().Format("2006-01-02")
	mealBody := map[string]interface{}{
		"meal_type": "lunch",
		"date":      today,
		"items": []map[string]interface{}{
			{
				"food_id":  chickenID,
				"quantity": 200, // 200 grams
			},
		},
	}
	w = performRequest(router, "POST", "/api/meals", mealBody, token)
	if w.Code != http.StatusCreated {
		t.Fatalf("Meal logging failed: %d. %s", w.Code, w.Body.String())
	}

	var mealCreatedResp struct {
		Data struct {
			ID    uint `json:"id"`
			Items []struct {
				Calories float64 `json:"calories"`
				Protein  float64 `json:"protein"`
			} `json:"items"`
		} `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &mealCreatedResp)
	createdMealID := mealCreatedResp.Data.ID

	// 5. Get Daily Summary
	w = performRequest(router, "GET", "/api/meals?date="+today, nil, token)
	if w.Code != http.StatusOK {
		t.Fatalf("Get meals failed: %d", w.Code)
	}

	var dayResp struct {
		Data struct {
			TotalCalories float64 `json:"total_calories"`
			TotalProtein  float64 `json:"total_protein"`
			Meals         []struct {
				ID uint `json:"id"`
			} `json:"meals"`
		} `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &dayResp)
	if dayResp.Data.TotalCalories <= 0 {
		t.Fatalf("Expected total calories > 0, got %v", dayResp.Data.TotalCalories)
	}

	// 6. Get Weekly Progress
	w = performRequest(router, "GET", "/api/progress/week?date="+today, nil, token)
	if w.Code != http.StatusOK {
		t.Fatalf("Weekly progress failed: %d", w.Code)
	}

	// 7. Delete Meal
	w = performRequest(router, "DELETE", fmt.Sprintf("/api/meals/%d", createdMealID), nil, token)
	if w.Code != http.StatusOK {
		t.Fatalf("Delete meal failed: %d", w.Code)
	}

	// Verify meal deleted
	w = performRequest(router, "GET", "/api/meals?date="+today, nil, token)
	json.Unmarshal(w.Body.Bytes(), &dayResp)
	if dayResp.Data.TotalCalories != 0 {
		t.Fatalf("Expected 0 total calories after delete, got %v", dayResp.Data.TotalCalories)
	}
}

