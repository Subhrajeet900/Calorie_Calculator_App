package handlers

import (
	"calorie-calculator/internal/middleware"
	"calorie-calculator/internal/models"
	"calorie-calculator/pkg/utils"
	"math"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ProgressHandler struct {
	DB *gorm.DB
}

func NewProgressHandler(db *gorm.DB) *ProgressHandler {
	return &ProgressHandler{DB: db}
}

type DayProgress struct {
	Date          string  `json:"date"`
	DayName       string  `json:"day_name"` // Mon, Tue, etc.
	TargetKcal    float64 `json:"target_kcal"`
	ConsumedKcal  float64 `json:"consumed_kcal"`
	ConsumedProt  float64 `json:"consumed_prot"`
	ConsumedCarbs float64 `json:"consumed_carbs"`
	ConsumedFat   float64 `json:"consumed_fat"`
	Percentage    float64 `json:"percentage"`
	IsLogged      bool    `json:"is_logged"`
}

type WeekProgressResponse struct {
	Days             []DayProgress `json:"days"`
	TargetDailyKcal  float64       `json:"target_daily_kcal"`
	AverageDailyKcal float64       `json:"average_daily_kcal"`
	TotalWeeklyKcal  float64       `json:"total_weekly_kcal"`
	DaysLogged       int           `json:"days_logged"`
	WeeklyDeficit    float64       `json:"weekly_deficit"` // negative = deficit, positive = surplus
	AverageProtein   float64       `json:"average_protein"`
	AverageCarbs     float64       `json:"average_carbs"`
	AverageFat       float64       `json:"average_fat"`
}

// GetWeeklyProgress calculates 7-day progress ending on given date (or today)
func (h *ProgressHandler) GetWeeklyProgress(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		utils.JSONUnauthorized(c, "Unauthorized")
		return
	}

	dateParam := strings.TrimSpace(c.Query("date"))
	var endDate time.Time
	var err error
	if dateParam != "" {
		endDate, err = time.Parse("2006-01-02", dateParam)
		if err != nil {
			utils.JSONBadRequest(c, "Date must be YYYY-MM-DD")
			return
		}
	} else {
		endDate = time.Now()
	}

	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		utils.JSONNotFound(c, "User not found")
		return
	}

	// Calculate 7 days list
	var dates []string
	dayMap := make(map[string]*DayProgress)
	var daysList []DayProgress

	for i := 6; i >= 0; i-- {
		d := endDate.AddDate(0, 0, -i)
		dStr := d.Format("2006-01-02")
		dates = append(dates, dStr)

		dp := &DayProgress{
			Date:         dStr,
			DayName:      d.Format("Mon"),
			TargetKcal:   user.TargetCalories,
			ConsumedKcal: 0,
			Percentage:   0,
			IsLogged:     false,
		}
		dayMap[dStr] = dp
	}

	// Fetch all meals for these 7 days
	var meals []models.Meal
	if err := h.DB.Where("user_id = ? AND date IN ?", userID, dates).
		Preload("Items").
		Find(&meals).Error; err != nil {
		utils.JSONInternalError(c, "Failed to load meal data")
		return
	}

	for _, m := range meals {
		dp, exists := dayMap[m.Date]
		if !exists {
			continue
		}

		for _, item := range m.Items {
			dp.ConsumedKcal += item.Calories
			dp.ConsumedProt += item.Protein
			dp.ConsumedCarbs += item.Carbs
			dp.ConsumedFat += item.Fat
			dp.IsLogged = true
		}
	}

	var totalKcal, totalProt, totalCarbs, totalFat float64
	var loggedDaysCount int

	for _, dStr := range dates {
		dp := dayMap[dStr]
		dp.ConsumedKcal = math.Round(dp.ConsumedKcal*10.0) / 10.0
		dp.ConsumedProt = math.Round(dp.ConsumedProt*10.0) / 10.0
		dp.ConsumedCarbs = math.Round(dp.ConsumedCarbs*10.0) / 10.0
		dp.ConsumedFat = math.Round(dp.ConsumedFat*10.0) / 10.0

		if dp.TargetKcal > 0 {
			dp.Percentage = math.Round((dp.ConsumedKcal/dp.TargetKcal)*1000.0) / 10.0
		}

		if dp.IsLogged {
			loggedDaysCount++
			totalKcal += dp.ConsumedKcal
			totalProt += dp.ConsumedProt
			totalCarbs += dp.ConsumedCarbs
			totalFat += dp.ConsumedFat
		}

		daysList = append(daysList, *dp)
	}

	avgKcal := 0.0
	avgProt := 0.0
	avgCarbs := 0.0
	avgFat := 0.0
	if loggedDaysCount > 0 {
		avgKcal = math.Round((totalKcal/float64(loggedDaysCount))*10.0) / 10.0
		avgProt = math.Round((totalProt/float64(loggedDaysCount))*10.0) / 10.0
		avgCarbs = math.Round((totalCarbs/float64(loggedDaysCount))*10.0) / 10.0
		avgFat = math.Round((totalFat/float64(loggedDaysCount))*10.0) / 10.0
	}

	weeklyDeficit := 0.0
	if loggedDaysCount > 0 {
		weeklyDeficit = math.Round((avgKcal - user.TargetCalories) * 10.0) / 10.0
	}

	resp := WeekProgressResponse{
		Days:             daysList,
		TargetDailyKcal:  user.TargetCalories,
		AverageDailyKcal: avgKcal,
		TotalWeeklyKcal:  math.Round(totalKcal*10.0) / 10.0,
		DaysLogged:       loggedDaysCount,
		WeeklyDeficit:    weeklyDeficit,
		AverageProtein:   avgProt,
		AverageCarbs:     avgCarbs,
		AverageFat:       avgFat,
	}

	utils.JSONSuccess(c, resp)
}

