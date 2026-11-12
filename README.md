# Calorie Calculator App

> A fast, privacy-friendly mobile app (Expo / React Native) with a Go backend (Gin + GORM) that calculates daily calorie needs, logs meals, and tracks nutrition goals — **100% zero-Docker, zero tracking, and lightweight**.

---

## The Problem We Are Solving

1. **Confusing numbers**: Most people do not know how many calories their body actually burns and needs daily.
2. **Bloated apps**: Existing trackers are heavy, ad-filled, collect personal data, and force unnecessary subscriptions.
3. **Slow & manual**: Searching foods and doing math by hand makes people quit within days.

### Our Solution
- **High-Performance Go API**: Enter your physical stats, get your BMR, TDEE, and daily target instantly via the scientifically validated **Mifflin-St Jeor equation**.
- **Intuitive Expo Mobile App**: Log breakfast, lunch, dinner, and snacks with a couple of taps, search built-in everyday foods with macros, and track daily/weekly progress effortlessly.
- **Privacy First**: Zero trackers, zero ads, no third-party telemetry. Zero Docker requirement.

---

## Architecture & Technology Stack

```
┌───────────────────────────────────────────────┐
│        Expo (React Native) Mobile App         │
│  - Modern dark fitness UI                     │
│  - Live Mifflin-St Jeor calculation           │
│  - Daily calorie & macro progress bars        │
│  - Food search & instant quantity preview     │
│  - 7-day weekly adherence trends              │
└───────────────────────┬───────────────────────┘
                        │ HTTP / JSON (JWT Auth)
                        ▼
┌───────────────────────────────────────────────┐
│               Go (Golang) API                 │
│  - Gin Web Framework (Fast REST routing)      │
│  - Layered Clean Architecture                 │
│  - Handlers, Middleware, Services, Models     │
│  - Bcrypt password hashing & JWT auth         │
│  - Mifflin-St Jeor Calorie Calculation Engine │
└───────────────────────┬───────────────────────┘
                        │ GORM ORM
                        ▼
┌───────────────────────────────────────────────┐
│               Database Layer                  │
│  - Pure-Go SQLite (Default, Zero-Setup)       │
│  - PostgreSQL (Configurable via DB_DRIVER)    │
│  - Auto-migrations & 55+ Seeded Foods         │
└───────────────────────────────────────────────┘
```

---

## Core Algorithm: Mifflin-St Jeor Equation

### 1. Basal Metabolic Rate (BMR)
$$\text{BMR}_{\text{men}} = 10 \times \text{weight (kg)} + 6.25 \times \text{height (cm)} - 5 \times \text{age} + 5$$
$$\text{BMR}_{\text{women}} = 10 \times \text{weight (kg)} + 6.25 \times \text{height (cm)} - 5 \times \text{age} - 161$$

### 2. Total Daily Energy Expenditure (TDEE)
$$\text{TDEE} = \text{BMR} \times \text{Activity Factor}$$

| Activity Level | Factor | Description |
| :--- | :---: | :--- |
| **Sedentary** | `1.2` | Little or no exercise |
| **Lightly Active** | `1.375` | Light exercise 1–3 days/week |
| **Moderately Active** | `1.55` | Moderate exercise 3–5 days/week |
| **Very Active** | `1.725` | Heavy exercise 6–7 days/week |
| **Extremely Active** | `1.9` | Physical job or 2x daily training |

### 3. Goal Adjustments
- **Lose Weight**: $\text{Target} = \text{TDEE} - 500\text{ kcal}$ *(steady ~0.5kg/week fat loss)*
- **Maintain**: $\text{Target} = \text{TDEE}$
- **Gain Muscle**: $\text{Target} = \text{TDEE} + 300\text{ kcal}$ *(clean lean bulk)*

### 4. Macro Breakdown (Balanced Split)
For a given target calorie intake:
- **Protein (30%)**: $\frac{\text{Target} \times 0.30}{4}\text{ grams}$
- **Carbohydrates (45%)**: $\frac{\text{Target} \times 0.45}{4}\text{ grams}$
- **Fat (25%)**: $\frac{\text{Target} \times 0.25}{9}\text{ grams}$

---

## Database Models

- `users`: ID, Name, Email, PasswordHash, Age, Gender, Height (cm), Weight (kg), ActivityLevel, Goal, BMR, TDEE, TargetCalories, TargetProtein, TargetCarbs, TargetFat.
- `foods`: ID, Name, Category, ServingUnit, ServingSize, CaloriesPer100g, ProteinPer100g, CarbsPer100g, FatPer100g, IsCustom, UserID.
- `meals`: ID, UserID, MealType (`breakfast`, `lunch`, `dinner`, `snack`), Date (`YYYY-MM-DD`).
- `meal_items`: ID, MealID, FoodID, Quantity (grams), Calories, Protein, Carbs, Fat.
- `daily_goals`: ID, UserID, Date, TargetKcal, TargetProtein, TargetCarbs, TargetFat.

---

## REST API Endpoints

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | No | Service health check |
| `POST` | `/api/auth/register` | No | Register new user & calculate initial targets |
| `POST` | `/api/auth/login` | No | Log in and receive JWT token |
| `POST` | `/api/calculate` | No | Calculate BMR, TDEE & macros from raw stats |
| `GET` | `/api/foods?q=&category=` | Optional | Search database foods & custom foods |
| `POST` | `/api/foods` | Yes | Create a custom food item |
| `GET` | `/api/user/profile` | Yes | Get authenticated user profile & targets |
| `PUT` | `/api/user/profile` | Yes | Update physical stats & recalculate targets |
| `POST` | `/api/meals` | Yes | Log items to breakfast/lunch/dinner/snack |
| `GET` | `/api/meals?date=YYYY-MM-DD` | Yes | Get all meals and daily macro totals for date |
| `DELETE` | `/api/meals/:id` | Yes | Delete a logged meal |
| `DELETE` | `/api/meals/items/:id` | Yes | Delete a single item from a meal |
| `GET` | `/api/progress/week?date=` | Yes | 7-day intake history & weekly averages |

---

## Getting Started

### 1. Prerequisites
- **Go** (1.22+ installed)
- **Node.js** (v20+ or v22+ installed)
- **Zero Docker required**: The backend uses pure-Go embedded SQLite by default with no external dependencies. (Optionally supports PostgreSQL by setting `DB_DRIVER=postgres` in `.env`).

---

### 2. Running the Go Backend

```bash
# Navigate to backend directory
cd backend

# (Optional) Verify all unit & integration tests pass
go test -v ./...

# Start the server
go run ./cmd/server
```

The API starts on **http://localhost:8080** and automatically creates `calorie_calculator.db` and seeds over 55+ common foods (Chicken breast, Salmon, Eggs, Oats, Rice, Greek Yogurt, Fruits, Nuts, etc.).

---

### 3. Running the Expo Mobile App

```bash
# In another terminal window:
cd mobile

# Start Expo dev server
npx expo start
```

Press:
- `w` to open in your web browser.
- `a` to open in Android Emulator.
- `i` to open in iOS Simulator.
- Or scan the QR code with the **Expo Go** app on your physical iPhone or Android phone!

> **Instant Demo Mode**: Tap the **"One-Click Instant Preview (Guest)"** button on the mobile app screen to explore the app immediately with pre-filled profile and meals!

---

## Testing

The Go backend comes with full unit and integration test coverage:

```bash
cd backend
go test -v ./...
```

## after every changes in the app then generate new apk file to download in phone . 
then in terminal write this - 

```bash
cd "C:\Users\subhrajeet\Calorie Calculator\mobile"
npx eas-cli build -p android --profile preview
```

Tests verify:
- ✅ Mifflin-St Jeor formula for men and women
- ✅ TDEE calculation across all 5 activity multipliers
- ✅ Weight loss (-500 kcal), maintenance, and muscle gain (+300 kcal) adjustments
- ✅ Balanced macro splits (30/45/25%)
- ✅ User registration, login, and JWT generation/validation
- ✅ Food database search
- ✅ Meal logging with automatic quantity-to-nutrient calculations
- ✅ Daily summary calculations and meal deletion
- ✅ Weekly progress history aggregation

---

## Repository Structure

```
Calorie Calculator/
├── backend/
│   ├── cmd/server/
│   │   └── main.go                 # Application entry point
│   ├── config/
│   │   └── config.go               # Configuration loader (.env / defaults)
│   ├── internal/
│   │   ├── calculator/             # Mifflin-St Jeor engine & unit tests
│   │   │   ├── calculator.go
│   │   │   └── calculator_test.go
│   │   ├── database/               # Database connection & 55+ food seeds
│   │   │   ├── database.go
│   │   │   └── seed.go
│   │   ├── handlers/               # REST API HTTP handlers & tests
│   │   │   ├── auth.go
│   │   │   ├── calculator.go
│   │   │   ├── food.go
│   │   │   ├── meal.go
│   │   │   ├── progress.go
│   │   │   ├── user.go
│   │   │   └── handlers_test.go
│   │   ├── middleware/             # JWT auth & CORS middleware
│   │   │   ├── auth.go
│   │   │   └── cors.go
│   │   ├── models/                 # GORM database models
│   │   │   └── models.go
│   │   └── routes/                 # Gin router setup
│   │       └── routes.go
│   ├── pkg/utils/                  # JWT, bcrypt & JSON response helpers
│   │   ├── jwt.go
│   │   ├── password.go
│   │   └── response.go
│   ├── .env.example
│   ├── .env
│   ├── go.mod
│   └── go.sum
├── mobile/
│   ├── src/
│   │   ├── api/                    # API client with offline fallback
│   │   │   └── client.js
│   │   ├── components/             # Reusable UI components
│   │   │   ├── AuthModal.js
│   │   │   ├── CalorieRing.js
│   │   │   ├── FoodSearchModal.js
│   │   │   ├── Header.js
│   │   │   ├── MacroCard.js
│   │   │   ├── MealCard.js
│   │   │   ├── ProfileModal.js
│   │   │   └── WeeklyProgressModal.js
│   │   ├── constants/              # Dark mode theme & colors
│   │   │   └── theme.js
│   │   └── utils/                  # Client calculator & storage
│   │       ├── calculator.js
│   │       └── storage.js
│   ├── App.js                      # Main mobile application
│   ├── app.json                    # Expo configuration
│   └── package.json
└── README.md                       # Project documentation
```

