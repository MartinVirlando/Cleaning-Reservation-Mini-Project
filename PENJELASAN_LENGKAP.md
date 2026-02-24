# 📚 DOKUMENTASI LENGKAP PROJECT CLEANING RESERVATION

## Daftar Isi
1. [Ringkasan Project](#ringkasan-project)
2. [Penjelasan Backend](#penjelasan-backend)
3. [Penjelasan Frontend](#penjelasan-frontend)
4. [Relasi & Flow Data](#relasi--flow-data)
5. [Contoh Use Case Lengkap](#contoh-use-case-lengkap)

---

## Ringkasan Project

Project ini adalah aplikasi **Cleaning Service Reservation** - platform untuk memesan jasa kebersihan rumah. Ada 2 tipe user:
- **User Biasa**: Bisa browse service, membuat booking, lihat booking mereka
- **Admin**: Bisa manage service, approve/reject booking

---

## PENJELASAN BACKEND

Backend menggunakan **Go dengan framework Echo** dan **PostgreSQL Database**.

### 📂 Struktur Folder Backend

```
backend/
├── cmd/api/main.go          ← Entry point aplikasi
├── internal/
│   ├── config/              ← Konfigurasi database, JWT
│   ├── database/            ← Koneksi & migrasi database
│   ├── models/              ← Struktur data (User, Service, Booking)
│   ├── repositories/        ← Query database
│   ├── services/            ← Business logic, validasi
│   ├── handlers/            ← Endpoint/API routes
│   ├── middleware/          ← JWT authentication
│   └── routes/              ← Daftar semua routes
```

---

### 1️⃣ MAIN.GO - TITIK AWAL APLIKASI

**File**: [backend/cmd/api/main.go](backend/cmd/api/main.go)

```go
func main() {
    // LANGKAH 1: Baca konfigurasi (host DB, port, JWT secret, dll)
    cfg := config.Load()
    // Hasil: Config object berisi semua setting

    // LANGKAH 2: Koneksi ke database
    db, err := database.Connect(cfg)
    // Hasil: Connection ke PostgreSQL berhasil

    // LANGKAH 3: Jalankan migrasi (bikin table jika belum ada)
    if err := database.Migrate(db); err != nil {
        log.Fatal(err)
    }
    // Tabel user, service, booking otomatis terbuat

    // LANGKAH 4: Buat HTTP server menggunakan Echo framework
    e := echo.New()

    // LANGKAH 5: Setup CORS (izinkan request dari frontend http://localhost:5173)
    e.Use(echoMiddleware.CORSWithConfig(echoMiddleware.CORSConfig{
        AllowOrigins: []string{"http://localhost:5173"},
        AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE},
        AllowHeaders: []string{
            echo.HeaderOrigin,
            echo.HeaderContentType,
            echo.HeaderAccept,
            echo.HeaderAuthorization,  // Izinkan header Authorization (untuk JWT)
        },
    }))

    // LANGKAH 6: Buat handler instances (objek yang menangani API requests)
    authHandler := handlers.NewAuthHandler(db)
    userHandler := handlers.NewUserHandler(db)

    // LANGKAH 7: Buat service & repository instances
    serviceRepo := repositories.NewServiceRepository(db)
    serviceService := services.NewServiceService(serviceRepo)
    // Repository: Langsung query database
    // Service: Berisi business logic & validasi

    // LANGKAH 8: Register semua routes
    routes.RegisterRoutes(e, ...)
    // Routes adalah daftar endpoint yang bisa diakses

    // LANGKAH 9: Jalankan server di port 8080
    e.Logger.Fatal(e.Start(":8080"))
}
```

**Alur**:
1. Load config → 2. Connect DB → 3. Migrate tables → 4. Init Echo → 5. Setup CORS → 6. Setup handlers → 7. Register routes → 8. Start server ✅

---

### 2️⃣ CONFIG.GO - KONFIGURASI

**File**: [backend/internal/config/config.go](backend/internal/config/config.go)

```go
type Config struct {
    AppPort string      // Port server, default: "8080"
    
    DBHost     string   // Host database, default: "localhost"
    DBPort     string   // Port database, default: "5432"
    DBUser     string   // Username DB, default: "postgres"
    DBPassword string   // Password DB, default: "postgres123"
    DBName     string   // Nama database, default: "cleaning_reservation"
    DBSSLMode  string   // SSL mode, default: "disable"
    
    JWTSecret string    // Secret key untuk generate JWT token
}

func Load() *Config {
    // Baca file .env jika ada
    _ = godotenv.Load()

    cfg := &Config{
        AppPort: getEnv("APP_PORT", "8080"),          // Cek env var, jika tidak ada pakai default
        DBHost:     getEnv("DB_HOST", "localhost"),
        DBPort:     getEnv("DB_PORT", "5432"),
        DBUser:     getEnv("DB_USER", "postgres"),
        DBPassword: getEnv("DB_PASSWORD", "postgres123"),
        DBName:     getEnv("DB_NAME", "cleaning_reservation"),
        DBSSLMode:  getEnv("DB_SSLMODE", "disable"),
        JWTSecret: getEnv("JWT_SECRET", "supersecretjwtkey"),
    }
    
    return cfg
}

func getEnv(key string, fallback string) string {
    val := os.Getenv(key)
    if val == "" {
        return fallback  // Pakai default jika env var kosong
    }
    return val
}
```

**Nasib**: Ini membaca semua konfigurasi dari environment variable atau pakai default value.

---

### 3️⃣ DATABASE.GO - KONEKSI DATABASE

**File**: [backend/internal/database/db.go](backend/internal/database/db.go)

```go
func Connect(cfg *config.Config) (*gorm.DB, error) {
    // LANGKAH 1: Buat connection string untuk PostgreSQL
    dsn := fmt.Sprintf(
        "host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Jakarta",
        cfg.DBHost,      // localhost
        cfg.DBUser,      // postgres
        cfg.DBPassword,  // postgres123
        cfg.DBName,      // cleaning_reservation
        cfg.DBPort,      // 5432
        cfg.DBSSLMode,   // disable
    )
    // Hasil: "host=localhost user=postgres password=postgres123 dbname=cleaning_reservation port=5432 sslmode=disable TimeZone=Asia/Jakarta"

    // LANGKAH 2: Koneksi ke database
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        return nil, err  // Jika gagal, return error
    }

    // Jika sukses, return connection object
    return db, nil
}
```

**Nasib**: Connect ke database PostgreSQL dan return database object yang bisa dipakai di handler/service.

---

### 4️⃣ MODELS - STRUKTUR DATA

#### User Model
**File**: [backend/internal/models/user.go](backend/internal/models/user.go)

```go
type User struct {
    // PRIMARY KEY - ID unik setiap user
    ID           uint      `gorm:"primaryKey" json:"id"`
    
    // Nama pengguna
    Username     string    `gorm:"type:varchar(100);not null" json:"username"`
    
    // Email (unik, tidak boleh ada yg duplikat)
    Email        string    `gorm:"type:varchar(120);uniqueIndex;not null" json:"email"`
    
    // Password yang sudah di-hash (jangan return ke frontend dengan "-")
    PasswordHash string    `gorm:"type:text;not null" json:"-"`
    
    // Kapan user dibuat & diupdate (auto)
    CreatedAt    time.Time `json:"createdAt"`
    UpdatedAt    time.Time `json:"updatedAt"`

    // Role: "user" atau "admin"
    Role string `gorm:"size:20`
}
```

#### Service Model
**File**: [backend/internal/models/service.go](backend/internal/models/service.go)

```go
type Service struct {
    // ID unik
    ID          uint      `gorm:"primaryKey"`
    
    // Nama service: "Cleaning Rumah", "Cleaning Kantor", dll
    Name        string    `gorm:"size:100;not null"`
    
    // Deskripsi: "Bersihkan seluruh ruangan", dll
    Description string    `gorm:"size:255"`
    
    // Harga dalam rupiah
    Price       int       `gorm:"not null"`
    
    // Durasi dalam menit
    Duration    int       `gorm:"not null"`
    
    // Waktu dibuat & diupdate
    CreatedAt   time.Time
    UpdatedAt   time.Time
    
    // Soft delete (bisa restore)
    DeletedAt   gorm.DeletedAt `gorm:"index"`
}
```

#### Booking Model
**File**: [backend/internal/models/booking.go](backend/internal/models/booking.go)

```go
type Booking struct {
    // ID unik booking
    ID uint `gorm:"primaryKey"`

    // Siapa yang booking (foreign key ke User)
    UserID uint
    User   User        // Relasi ke User (data lengkap user bisa di-load)

    // Service apa yang dipesan (foreign key ke Service)
    ServiceID uint
    Service   Service  // Relasi ke Service

    // Tanggal booking: "2024-02-20"
    Date    string `gorm:"size:20"`
    
    // Waktu booking: "14:00"
    Time    string `gorm:"size:20"`
    
    // Status: "pending" (menunggu approve), "approved", "rejected"
    Status  string `gorm:"size:20"`
    
    // Alamat untuk cleaning
    Address string `gorm:"size:255"`

    // Waktu dibuat & diupdate
    CreatedAt time.Time
    UpdatedAt time.Time
}
```

---

### 5️⃣ REPOSITORIES - QUERY DATABASE

Repository adalah layer untuk berbicara dengan database. Setiap repository berisi function-function untuk SELECT, INSERT, UPDATE, DELETE.

**File**: [backend/internal/repositories/booking_repository.go](backend/internal/repositories/booking_repository.go)

```go
// Interface (kontrak) - semua function yang harus ada
type BookingRepository interface {
    Create(booking *models.Booking) error
    FindByUserID(userID uint) ([]models.Booking, error)
    FindByID(id uint) (*models.Booking, error)
    UpdateStatus(id uint, status string) error
    FindAll() ([]models.Booking, error)
}

// Implementasi
type bookingRepository struct {
    db *gorm.DB  // Koneksi database
}

func NewBookingRepository(db *gorm.DB) BookingRepository {
    return &bookingRepository{db}  // Return instance baru
}

// -------- FUNCTION 1: CREATE BOOKING --------
func (r *bookingRepository) Create(booking *models.Booking) error {
    // INSERT INTO bookings (user_id, service_id, date, time, status, address, created_at, updated_at) 
    // VALUES (...)
    return r.db.Create(booking).Error
}

// -------- FUNCTION 2: CARI BOOKING BERDASAR USER ID --------
func (r *bookingRepository) FindByUserID(userID uint) ([]models.Booking, error) {
    var bookings []models.Booking

    err := r.db.
        // SELECT ... FROM bookings WHERE user_id = 5
        Where("user_id = ?", userID).
        
        // Pre-load: JOIN dengan table service (ambil data service lengkap)
        Preload("Service", func(db *gorm.DB) *gorm.DB {
            return db.Unscoped()  // Include soft deleted services juga
        }).
        
        // Pre-load: JOIN dengan table user
        Preload("User").
        
        // Execute query
        Find(&bookings).Error

    return bookings, err
}

// -------- FUNCTION 3: CARI 1 BOOKING BERDASAR ID --------
func (r *bookingRepository) FindByID(id uint) (*models.Booking, error) {
    var booking models.Booking

    err := r.db.
        Preload("Service").
        First(&booking, id).Error  // SELECT ... FROM bookings WHERE id = 1 LIMIT 1

    if err != nil {
        return nil, err
    }

    return &booking, nil
}

// -------- FUNCTION 4: UPDATE STATUS BOOKING --------
func (r *bookingRepository) UpdateStatus(id uint, status string) error {
    // UPDATE bookings SET status = "approved" WHERE id = 5
    return r.db.Model(&models.Booking{}).
        Where("id = ?", id).
        Update("status", status).Error
}

// -------- FUNCTION 5: AMBIL SEMUA BOOKING (ADMIN) --------
func (r *bookingRepository) FindAll() ([]models.Booking, error) {
    var bookings []models.Booking
    err := r.db.
        Preload("User").
        Preload("Service").
        Find(&bookings).Error
    return bookings, err
}
```

---

### 6️⃣ SERVICES - BUSINESS LOGIC

Service layer adalah tempat validasi dan business logic. Service tidak langsung query database, tapi pakai Repository.

**File**: [backend/internal/services/booking_service.go](backend/internal/services/booking_service.go)

```go
type BookingService interface {
    CreateBooking(userID uint, serviceID uint, date, time string, address string) error
    GetMyBookings(userID uint) ([]models.Booking, error)
    UpdateStatus(id uint, status string) error
    GetAllBookings() ([]models.Booking, error)
}

type bookingService struct {
    repo        repositories.BookingRepository      // Untuk query booking
    serviceRepo repositories.ServiceRepository      // Untuk query service
}

func NewBookingService(
    repo repositories.BookingRepository,
    serviceRepo repositories.ServiceRepository,
) BookingService {
    return &bookingService{repo: repo, serviceRepo: serviceRepo}
}

// -------- CREATE BOOKING --------
func (s *bookingService) CreateBooking(
    userID uint,
    serviceID uint,
    date string,
    time string,
    address string,
) error {
    // VALIDASI 1: Semua field harus ada
    if serviceID == 0 || date == "" || time == "" {
        return errors.New("service_id, date, time are required")
    }

    // VALIDASI 2: Service harus exist di database
    _, err := s.serviceRepo.GetByID(serviceID)
    if err != nil {
        return errors.New("service not found")
    }

    // SEMUA VALIDASI LEWAT, BUAT BOOKING BARU
    booking := models.Booking{
        UserID:    userID,           // ID user yang booking
        ServiceID: serviceID,        // Service mana yg dipesan
        Date:      date,             // Tanggal booking
        Time:      time,             // Waktu booking
        Status:    "pending",        // Default status pending (menunggu admin approve)
        Address:   address,          // Alamat untuk cleaning
    }

    // Simpan ke database via repository
    return s.repo.Create(&booking)
}

// -------- GET MY BOOKINGS --------
func (s *bookingService) GetMyBookings(userID uint) ([]models.Booking, error) {
    // Langsung query via repository
    return s.repo.FindByUserID(userID)
}

// -------- UPDATE STATUS --------
func (s *bookingService) UpdateStatus(id uint, status string) error {
    return s.repo.UpdateStatus(id, status)
}

// -------- GET ALL BOOKINGS (ADMIN) --------
func (s *bookingService) GetAllBookings() ([]models.Booking, error) {
    return s.repo.FindAll()
}
```

---

### 7️⃣ HANDLERS - API ENDPOINTS

Handler adalah layer yang direct komunikasi dengan HTTP. Terima request, validasi, panggil service, return JSON response.

#### Auth Handler
**File**: [backend/internal/handlers/auth_handler.go](backend/internal/handlers/auth_handler.go)

```go
type AuthHandler struct {
    DB *gorm.DB  // Koneksi database
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
    return &AuthHandler{DB: db}
}

// -------- REGISTER ENDPOINT --------
type RegisterRequest struct {
    Username string `json:"username"`  // Dari request body
    Email    string `json:"email"`
    Password string `json:"password"`
}

func (h *AuthHandler) Register(c echo.Context) error {
    var req RegisterRequest

    // LANGKAH 1: Parse request body JSON ke struct
    if err := c.Bind(&req); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{
            "message": "Invalid request body",
        })
    }

    // LANGKAH 2: Validasi - field harus ada
    if req.Username == "" || req.Email == "" || req.Password == "" {
        return c.JSON(http.StatusBadRequest, map[string]string{
            "message": "Username, Email, Password are required!",
        })
    }

    // LANGKAH 3: Cek email sudah terdaftar atau belum
    var existing models.User
    err := h.DB.Where("email = ?", req.Email).First(&existing).Error
    if err == nil {  // Jika err == nil, berarti email sudah ada
        return c.JSON(http.StatusBadRequest, map[string]string{
            "message": "Email Already Registered!",
        })
    }

    // LANGKAH 4: Hash password (jangan simpan password plain text!)
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{
            "message": "Failed to Hash Password!",
        })
    }

    // LANGKAH 5: Buat user baru
    user := models.User{
        Username:     req.Username,
        Email:        req.Email,
        PasswordHash: string(hashedPassword),  // Simpan password yang sudah di-hash
        Role:         "user",                  // Default role adalah "user"
    }

    // LANGKAH 6: Simpan ke database
    if err := h.DB.Create(&user).Error; err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{
            "message": "Failed to Create User!",
        })
    }

    // LANGKAH 7: Return success
    return c.JSON(http.StatusCreated, map[string]string{
        "message": "User Registered Successfully",
    })
}

// -------- LOGIN ENDPOINT --------
type LoginRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

func (h *AuthHandler) Login(c echo.Context) error {
    var req LoginRequest

    // LANGKAH 1: Parse request body
    if err := c.Bind(&req); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{
            "message": "Invalid request body",
        })
    }

    // LANGKAH 2: Cari user di database berdasar email
    var user models.User
    err := h.DB.Where("email = ?", req.Email).First(&user).Error
    if err != nil {
        return c.JSON(http.StatusUnauthorized, map[string]string{
            "message": "Invalid email or password",
        })
    }

    // LANGKAH 3: Validasi password
    // bcrypt.CompareHashAndPassword membandingkan plain password dengan hashed password
    if err := bcrypt.CompareHashAndPassword(
        []byte(user.PasswordHash),  // Password yg sudah di-hash (dari DB)
        []byte(req.Password),       // Password dari input user
    ); err != nil {
        return c.JSON(http.StatusUnauthorized, map[string]string{
            "message": "Invalid email or password",
        })
    }

    // LANGKAH 4: Generate JWT token
    token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{
            "message": "Failed to generate token",
        })
    }

    // LANGKAH 5: Return token & user data
    return c.JSON(http.StatusOK, map[string]interface{}{
        "token": token,
        "user": map[string]interface{}{
            "id":       user.ID,
            "username": user.Username,
            "email":    user.Email,
            "role":     user.Role,
        },
    })
}
```

#### Booking Handler
**File**: [backend/internal/handlers/booking_handler.go](backend/internal/handlers/booking_handler.go)

```go
type BookingHandler struct {
    service services.BookingService  // Pakai service untuk business logic
}

func NewBookingHandler(service services.BookingService) *BookingHandler {
    return &BookingHandler{service}
}

type CreateBookingRequest struct {
    ServiceID uint   `json:"serviceId"`
    Date      string `json:"date"`
    Time      string `json:"time"`
    Address   string `json:"address"`
}

// -------- CREATE BOOKING ENDPOINT --------
func (h *BookingHandler) Create(c echo.Context) error {
    // LANGKAH 1: Ambil user ID dari JWT token (middleware sudah extract)
    userIDFloat, ok := c.Get("user_id").(float64)
    if !ok {
        return c.JSON(http.StatusUnauthorized, map[string]string{
            "message": "Unauthorized",
        })
    }
    userID := uint(userIDFloat)  // Convert float64 ke uint

    // LANGKAH 2: Parse request body
    var req CreateBookingRequest
    if err := c.Bind(&req); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{
            "message": "Invalid request",
        })
    }

    // LANGKAH 3: Validasi field harus ada
    if req.ServiceID == 0 || req.Date == "" || req.Time == "" {
        return c.JSON(http.StatusBadRequest, map[string]string{
            "message": "service_id, date, time are required",
        })
    }

    // LANGKAH 4: Panggil service untuk create booking (service melakukan validasi tambahan)
    err := h.service.CreateBooking(
        userID,
        req.ServiceID,
        req.Date,
        req.Time,
        req.Address,
    )

    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{
            "message": "Failed create booking",
        })
    }

    // LANGKAH 5: Return success
    return c.JSON(http.StatusCreated, map[string]string{
        "message": "Booking created",
    })
}

// -------- GET MY BOOKINGS ENDPOINT --------
func (h *BookingHandler) MyBookings(c echo.Context) error {
    // LANGKAH 1: Ambil user ID dari JWT
    userIDFloat, ok := c.Get("user_id").(float64)
    if !ok {
        return c.JSON(http.StatusUnauthorized, map[string]string{
            "message": "Unauthorized",
        })
    }
    userID := uint(userIDFloat)

    // LANGKAH 2: Ambil semua booking milik user ini
    bookings, err := h.service.GetMyBookings(userID)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{
            "message": "Failed get bookings",
            "error":   err.Error(),
        })
    }

    // LANGKAH 3: Return array of bookings
    return c.JSON(http.StatusOK, bookings)
}
```

---

### 8️⃣ MIDDLEWARE - JWT AUTHENTICATION

Middleware adalah function yang di-jalankan sebelum handler. Digunakan untuk check JWT token.

**File**: [backend/internal/middleware/jwt_middleware.go](backend/internal/middleware/jwt_middleware.go)

```go
func JWTMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
    return func(c echo.Context) error {

        // LANGKAH 1: Ambil Authorization header
        authHeader := c.Request().Header.Get("Authorization")
        // Contoh: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

        if authHeader == "" {
            return c.JSON(http.StatusUnauthorized, map[string]string{
                "message": "Missing authorization header",
            })
        }

        // LANGKAH 2: Split "Bearer" dan token
        parts := strings.Split(authHeader, " ")
        // parts[0] = "Bearer"
        // parts[1] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

        if len(parts) != 2 || parts[0] != "Bearer" {
            return c.JSON(http.StatusUnauthorized, map[string]string{
                "message": "Invalid authorization format",
            })
        }

        tokenString := parts[1]

        // LANGKAH 3: Baca JWT secret dari config
        cfg := config.Load()
        secret := []byte(cfg.JWTSecret)

        // LANGKAH 4: Parse & validate token
        token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
            // Pastikan signing method adalah HMAC
            if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, jwt.ErrSignatureInvalid
            }

            return secret, nil
        })

        // LANGKAH 5: Check apakah token valid
        if err != nil || !token.Valid {
            return c.JSON(http.StatusUnauthorized, map[string]string{
                "message": "Invalid or expired token",
            })
        }

        // LANGKAH 6: Extract claims (data di dalam token)
        if claims, ok := token.Claims.(jwt.MapClaims); ok {
            c.Set("user_id", claims["user_id"])    // Set ke context, bisa dipakai di handler
            c.Set("email", claims["email"])
            c.Set("role", claims["role"])
        }

        // LANGKAH 7: Lanjut ke handler berikutnya
        return next(c)
    }
}
```

---

### 9️⃣ JWT UTILITY - GENERATE TOKEN

**File**: [backend/internal/utils/jwt.go](backend/internal/utils/jwt.go)

```go
type JwtCustomClaims struct {
    UserID uint   `json:"user_id"`
    Email  string `json:"email"`
    Role   string `json:"role"`
    jwt.RegisteredClaims  // Claims standard (exp, iat, dll)
}

func GenerateToken(userID uint, email string, role string) (string, error) {
    // LANGKAH 1: Buat claims (payload token)
    claims := &JwtCustomClaims{
        UserID: userID,      // ID user: 1
        Email: email,        // Email: "user@example.com"
        Role: role,          // Role: "user" atau "admin"
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),  // Expire 24 jam
            IssuedAt:  jwt.NewNumericDate(time.Now()),                       // Issued now
        },
    }

    // LANGKAH 2: Buat token baru dengan claims
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

    // LANGKAH 3: Baca JWT secret
    secret := os.Getenv("JWT_SECRET")

    // LANGKAH 4: Sign token dengan secret
    return token.SignedString([]byte(secret))
    // Hasil: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImV4cCI6MTcwODQzMDAwMH0.3x..."
}
```

---

### 🔟 ROUTES - DAFTAR ENDPOINTS

**File**: [backend/internal/routes/router.go](backend/internal/routes/router.go)

```go
func RegisterRoutes(
    e *echo.Echo,
    bookingHandler *handlers.BookingHandler,
    adminHandler *handlers.AdminHandler,
) {
    // Group semua routes dibawah /api
    api := e.Group("/api")

    // PUBLIC ROUTES (gak perlu JWT)
    api.POST("/auth/register", authHandler.Register)    // POST /api/auth/register
    api.POST("/auth/login", authHandler.Login)          // POST /api/auth/login

    // PROTECTED ROUTES (perlu JWT)
    api.POST("/bookings", bookingHandler.Create, middleware.JWTMiddleware)
    // Handler: bookingHandler.Create
    // Middleware: JWTMiddleware (check JWT dulu sebelum masuk handler)

    api.GET("/bookings", bookingHandler.MyBookings, middleware.JWTMiddleware)

    // ADMIN PROTECTED ROUTES (perlu JWT + role admin)
    admin := api.Group("/admin", middleware.JWTMiddleware, middleware.AdminOnly)
    // Middleware 1: JWTMiddleware (extract claims)
    // Middleware 2: AdminOnly (check apakah role == "admin")

    admin.PUT("/bookings/:id/approve", adminHandler.Approve)
    admin.PUT("/bookings/:id/reject", adminHandler.Reject)
}
```

---

## PENJELASAN FRONTEND

Frontend menggunakan **React + TypeScript + Tailwind CSS + TanStack Query (React Query)**.

### 📂 Struktur Folder Frontend

```
frontend/src/
├── main.tsx                ← Entry point
├── app/
│   ├── App.tsx            ← Main component setup
│   ├── router.tsx         ← Define routes (path, component)
│   └── queryClient.ts     ← React Query setup
├── context/
│   └── AuthContext.tsx    ← Global state untuk authentication
├── pages/                 ← Full pages
│   ├── auth/Login.tsx
│   ├── auth/Register.tsx
│   ├── services/ServicesPage.tsx
│   └── bookings/BookingsPage.tsx
├── components/
│   ├── atoms/             ← Smallest UI component (Button, Input)
│   ├── molecules/         ← Combination of atoms (FormInput)
│   └── organisms/         ← Complex components (Forms)
├── services/              ← API call functions
│   ├── authService.ts
│   ├── bookingService.ts
│   └── queries/           ← React Query hooks
├── contracts/             ← TypeScript interfaces
├── layouts/               ← Layout components
├── routes/                ← Route protection
└── lib/
    └── api.ts             ← Axios instance
```

---

### 1️⃣ MAIN.TSX - ENTRY POINT

**File**: [frontend/src/main.tsx](frontend/src/main.tsx)

```tsx
import { createRoot } from "react-dom/client";           // React 18 API
import { BrowserRouter } from "react-router-dom";       // Router setup
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";  // React Query
import AppRouter from "./app/router";                   // Routes definition
import { AuthProvider } from "./context/AuthContext";   // Auth context
import "./index.css";

// LANGKAH 1: Buat React Query client (untuk caching API responses)
const queryClient = new QueryClient();

// LANGKAH 2: Render React app ke DOM
const root = createRoot(document.getElementById("root")!);

root.render(
  // LANGKAH 3: Wrap dengan QueryClientProvider
  <QueryClientProvider client={queryClient}>
    
    // LANGKAH 4: Wrap dengan BrowserRouter (untuk routing)
    <BrowserRouter>
      
      // LANGKAH 5: Wrap dengan AuthProvider (untuk global auth state)
      <AuthProvider>
        
        // LANGKAH 6: Render app routes
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
```

**Struktur nesting**:
```
QueryClientProvider
└── BrowserRouter
    └── AuthProvider
        └── AppRouter
```

---

### 2️⃣ ROUTER.TSX - DEFINISI ROUTES

**File**: [frontend/src/app/router.tsx](frontend/src/app/router.tsx)

```tsx
export default function AppRouter() {
  const { user } = useAuth();  // Ambil user dari auth context

  return (
    <Routes>
      
      // ====== DEFAULT REDIRECT ======
      <Route path="/" element={<DefaultRedirect />} />
      // Jika akses "/" (root), cek role:
      // - Jika admin: redirect ke "/admin/services"
      // - Jika user: redirect ke "/services"

      // ====== PUBLIC ROUTES ======
      <Route element={<MainLayout/>}>
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
      </Route>
      // Siapa saja bisa akses, gak perlu login

      // ====== AUTH ROUTES (Login/Register) ======
      <Route element={<AuthLayout/>}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      // Layout khusus untuk auth pages

      // ====== PROTECTED ROUTES (Perlu login) ======
      <Route element={<ProtectedRoute />}>
        <Route path="/bookings" element={<BookingsPage />} />
      </Route>
      // Hanya user yang sudah login bisa akses

      // ====== ADMIN PROTECTED ROUTES ======
      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/services" element={<AadminServicesPage />} />
        </Route>
      </Route>
      // Hanya admin yang sudah login bisa akses

      // ====== FALLBACK ======
      <Route path="*" element={<Navigate to="/services" replace />} />
      // Path tidak ditemukan? Redirect ke /services
    </Routes>
  );
}
```

---

### 3️⃣ AUTHCONTEXT.TSX - GLOBAL AUTH STATE

**File**: [frontend/src/context/AuthContext.tsx](frontend/src/context/AuthContext.tsx)

```tsx
type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;  // "user" atau "admin"
};

type AuthContextType = {
  user: AuthUser | null;              // User data atau null jika belum login
  token: string | null;               // JWT token atau null
  isAuthenticated: boolean;           // true jika sudah login
  isLoading: boolean;                 // true saat check localStorage
  login: (token: string, user: AuthUser) => void;   // Function untuk login
  logout: () => void;                 // Function untuk logout
};

const STORAGE_KEY = "cleaning_auth";  // Key di localStorage

// ========== PROVIDER COMPONENT ==========
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  // STATE
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // -------- LOGIN FUNCTION --------
  function login(newToken: string, newUser: AuthUser) {
    // Set ke state
    setToken(newToken);
    setUser(newUser);

    // Simpan ke localStorage (supaya persist setelah page refresh)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: newToken, user: newUser })
    );
  }

  // -------- LOGOUT FUNCTION --------
  function logout() {
    // Clear state
    setToken(null);
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);
    
    // Redirect ke login page
    navigate("/login");
  }

  // -------- EFFECT: LOAD DATA DARI LOCALSTORAGE ========
  useEffect(() => {
    // LANGKAH 1: Ambil data dari localStorage
    const saved = localStorage.getItem(STORAGE_KEY);

    // LANGKAH 2: Jika ada, parse dan set ke state
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setToken(parsed.token);
        setUser(parsed.user);
      } catch {
        localStorage.removeItem(STORAGE_KEY);  // Clear jika corrupt
      }
    }

    // LANGKAH 3: Set loading = false (sudah selesai check)
    setIsLoading(false);
  }, []);  // Run 1 kali saat component mount

  // ========== PROVIDE VALUE ==========
  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,  // true jika token ada
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ========== HOOK: useAuth() ==========
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
```

**Flow**:
1. User login → call `login()` → set state + localStorage
2. Page refresh → useEffect jalan → load dari localStorage → restore state
3. User logout → call `logout()` → clear state + localStorage + redirect

---

### 4️⃣ API.TS - AXIOS INSTANCE

**File**: [frontend/src/lib/api.ts](frontend/src/lib/api.ts)

```typescript
import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

// LANGKAH 1: Buat axios instance dengan base URL
const api = axios.create({
  baseURL: "http://localhost:8080",  // Backend baseURL
});

// LANGKAH 2: Setup request interceptor (auto add JWT token)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Ambil token dari localStorage
    const saved = localStorage.getItem("cleaning_auth");

    if (saved && config.headers) {
      try {
        const parsed = JSON.parse(saved);
        const token = parsed.token;

        if (token) {
          // Auto add Authorization header
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // Ignore parse error
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
```

**Nasib**: Setiap request pakai `api.post()`, `api.get()` dll, otomatis JWT token di-include di header.

---

### 5️⃣ AUTHSERVICE.TS - API CALLS

**File**: [frontend/src/services/authService.ts](frontend/src/services/authService.ts)

```typescript
import api from "../lib/api";

export async function login(
  payload: LoginRequest  // { email: string, password: string }
): Promise<LoginResponse> {
  // POST ke backend /auth/login dengan payload
  const res = await api.post("/auth/login", payload);
  // Response: { token: "...", user: { id, username, email, role } }

  const data = res.data;
  
  return data;
}

export async function register(
  payload: RegisterRequest  // { username, email, password }
): Promise<LoginResponse> {
  const res = await api.post("/auth/register", payload);
  const data = res.data;
  return data;
}
```

---

### 6️⃣ LOGINFORM.TSX - LOGIN UI

**File**: [frontend/src/components/organisms/LoginForm.tsx](frontend/src/components/organisms/LoginForm.tsx)

```tsx
import { Form, message } from "antd";
import { Button } from "../atoms/Buttons";
import { useNavigate } from "react-router-dom";
import FormInput from "../molecules/FormInput";
import { login as loginService } from "../../services/authService";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();  // Ambil login function dari context

  // ========== SETUP MUTATION ==========
  const mutation = useMutation({
    // mutationFn: function yang di-call saat form submit
    mutationFn: loginService,

    // onSuccess: callback saat login berhasil
    onSuccess: (data, variables) => {
      // data = { token: "...", user: { id, username, email, role } }

      // LANGKAH 1: Format user data
      const user = {
        id: data.user.id,
        name: data.user.username,
        email: data.user.email,
        role: data.user.role,
      };

      // LANGKAH 2: Call login function (set state + localStorage)
      login(data.token, user);

      // LANGKAH 3: Show success message
      message.success("Login successful!");

      // LANGKAH 4: Redirect berdasar role
      if (data.user.role === "admin") {
        navigate("/admin/bookings");
      } else {
        navigate("/services");
      }
    },

    // onError: callback saat login gagal
    onError: () => {
      message.error("Invalid email or password");
    },
  });

  // ========== FORM SUBMIT HANDLER ==========
  const onFinish = (values: LoginFormValues) => {
    // values = { email: "user@example.com", password: "123456" }
    mutation.mutate(values);  // Panggil loginService dengan values
  };

  // ========== RENDER ==========
  return (
    <Form layout="vertical" onFinish={onFinish}>
      {/* Email Input */}
      <FormInput
        name="email"
        label="Email"
        type="email"
        placeholder="Enter your email"
        rules={[
          { required: true, message: "Please input your email!" },
          { type: "email", message: "Invalid email!" },
        ]}
      />

      {/* Password Input */}
      <FormInput
        name="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        rules={[{ required: true, message: "Please input your password!" }]}
      />

      {/* Submit Button */}
      <Button
        htmlType="submit"
        type="primary"
        className="w-full"
        loading={mutation.isPending}  // Show loading saat request
      >
        Login
      </Button>
    </Form>
  );
}
```

**Flow**:
1. User ketik email & password
2. User klik Login button
3. onFinish dipanggil → mutation.mutate(values)
4. loginService API call ke backend /auth/login
5. Backend return token & user
6. onSuccess dipanggil → login() → set state + localStorage → redirect

---

### 7️⃣ SERVICESPAGE.TSX - SERVICES LIST

**File**: [frontend/src/pages/services/ServicesPage.tsx](frontend/src/pages/services/ServicesPage.tsx)

```tsx
import { Card, List, Spin, Alert, Tag, Empty } from "antd";
import { useServicesQuery } from "../../services/queries/useServicesQuery";
import { useNavigate } from "react-router-dom";

export default function ServicesPage() {
  // ========== FETCH DATA ==========
  const { data, isLoading, isError } = useServicesQuery();
  // useServicesQuery: Hook custom yang pakai React Query
  // data: array of services atau undefined
  // isLoading: true saat fetch
  // isError: true jika ada error

  const navigate = useNavigate();

  // ========== LOADING STATE ==========
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // ========== ERROR STATE ==========
  if (isError || !data) {
    return <Alert type="error" message="Failed to load services." />;
  }

  // ========== EMPTY STATE ==========
  if (data.length === 0) {
    return <Empty description="No services available" className="mt-20" />;
  }

  // ========== SUCCESS STATE ==========
  return (
    <div className="pt-2 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Our Services</h1>
        <p className="text-gray-500 mt-2">Choose the perfect cleaning service for your needs</p>
      </div>

      {/* Grid of service cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((service) => (
          // ========== SERVICE CARD ==========
          <Card
            key={service.id}
            hoverable  // Hover effect
            className="shadow-md hover:shadow-2xl transition-all duration-300 rounded-lg overflow-hidden border-0"
            onClick={() => navigate(`/services/${service.id}`)}  // Klik → detail page
          >
            {/* Service Name Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 -mt-6 -mx-6 px-6 py-4 mb-4">
              <h3 className="text-xl font-bold text-white">{service.name}</h3>
            </div>

            {/* Service Description */}
            <p className="text-gray-600 min-h-[3rem] mb-4 line-clamp-2">
              {service.description}
            </p>

            {/* Price & Duration Info */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarOutlined className="text-green-600" />
                  <span className="text-sm font-medium">Price</span>
                </div>
                <Tag color="green" className="text-base px-3 py-1">
                  Rp {service.price.toLocaleString("id-ID")}
                </Tag>
              </div>

              {/* Duration */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <ClockCircleOutlined className="text-blue-600" />
                  <span className="text-sm font-medium">Duration</span>
                </div>
                <Tag color="blue" className="text-base px-3 py-1">
                  {service.durationMinutes} min
                </Tag>
              </div>
            </div>

            {/* Call to action */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-center text-gray-400 hover:text-blue-500 transition-colors">
                Click to book this service →
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

**Flow**:
1. Component di-mount → useServicesQuery hook jalan
2. Hook call `/api/services` endpoint
3. Response data di-cache oleh React Query
4. Component render dengan data
5. User click card → navigate ke `/services/{id}` → detail page

---

## RELASI & FLOW DATA

### 📊 Diagram Relasi Database

```
USER
├── id (PK)
├── username
├── email (UNIQUE)
├── password_hash
└── role ("user" atau "admin")

SERVICE
├── id (PK)
├── name
├── description
├── price
└── duration

BOOKING
├── id (PK)
├── user_id (FK → USER.id)
├── service_id (FK → SERVICE.id)
├── date
├── time
├── status ("pending", "approved", "rejected")
└── address
```

### 🔄 Data Flow pada Frontend

```
┌─────────────────────────────────────────────────────────────────┐
│                        LOCAL BROWSER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  STEP 1: User Visit "/" Root                                    │
│  ├─ Router check route                                          │
│  ├─ Load AuthProvider & AuthContext                             │
│  ├─ useEffect jalan → cek localStorage "cleaning_auth"         │
│  └─ Restore user & token to state (jika ada)                   │
│                                                                   │
│  STEP 2: User Click "Login"                                     │
│  ├─ Navigate to "/login"                                        │
│  ├─ Render <Login> page                                         │
│  ├─ Render <LoginForm> component                                │
│  └─ Form empty, walau untuk input                               │
│                                                                   │
│  STEP 3: User Ketik Email & Password                           │
│  ├─ Form state update dengan nilai input                        │
│  ├─ User klik "Login" button                                    │
│  └─ onFinish() called dengan form values                        │
│                                                                   │
│  STEP 4: Mutation Jalan                                         │
│  ├─ mutation.mutate({ email, password })                        │
│  ├─ loginService() dipanggil                                    │
│  └─ api.post("/auth/login", { email, password })              │
│                                                                   │
│  STEP 5: API Call ke Backend                                    │
│  ├─ Axios create request →                                      │
│  ├─ Interceptor auto add headers (gak ada token dulu)          │
│  └─ POST ke http://localhost:8080/api/auth/login              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 🔄 Data Flow pada Backend (LOGIN)

```
┌──────────────────────────────────────────────────────────────────────┐
│                        BACKEND SERVER                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  STEP 1: Request Diterima                                            │
│  ├─ POST /api/auth/login                                             │
│  ├─ Body: { email: "user@example.com", password: "123456" }         │
│  └─ Handler: authHandler.Login()                                     │
│                                                                        │
│  STEP 2: Parse Request                                               │
│  ├─ c.Bind(&req) → Parse JSON ke struct LoginRequest                │
│  ├─ req.Email = "user@example.com"                                  │
│  ├─ req.Password = "123456"                                          │
│  └─ Cek field ada & tidak kosong                                     │
│                                                                        │
│  STEP 3: Query Database                                              │
│  ├─ h.DB.Where("email = ?", req.Email).First(&existing)             │
│  ├─ SQL: SELECT * FROM users WHERE email = 'user@example.com'      │
│  ├─ Dari DB: User{                                                   │
│  │   ID: 1,                                                          │
│  │   Username: "john_doe",                                           │
│  │   Email: "user@example.com",                                      │
│  │   PasswordHash: "$2a$10$...(hashed)",                             │
│  │   Role: "user"                                                    │
│  │ }                                                                  │
│  └─ Jika user tidak ketemu → error "Invalid email or password"      │
│                                                                        │
│  STEP 4: Validasi Password                                           │
│  ├─ bcrypt.CompareHashAndPassword(hashedPassword, plainPassword)    │
│  ├─ Input: "123456"                                                  │
│  ├─ Hashed dari DB: "$2a$10$..."                                    │
│  ├─ bcrypt: hash "123456" → "$2a$10$..." (sama?)                    │
│  └─ Match → lanjut, tidak match → error                             │
│                                                                        │
│  STEP 5: Generate JWT Token                                          │
│  ├─ utils.GenerateToken(userID=1, email="user@example.com", role="user")
│  ├─ Claims: {                                                        │
│  │   "user_id": 1,                                                   │
│  │   "email": "user@example.com",                                    │
│  │   "role": "user",                                                 │
│  │   "exp": 1709000000 (24 jam dari sekarang)                       │
│  │ }                                                                  │
│  ├─ Sign dengan JWT secret "supersecretjwtkey"                       │
│  └─ Hasil: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."                │
│                                                                        │
│  STEP 6: Return Response                                             │
│  ├─ Status: 200 OK                                                   │
│  └─ Body: {                                                          │
│      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",            │
│      "user": {                                                       │
│        "id": 1,                                                      │
│        "username": "john_doe",                                       │
│        "email": "user@example.com",                                  │
│        "role": "user"                                                │
│      }                                                               │
│    }                                                                 │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

### 🔄 Data Flow Response Kembali ke Frontend

```
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND LAGI                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  STEP 1: Response Diterima                                      │
│  ├─ mutation.onSuccess() dipanggil                              │
│  ├─ data = {                                                    │
│  │   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",         │
│  │   user: {                                                    │
│  │     id: 1,                                                   │
│  │     username: "john_doe",                                    │
│  │     email: "user@example.com",                               │
│  │     role: "user"                                             │
│  │   }                                                          │
│  │ }                                                            │
│  └─ variables = input form                                      │
│                                                                   │
│  STEP 2: Format & Call login()                                  │
│  ├─ user = {                                                    │
│  │   id: 1,                                                     │
│  │   name: "john_doe",                                          │
│  │   email: "user@example.com",                                 │
│  │   role: "user"                                               │
│  │ }                                                            │
│  ├─ login(token, user)                                          │
│  └─ AuthContext.login() dipanggil                              │
│                                                                   │
│  STEP 3: AuthContext Update                                     │
│  ├─ setToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")        │
│  ├─ setUser({ id: 1, name: "john_doe", ... })                 │
│  ├─ localStorage.setItem("cleaning_auth", JSON.stringify({      │
│  │   token: "...",                                              │
│  │   user: { ... }                                              │
│  │ }))                                                          │
│  └─ isAuthenticated menjadi true                               │
│                                                                   │
│  STEP 4: Show Success & Redirect                                │
│  ├─ message.success("Login successful!")                        │
│  ├─ Check role: data.user.role === "admin"?                    │
│  ├─ Jika admin: navigate("/admin/bookings")                    │
│  ├─ Jika user: navigate("/services")                           │
│  └─ Router re-render dengan route baru                         │
│                                                                   │
│  STEP 5: User Sudah Login!                                      │
│  ├─ State global: user & token sudah tersimpan                 │
│  ├─ localStorage: "cleaning_auth" sudah tersimpan              │
│  ├─ Setiap API call: token otomatis di-add di header           │
│  └─ Permission: ProtectedRoute bisa access /bookings           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## CONTOH USE CASE LENGKAP

### 📋 USE CASE 1: USER MEMBUAT BOOKING

#### Scenario:
```
User "john_doe" sudah login dengan token.
Ada 3 services di database:
- ID 1: "Cleaning Rumah" Rp 100,000 (120 menit)
- ID 2: "Cuci Karpet" Rp 150,000 (90 menit)  
- ID 3: "Cleaning Kantor" Rp 200,000 (180 menit)

User klik service ID 1, isi form booking, klik "Book Now"
```

#### Frontend Flow:

**1. User di halaman Service Detail**

```
ServicesPage.tsx
├─ useServicesQuery() → GET /api/services
├─ Return: [
│   { id: 1, name: "Cleaning Rumah", price: 100000, description: "...", ... }
│   { id: 2, name: "Cuci Karpet", price: 150000, ... }
│   { id: 3, name: "Cleaning Kantor", price: 200000, ... }
│ ]
└─ Map & render cards
```

**2. User klik card service ID 1**

```
onClick={() => navigate(`/services/${service.id}`)}
↓
Router navigate ke "/services/1"
↓
<Route path="/services/:id" element={<ServiceDetailPage />} />
↓
Render ServiceDetailPage dengan ID 1
```

**3. ServiceDetailPage tampil**

```jsx
// ServiceDetailPage.tsx
export default function ServiceDetailPage() {
  const { id } = useParams();  // id = "1"
  const { data: service } = useServiceDetailQuery(parseInt(id));  // GET /api/services/1
  
  // Render detail:
  // Name: "Cleaning Rumah"
  // Price: Rp 100,000
  // Duration: 120 menit
  // Form input: Date, Time, Address
  // Button: "Book Now"
}
```

**4. User isi form booking**

```
Date: "2024-02-25"
Time: "14:00"
Address: "Jlan Merdeka No 123, Jakarta"

Form submit → onFinish()
  ↓
useCreateBookingMutation()
  ↓
bookingService.createBooking({
  serviceId: 1,
  date: "2024-02-25",
  time: "14:00", 
  address: "Jlan Merdeka No 123, Jakarta"
})
  ↓
api.post("/api/bookings", request)
```

#### Backend Flow:

**1. Handler: BookingHandler.Create()**

```go
func (h *BookingHandler) Create(c echo.Context) error {
    // -------- STEP 1: Extract JWT --------
    userIDFloat, ok := c.Get("user_id").(float64)  // user_id = 1 (dari JWT)
    if !ok { return Unauthorized }
    userID := uint(userIDFloat)  // userID = 1

    // -------- STEP 2: Parse Request Body --------
    var req CreateBookingRequest
    c.Bind(&req)
    // req = {
    //   ServiceID: 1,
    //   Date: "2024-02-25",
    //   Time: "14:00",
    //   Address: "Jlan Merdeka No 123, Jakarta"
    // }

    // -------- STEP 3: Validasi Field --------
    if req.ServiceID == 0 || req.Date == "" || req.Time == "" {
        return BadRequest
    }

    // -------- STEP 4: Call Service --------
    err := h.service.CreateBooking(
        1,                                      // userID
        1,                                      // serviceID
        "2024-02-25",                          // date
        "14:00",                               // time
        "Jlan Merdeka No 123, Jakarta",       // address
    )

    if err != nil { return InternalError }

    // -------- STEP 5: Return Success --------
    return c.JSON(http.StatusCreated, map[string]string{
        "message": "Booking created",
    })
}
```

**2. Service: BookingService.CreateBooking()**

```go
func (s *bookingService) CreateBooking(
    userID uint,           // 1
    serviceID uint,        // 1
    date string,          // "2024-02-25"
    time string,          // "14:00"
    address string,       // "Jlan Merdeka No 123, Jakarta"
) error {
    // -------- VALIDASI 1: Field tidak boleh kosong --------
    if serviceID == 0 || date == "" || time == "" {
        return errors.New("service_id, date, time are required")
    }

    // -------- VALIDASI 2: Service harus exist --------
    service, err := s.serviceRepo.GetByID(1)
    if err != nil {
        return errors.New("service not found")
    }
    // service = Service{
    //   ID: 1,
    //   Name: "Cleaning Rumah",
    //   Price: 100000,
    //   Duration: 120
    // }

    // -------- VALIDASI 3: Semua validasi lewat, buat booking --------
    booking := models.Booking{
        UserID:    1,                                 // User yang booking
        ServiceID: 1,                                 // Service yang dipesan
        Date:      "2024-02-25",                     // Tanggal
        Time:      "14:00",                          // Jam
        Status:    "pending",                        // Default status
        Address:   "Jlan Merdeka No 123, Jakarta",  // Alamat
    }

    // -------- SIMPAN KE DATABASE --------
    return s.repo.Create(&booking)
}
```

**3. Repository: BookingRepository.Create()**

```go
func (r *bookingRepository) Create(booking *models.Booking) error {
    // INSERT ke database
    // SQL: INSERT INTO bookings (user_id, service_id, date, time, status, address, created_at, updated_at)
    //      VALUES (1, 1, '2024-02-25', '14:00', 'pending', 'Jlan Merdeka No 123, Jakarta', NOW(), NOW())
    return r.db.Create(booking).Error
    
    // Jika sukses → booking.ID auto-generated oleh database
    // Jika error → return error
}
```

**4. Database Insert Query:**

```sql
INSERT INTO bookings (user_id, service_id, date, time, status, address, created_at, updated_at)
VALUES (1, 1, '2024-02-25', '14:00', 'pending', 'Jlan Merdeka No 123, Jakarta', NOW(), NOW());

-- Result:
-- ID: 5 (auto increment)
-- UserID: 1
-- ServiceID: 1
-- Date: '2024-02-25'
-- Time: '14:00'
-- Status: 'pending'
-- Address: 'Jlan Merdeka No 123, Jakarta'
-- CreatedAt: 2024-02-20 10:30:00
-- UpdatedAt: 2024-02-20 10:30:00
```

#### Response Kembali ke Frontend:

```
Backend return HTTP 201 Created
Body: { "message": "Booking created" }
  ↓
mutation.onSuccess() dipanggil
  ↓
Show message.success("Booking created!")
  ↓
Invalidate query cache & refetch bookings
  ↓
Redirect ke /bookings atau booking-detail
```

---

### 📋 USE CASE 2: ADMIN APPROVE BOOKING

#### Frontend: Admin Dashboard

```
AdminBookingsPage.tsx
├─ useBookingsQuery() → GET /api/admin/bookings [dengan JWT]
├─ JWT Header: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
├─ Middleware ekstrak claims: { user_id: 2, role: "admin", ... }
├─ Middleware AdminOnly check: role == "admin"? YES → lanjut
├─ Handler return semua bookings
└─ Render table dengan booking-booking:
   [
     { id: 5, userID: 1, serviceID: 1, date: "2024-02-25", status: "pending", ... },
     { id: 6, userID: 3, serviceID: 2, date: "2024-02-26", status: "pending", ... }
   ]
   
Admin click "Approve" button di booking ID 5
  ↓
useApproveMutation()
  ↓
api.put("/api/admin/bookings/5/approve", {})
```

#### Backend: Approve Booking

```go
// Handler: AdminHandler.Approve()
func (h *AdminHandler) Approve(c echo.Context) error {
    // -------- STEP 1: Extract JWT --------
    user_id := c.Get("user_id")           // 2 (admin ID)
    role := c.Get("role")                 // "admin"
    
    // Middleware JWTMiddleware sudah validate token
    // Middleware AdminOnly sudah check role == "admin"
    // Jadi kita bisa langsung lanjut

    // -------- STEP 2: Get ID dari URL param --------
    id, _ := strconv.Atoi(c.Param("id"))  // id = 5
    
    // -------- STEP 3: Call Service --------
    err := h.service.UpdateStatus(uint(id), "approved")
    // service.UpdateStatus(bookingID=5, status="approved")
    
    if err != nil { return InternalError }

    // -------- STEP 4: Return Success --------
    return c.JSON(http.StatusOK, map[string]string{
        "message": "Booking approved",
    })
}

// Service: BookingService.UpdateStatus()
func (s *bookingService) UpdateStatus(id uint, status string) error {
    return s.repo.UpdateStatus(id, status)
}

// Repository: BookingRepository.UpdateStatus()
func (r *bookingRepository) UpdateStatus(id uint, status string) error {
    // UPDATE bookings SET status = 'approved' WHERE id = 5
    return r.db.Model(&models.Booking{}).
        Where("id = ?", id).
        Update("status", status).Error
}
```

**Database Query:**
```sql
UPDATE bookings 
SET status = 'approved', updated_at = NOW()
WHERE id = 5;

-- Result: Booking ID 5 sekarang status = "approved"
```

**Response:**
```
HTTP 200 OK
Body: { "message": "Booking approved" }
  ↓
Frontend message.success("Booking approved!")
  ↓
Refetch bookings list
  ↓
Update UI: Booking ID 5 sekarang show status "approved"
```

---

### 📋 Tabel Perubahan Data DB Setelah Use Case Selesai

```
BEFORE:
users:
- ID: 1, Username: john_doe, Email: user@example.com, Role: user
- ID: 2, Username: admin_user, Email: admin@example.com, Role: admin

services:
- ID: 1, Name: Cleaning Rumah, Price: 100000, Duration: 120

bookings:
(empty)

AFTER USE CASE:
users: (sama)

services: (sama)

bookings:
- ID: 5, UserID: 1, ServiceID: 1, Date: 2024-02-25, Time: 14:00, 
         Status: approved (BERUBAH dari pending), Address: Jlan Merdeka No 123
```

---

## KESIMPULAN ALUR LENGKAP

```
┌────────────────────────────────────────────────────────────────┐
│                    FULL APP FLOW                                │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 1. STARTUP                                                      │
│    └─ Backend: main.go → Load config → Connect DB → Register   │
│                         routes → Start server                   │
│    └─ Frontend: main.tsx → Load provider → AuthProvider →       │
│                           Load data dari localStorage            │
│                                                                  │
│ 2. USER LOGIN                                                   │
│    └─ Frontend: LoginForm → input email/password → POST /login  │
│    └─ Backend: AuthHandler.Login → check password → generate    │
│               JWT → return token + user                         │
│    └─ Frontend: Store token + user di localStorage → redirect   │
│                                                                  │
│ 3. USER BROWSE SERVICES                                         │
│    └─ Frontend: ServicesPage → GET /services (public)           │
│    └─ Backend: ServiceHandler → query DB → return all services  │
│    └─ Frontend: Render cards, user click untuk detail           │
│                                                                  │
│ 4. USER CREATE BOOKING                                          │
│    └─ Frontend: BookingForm → POST /bookings + JWT              │
│    └─ Backend: JWT middleware → extract user_id → call handler  │
│    └─ Backend: BookingHandler → call service → validasi → save  │
│    └─ Backend: Repository → INSERT ke table bookings (status=   │
│               pending)                                          │
│    └─ Frontend: Show success → link ke /bookings                │
│                                                                  │
│ 5. ADMIN VIEW BOOKINGS                                          │
│    └─ Frontend: AdminBookingsPage → GET /admin/bookings + JWT   │
│    └─ Backend: JWT middleware → extract role → check admin →    │
│               AdminOnly middleware → return semua bookings       │
│    └─ Frontend: Render table dengan approve/reject buttons      │
│                                                                  │
│ 6. ADMIN APPROVE BOOKING                                        │
│    └─ Frontend: click Approve button → PUT /bookings/5/approve  │
│    └─ Backend: JWT + AdminOnly check → UPDATE status ke         │
│               "approved" → return success                        │
│    └─ Frontend: Show success → update table UI                  │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

---

Semoga penjelasan ini mudah dipahami! 🎉

**Key Takeaways:**
- **Backend**: Go + Echo + PostgreSQL, layered architecture (handler → service → repository → db)
- **Frontend**: React + TypeScript + React Query, component-based, global auth state
- **Communication**: REST API dengan JSON, JWT untuk authentication
- **Data Flow**: Frontend → API → Backend → Database, response balik ke frontend
- **Authentication**: Password hashed, JWT token signed, token di-header setiap request
