# 📚 DOKUMENTASI LENGKAP - CLEANING MINI PROJECT

## Table of Contents
1. [Pengenalan Project](#pengenalan-project)
2. [Arsitektur Sistem](#arsitektur-sistem)
3. [Penjelasan Backend](#penjelasan-backend)
4. [Penjelasan Frontend](#penjelasan-frontend)
5. [Alur Data (Flow)](#alur-data)
6. [Korelasi File](#korelasi-file)
7. [Contoh Use Case](#contoh-use-case)

---

## 🎯 Pengenalan Project

**Cleaning Mini Project** adalah aplikasi web untuk **sistem pemesanan layanan cleaning (jasa kebersihan)**.

### Tipe Pengguna:
- **User Biasa**: Dapat mencari dan memesan layanan cleaning
- **Admin**: Mengelola pemesanan, cleaner, dan layanan
- **Cleaner**: Menerima jadwal pekerjaan cleaning

### Fitur Utama:
- ✅ Registrasi dan Login
- ✅ Melihat daftar layanan cleaning
- ✅ Membuat pemesanan layanan
- ✅ Pembayaran via Midtrans
- ✅ Admin mengelola pemesanan
- ✅ Cleaner melihat jadwal pekerjaan
- ✅ Autentikasi dengan JWT Token

---

## 🏗️ Arsitektur Sistem

### Teknologi yang Digunakan:

**Backend (Go):**
- **Framework**: Echo v4 (web framework ringan)
- **Database**: PostgreSQL dengan GORM (ORM)
- **Authentication**: JWT Token
- **Payment**: Midtrans API
- **Port**: 8080

**Frontend (React + TypeScript):**
- **Framework**: React 18 + Vite
- **UI Library**: Ant Design
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: TanStack React Query
- **Authentication**: Context API
- **Port**: 5173

### Struktur Layer:

```
┌─────────────────────────────────────────┐
│         FRONTEND (React/TypeScript)      │
│  ┌──────────────────────────────────┐   │
│  │     Pages (UI Components)         │   │
│  │  - HomePage, LoginPage, etc       │   │
│  └──────────────────────────────────┘   │
│                 ↓                        │
│  ┌──────────────────────────────────┐   │
│  │  Services (Business Logic)        │   │
│  │  - authService, bookingService    │   │
│  └──────────────────────────────────┘   │
│                 ↓                        │
│  ┌──────────────────────────────────┐   │
│  │  API Layer (lib/api.ts)           │   │
│  │  - Axios dengan JWT interceptor   │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
              HTTP Request
                   ↓↑
┌─────────────────────────────────────────┐
│      BACKEND (Go/Echo + GORM)            │
│  ┌──────────────────────────────────┐   │
│  │     Handlers (Router + Logic)     │   │
│  │  - AuthHandler, BookingHandler    │   │
│  └──────────────────────────────────┘   │
│                 ↓                        │
│  ┌──────────────────────────────────┐   │
│  │  Services (Business Logic)        │   │
│  │  - BookingService, ServiceService │   │
│  └──────────────────────────────────┘   │
│                 ↓                        │
│  ┌──────────────────────────────────┐   │
│  │  Repositories (Database Access)   │   │
│  │  - BookingRepository, etc         │   │
│  └──────────────────────────────────┘   │
│                 ↓                        │
│  ┌──────────────────────────────────┐   │
│  │  Models (Data Structure)          │   │
│  │  - User, Booking, Service         │   │
│  └──────────────────────────────────┘   │
│                 ↓                        │
│  ┌──────────────────────────────────┐   │
│  │  Database (PostgreSQL)            │   │
│  │  - Tables: users, bookings, etc   │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 🔴 PENJELASAN BACKEND (Go)

### 1. KONFIGURASI PROJECT (config/config.go)

**Fungsi**: Membaca environment variables dan mengatur konfigurasi aplikasi.

```go
type Config struct {
    AppPort            string  // Port API berjalan (default: 8080)
    DBHost             string  // Host Database
    DBPort             string  // Port Database (default: 5432)
    DBUser             string  // Username Database
    DBPassword         string  // Password Database
    DBName             string  // Nama Database
    DBSSLMode          string  // Mode SSL untuk koneksi DB
    JWTSecret          string  // Secret key untuk JWT Token
    MidtransServerKey  string  // API key Midtrans untuk backend
    MidtransClientKey  string  // API key Midtrans untuk frontend
}
```

**Alur**:
1. Project dimulai → `config.Load()` dipanggil
2. Membaca file `.env` menggunakan `godotenv`
3. Jika variabel tidak ada, gunakan nilai default
4. Return objek `Config` yang berisi semua konfigurasi
5. Config ini digunakan di seluruh aplikasi

---

### 2. DATABASE CONNECTION (database/db.go)

**Fungsi**: Membuat koneksi ke database PostgreSQL.

```go
func Connect(cfg *config.Config) (*gorm.DB, error) {
    // Membuat connection string
    dsn := fmt.Sprintf(
        "host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Jakarta",
        cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort, cfg.DBSSLMode,
    )
    
    // Membuka koneksi ke PostgreSQL menggunakan GORM
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    return db, err
}
```

**Penjelasan baris per baris**:
1. `fmt.Sprintf()` → Membuat connection string dengan format PostgreSQL
2. `gorm.Open()` → Membuka koneksi ke database
3. Return `db` yang bisa digunakan di seluruh aplikasi

---

### 3. DATABASE MIGRATION (database/migrate.go)

**Fungsi**: Membuat tabel di database secara otomatis.

```go
func Migrate(db *gorm.DB) error {
    return db.AutoMigrate(
        &models.User{},
        &models.Service{},
        &models.Booking{},
    )
}
```

**Yang terjadi**:
- GORM melihat struct model (User, Service, Booking)
- Membuat tabel di database sesuai field di struct
- Jika tabel sudah ada, tidak ada yang dikerjakan
- Jika ada perubahan field, GORM akan update tabel

---

### 4. MODELS (Data Structures)

#### **User Model** (models/user.go)

```go
type User struct {
    ID           uint      `gorm:"primaryKey" json:"id"`           // ID unik user
    Username     string    `gorm:"type:varchar(100);not null"`     // Nama user
    Email        string    `gorm:"type:varchar(120);uniqueIndex"`  // Email (tidak boleh duplikat)
    PasswordHash string    `gorm:"type:text;not null" json:"-"`    // Password terenkripsi
    Role         string    `gorm:"size:20"`                        // Role: "user", "admin", "cleaner"
    CreatedAt    time.Time                                         // Waktu dibuat
    UpdatedAt    time.Time                                         // Waktu diupdate terakhir
}
```

**Penjelasan field**:
- `gorm:"primaryKey"` → Field ini adalah ID unik (primary key)
- `json:"id"` → Saat di-JSON, namanya jadi "id"
- `json:"-"` → Field ini tidak ditampilkan saat di-JSON (password tidak boleh terkirim)
- `uniqueIndex` → Email tidak boleh duplikat di database

#### **Service Model** (models/service.go)

```go
type Service struct {
    ID          uint           // ID unik service
    Name        string         // Nama layanan (e.g., "General Cleaning")
    Description string         // Deskripsi layanan
    Price       int            // Harga dalam rupiah
    Duration    int            // Durasi dalam menit
    CreatedAt   time.Time      // Waktu dibuat
    UpdatedAt   time.Time      // Waktu diupdate
    DeletedAt   gorm.DeletedAt // Soft delete (penandaan, tidak dihapus benar-benar)
}
```

**Penjelasan**:
- `DeletedAt` → Saat delete, field ini diisi dengan waktu, data tidak benar-benar dihapus
- Berguna untuk audit trail (mencatat sejarah)

#### **Booking Model** (models/booking.go)

```go
type Booking struct {
    ID                uint      // ID unik pemesanan
    
    // Relasi ke User (yang memesan)
    UserID            uint      // ID user yang memesan
    User              User      // Object user
    
    // Relasi ke Service (layanan yang dipesan)
    ServiceID         uint      // ID service yang dipesan
    Service           Service   // Object service
    
    // Relasi ke Cleaner (yang mengerjakan)
    CleanerID         *uint     // ID cleaner (*uint = bisa null)
    Cleaner           *User     // Object cleaner
    
    // Detail Pemesanan
    Date              string    // Tanggal (e.g., "2025-02-27")
    Time              string    // Waktu (e.g., "10:00")
    Status            string    // Status: pending, approved, rejected, canceled
    Address           string    // Alamat lokasi cleaning
    
    // Pembayaran
    PaymentStatus     string    // Status pembayaran: unpaid, paid, failed
    SnapToken         string    // Token dari Midtrans untuk pembayaran
    MidTransOrderID   string    // ID order dari Midtrans
    
    CreatedAt         time.Time // Waktu dibuat
    UpdatedAt         time.Time // Waktu diupdate
}
```

**Penjelasan relasi**:
- `User` dan `UserID` → Satu booking milik satu user
- `Service` dan `ServiceID` → Satu booking untuk satu service
- `Cleaner` dan `CleanerID` → Satu booking dikerjakan oleh satu cleaner (bisa null awalnya)

---

### 5. AUTHENTICATION FLOW

#### **A. Register User** (handlers/auth_handler.go - Register method)

**Endpoint**: 
```
POST /auth/register
```

**Request Body**:
```json
{
    "username": "john",
    "email": "john@example.com",
    "password": "password123"
}
```

**Proses Baris Per Baris**:

1. **Validasi Input**
```go
if req.Username == "" || req.Email == "" || req.Password == "" {
    return c.JSON(http.StatusBadRequest, "Username, Email, Password required!")
}
```
- Cek apakah ada field yang kosong

2. **Cek Email Sudah Terdaftar**
```go
var existing models.User
err := h.DB.Where("email = ?", req.Email).First(&existing).Error
if err == nil {
    // Email sudah ada
    return c.JSON(http.StatusBadRequest, "Email Already Registered!")
}
```
- Query ke database: cari user dengan email yang sama
- Jika ditemukan (err == nil), maka email sudah terdaftar

3. **Hash Password**
```go
hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
```
- Ubah password plain text menjadi hash (enkripsi)
- `bcrypt.DefaultCost` → Tingkat keamanan hashing
- Password tidak disimpan plain text! Sangat penting untuk keamanan!

4. **Buat User Baru**
```go
user := models.User{
    Username:     req.Username,
    Email:        req.Email,
    PasswordHash: string(hashedPassword),
    Role:         "user",  // Default role adalah "user"
}

if err := h.DB.Create(&user).Error; err != nil {
    return c.JSON(http.StatusInternalServerError, "Failed to Create User!")
}
```
- Buat struct user dengan data mereka
- `h.DB.Create()` → Insert ke database

5. **Return Response**
```go
return c.JSON(http.StatusCreated, "User Registered Successfully")
```

**Diagram Flow Register**:
```
User Input
   ↓
Validasi Input
   ↓ ✓ Valid
Cek Email di DB
   ↓ ✓ Email Belum Ada
Hash Password dengan bcrypt
   ↓
Simpan User ke DB
   ↓
Response: 201 Created
```

---

#### **B. Login User** (handlers/auth_handler.go - Login method)

**Endpoint**:
```
POST /auth/login
```

**Request Body**:
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

**Proses**:

1. **Validasi Input**
```go
if req.Email == "" || req.Password == "" {
    return c.JSON(http.StatusBadRequest, "Email and Password are required!")
}
```

2. **Cari User di Database**
```go
var user models.User
err := h.DB.Where("email = ?", req.Email).First(&user).Error
if err != nil {
    return c.JSON(http.StatusUnauthorized, "Invalid email or password")
}
```
- Query: cari user dengan email ini
- Jika tidak ditemukan, return error "Invalid email or password"
- (Pesan error sama untuk email dan password, untuk keamanan)

3. **Verifikasi Password**
```go
err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
if err != nil {
    return c.JSON(http.StatusUnauthorized, "Invalid email or password")
}
```
- Bandingkan password yang dikirim dengan hash yang disimpan
- `bcrypt.CompareHashAndPassword()` → Membandingkan secara aman
- Jika tidak cocok, return error

4. **Generate JWT Token**
```go
token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
if err != nil {
    return c.JSON(http.StatusInternalServerError, "Failed to generate token")
}
```
- Buat JWT token yang berisi: user ID, email, role
- Token ini digunakan untuk request ke endpoint protected

5. **Return Response**
```go
return c.JSON(http.StatusOK, map[string]interface{}{
    "message": "Login successful",
    "token": token,
    "user": map[string]interface{}{
        "id": user.ID,
        "username": user.Username,
        "email": user.Email,
        "role": user.Role,
    },
})
```

**Diagram Flow Login**:
```
User Input Email & Password
   ↓
Validasi Input
   ↓ ✓ Valid
Cari User di DB
   ↓ ✓ Ditemukan
Verifikasi Password dengan bcrypt
   ↓ ✓ Password Cocok
Generate JWT Token
   ↓
Return Token & User Info (200 OK)
```

---

### 6. JWT TOKEN MECHANISM

#### **Generate Token** (utils/jwt.go)

```go
type JwtCustomClaims struct {
    UserID uint   `json:"user_id"`
    Email  string `json:"email"`
    Role   string `json:"role"`
    jwt.RegisteredClaims  // Contain: ExpiresAt, IssuedAt, NotBefore
}

func GenerateToken(userID uint, email string, role string) (string, error) {
    claims := &JwtCustomClaims{
        UserID: userID,
        Email:  email,
        Role:   role,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),  // Hangus dalam 24 jam
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    secret := os.Getenv("JWT_SECRET")
    return token.SignedString([]byte(secret))
}
```

**Penjelasan**:
- **Claims** → Data yang dimasukkan ke token (user_id, email, role)
- **ExpiresAt** → Token berlaku 24 jam dari sekarang
- **SigningMethodHS256** → Algoritma HMAC SHA256 (standar keamanan)
- **secret** → Kunci rahasia untuk menandatangani token
- Hasil: string token yang panjang dan terenkripsi

**Contoh Token** (isi token):
```
Header: {
    "alg": "HS256",
    "typ": "JWT"
}

Payload: {
    "user_id": 1,
    "email": "john@example.com",
    "role": "user",
    "exp": 1234567890,
    "iat": 1234567000
}

Signature: <hash dari header + payload + secret>
```

#### **Verify Token** (middleware/jwt_middleware.go)

**Endpoint yang Protected**:
```
GET /api/profile
PUT /api/bookings/:id/approve
...dan yang lain
```

**Middleware - JWTMiddleware**:

```go
func JWTMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
    return func(c echo.Context) error {
        // 1. Ambil header "Authorization"
        authHeader := c.Request().Header.Get("Authorization")
        
        if authHeader == "" {
            return c.JSON(http.StatusUnauthorized, "Missing authorization header")
        }

        // 2. Parse header: "Bearer <token>"
        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || parts[0] != "Bearer" {
            return c.JSON(http.StatusUnauthorized, "Invalid authorization format")
        }

        tokenString := parts[1]

        // 3. Verify token signature
        cfg := config.Load()
        secret := []byte(cfg.JWTSecret)

        token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
            if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, jwt.ErrSignatureInvalid
            }
            return secret, nil
        })

        // 4. Check token validity
        if err != nil || !token.Valid {
            return c.JSON(http.StatusUnauthorized, "Invalid or expired token")
        }

        // 5. Extract claims dan simpan di context
        if claims, ok := token.Claims.(jwt.MapClaims); ok {
            c.Set("user_id", claims["user_id"])
            c.Set("email", claims["email"])
            c.Set("role", claims["role"])
        }

        // 6. Pass ke handler berikutnya
        return next(c)
    }
}
```

**Penjelasan Baris Per Baris**:

1. **Ambil Authorization Header**
```go
authHeader := c.Request().Header.Get("Authorization")
```
- Header format: `Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`

2. **Parse Bearer Token**
```go
parts := strings.Split(authHeader, " ")
// parts[0] = "Bearer"
// parts[1] = "eyJhbGciOiJIUzI1NiIs..."
```
- Split string dengan space
- Bagian pertama harus "Bearer"
- Bagian kedua adalah token

3. **Verify Signature**
```go
token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
    if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
        return nil, jwt.ErrSignatureInvalid
    }
    return secret, nil
})
```
- `jwt.Parse()` → Membaca dan memverifikasi token
- Fungsi anonymous → Check algoritma yang digunakan
- Return secret key untuk verifikasi signature
- Jika signature tidak cocok, error

4. **Simpan di Context**
```go
c.Set("user_id", claims["user_id"])
c.Set("email", claims["email"])
c.Set("role", claims["role"])
```
- Simpan data token di context
- Handler berikutnya bisa akses dengan `c.Get("user_id")`

5. **Lanjut ke Handler**
```go
return next(c)
```
- Jika token valid, lanjut ke handler berikutnya
- Jika token tidak valid, return error sebelum handler dipanggil

**Diagram Alur JWT**:
```
Request dengan Authorization Header
   ↓
JWTMiddleware menangkap
   ↓
Extract token dari header
   ↓
Parse dan verify signature
   ↓
Token Valid? 
   ├─ Ya → Simpan claims di context → Lanjut ke handler
   └─ Tidak → Return 401 Unauthorized
```

---

### 7. BOOKING MANAGEMENT

#### **Create Booking** (handlers/booking_handler.go)

**Endpoint**:
```
POST /api/bookings
Headers: Authorization: Bearer <token>
```

**Request Body**:
```json
{
    "serviceId": 1,
    "date": "2025-02-27",
    "time": "10:00",
    "address": "Jl. Merdeka No. 123, Jakarta"
}
```

**Handler - Create**:

```go
func (h *BookingHandler) Create(c echo.Context) error {
    // 1. Ambil user ID dari JWT token (sudah di-set middleware)
    userIDFloat, ok := c.Get("user_id").(float64)
    if !ok {
        return c.JSON(http.StatusUnauthorized, "Unauthorized")
    }
    userID := uint(userIDFloat)

    // 2. Bind request body
    var req CreateBookingRequest
    if err := c.Bind(&req); err != nil {
        return c.JSON(http.StatusBadRequest, "Invalid request")
    }

    // 3. Validasi input
    if req.ServiceID == 0 || req.Date == "" || req.Time == "" {
        return c.JSON(http.StatusBadRequest, "service_id, date, time are required")
    }

    // 4. Panggil service layer
    err := h.service.CreateBooking(
        userID,
        req.ServiceID,
        req.Date,
        req.Time,
        req.Address,
    )

    if err != nil {
        return c.JSON(http.StatusInternalServerError, "Failed create booking")
    }

    return c.JSON(http.StatusCreated, "Booking created")
}
```

**Service Layer - CreateBooking** (services/booking_service.go):

```go
func (s *bookingService) CreateBooking(
    userID uint,
    serviceID uint,
    date string,
    time string,
    address string,
) error {
    // 1. Validasi parameter
    if serviceID == 0 || date == "" || time == "" {
        return errors.New("service_id, date, time are required")
    }

    // 2. Cek apakah service ada di database
    _, err := s.serviceRepo.GetByID(serviceID)
    if err != nil {
        return errors.New("service not found")
    }

    // 3. Buat struct booking
    booking := models.Booking{
        UserID:    userID,
        ServiceID: serviceID,
        Date:      date,
        Time:      time,
        Status:    "pending",  // Status awal adalah pending
        Address:   address,
    }

    // 4. Simpan ke repository (repository akan insert ke DB)
    return s.repo.Create(&booking)
}
```

**Repository Layer - Create** (repositories/booking_repository.go):

```go
func (r *bookingRepository) Create(booking *models.Booking) error {
    return r.db.Create(booking).Error
}
```
- `r.db.Create(booking)` → GORM insert ke tabel bookings
- Return error jika ada masalah

**Diagram Create Booking**:
```
Frontend kirim POST /api/bookings
   ↓
JWTMiddleware validate token
   ↓ ✓ Valid
BookingHandler.Create
   ├─ Ambil userID dari context
   ├─ Bind request body
   ├─ Validasi input
   └─ Panggil service.CreateBooking()
        ↓
        BookingService.CreateBooking
        ├─ Validasi parameter
        ├─ Check service ada
        └─ Panggil repo.Create()
             ↓
             BookingRepository.Create
             └─ GORM Insert ke DB
                  ↓
                  Database: INSERT INTO bookings(...)
                       ↓
                       Response: 201 Created
```

#### **Get My Bookings** (handlers/booking_handler.go)

**Endpoint**:
```
GET /api/bookings
Headers: Authorization: Bearer <token>
```

**Handler**:
```go
func (h *BookingHandler) MyBookings(c echo.Context) error {
    userIDFloat, ok := c.Get("user_id").(float64)
    if !ok {
        return c.JSON(http.StatusUnauthorized, "Unauthorized")
    }
    userID := uint(userIDFloat)

    bookings, err := h.service.GetMyBookings(userID)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, "Failed get bookings")
    }

    return c.JSON(http.StatusOK, bookings)
}
```

**Service**:
```go
func (s *bookingService) GetMyBookings(userID uint) ([]models.Booking, error) {
    return s.repo.FindByUserID(userID)
}
```

**Repository**:
```go
func (r *bookingRepository) FindByUserID(userID uint) ([]models.Booking, error) {
    var bookings []models.Booking

    err := r.db.
        Preload("Service", func(db *gorm.DB) *gorm.DB {
            return db.Unscoped()  // Include soft-deleted services
        }).
        Preload("User").
        Preload("Cleaner").
        Where("user_id = ?", userID).
        Find(&bookings).Error

    return bookings, err
}
```

**Penjelasan Query**:
- `Preload("Service")` → JOIN dengan tabel services (ambil data service)
- `Unscoped()` → Include soft-deleted services (untuk keperluan historical data)
- `Preload("User")` → JOIN dengan tabel users
- `Preload("Cleaner")` → JOIN dengan tabel users (sebagai cleaner)
- `Where("user_id = ?", userID)` → Filter hanya booking user ini
- `Find(&bookings)` → Execute query dan simpan hasil ke slice

**SQL yang dihasilkan**:
```sql
SELECT * FROM bookings 
WHERE user_id = 1
LEFT JOIN services ON bookings.service_id = services.id
LEFT JOIN users ON bookings.user_id = users.id
LEFT JOIN users AS cleaners ON bookings.cleaner_id = cleaners.id
```

---

#### **Cancel Booking** (handlers/booking_handler.go)

**Endpoint**:
```
PUT /api/bookings/:id/cancel
Headers: Authorization: Bearer <token>
```

**Handler**:
```go
func (h *BookingHandler) Cancel(c echo.Context) error {
    userID := uint(c.Get("user_id").(float64))
    id, _ := strconv.Atoi(c.Param("id"))

    err := h.service.CancelBooking(uint(id), userID)
    if err != nil {
        return c.JSON(http.StatusBadRequest, err.Error())
    }

    return c.JSON(http.StatusOK, "Booking Canceled")
}
```

**Service**:
```go
func (s *bookingService) CancelBooking(id uint, userID uint) error {
    return s.repo.CancelBooking(id, userID)
}
```

**Repository**:
```go
func (r *bookingRepository) CancelBooking(id uint, userID uint) error {
    result := r.db.Model(&models.Booking{}).
        Where("id = ? AND user_id = ? AND status = ?", id, userID, "pending").
        Update("status", "canceled")

    if result.RowsAffected == 0 {
        return errors.New("Booking not found or cannot be canceled")
    }

    return result.Error
}
```

**Penjelasan**:
- Hanya bisa cancel booking dengan status "pending"
- Hanya bisa cancel booking milik user sendiri (security)
- `RowsAffected` → Jumlah row yang ter-update
- Jika 0, berarti booking tidak ditemukan atau tidak bisa di-cancel

---

### 8. ADMIN FUNCTIONS

#### **Approve Booking with Cleaner** (handlers/admin_handler.go)

**Endpoint**:
```
PUT /api/admin/bookings/:id/approve
Headers: 
  Authorization: Bearer <token>
  (Admin only - dijaga middleware)
```

**Request Body**:
```json
{
    "cleaner_id": 2
}
```

**Handler**:
```go
func (h *AdminHandler) Approve(c echo.Context) error {
    id, _ := strconv.Atoi(c.Param("id"))

    type ApproveRequest struct {
        CleanerID uint `json:"cleaner_id"`
    }

    var req ApproveRequest
    if err := c.Bind(&req); err != nil || req.CleanerID == 0 {
        return c.JSON(http.StatusBadRequest, "cleaner_id is required")
    }

    err := h.bookingService.ApproveWithCleaner(uint(id), req.CleanerID)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, "Failed to approve booking")
    }

    return c.JSON(http.StatusOK, "Booking approved")
}
```

**Service**:
```go
func (s *bookingService) ApproveWithCleaner(bookingID uint, cleanerID uint) error {
    return s.repo.ApproveWithCleaner(bookingID, cleanerID)
}
```

**Repository**:
```go
func (r *bookingRepository) ApproveWithCleaner(id uint, cleanerID uint) error {
    return r.db.Model(&models.Booking{}).
        Where("id = ?", id).
        Updates(map[string]interface{}{
            "status":     "approved",
            "cleaner_id": cleanerID,
        }).Error
}
```

**SQL**:
```sql
UPDATE bookings 
SET status = 'approved', cleaner_id = 2
WHERE id = 1
```

---

### 9. PAYMENT WITH MIDTRANS

#### **Create Snap Token** (handlers/payment_handler.go)

**Endpoint**:
```
POST /api/bookings/:id/pay
Headers: Authorization: Bearer <token>
```

**Handler**:
```go
func (h *PaymentHandler) CreateSnapToken(c echo.Context) error {
    bookingID := c.Param("id")
    userID := uint(c.Get("user_id").(float64))

    // 1. Cari booking di database
    booking, err := h.bookingRepo.FindByID(parseUint(bookingID))
    if err != nil {
        return c.JSON(http.StatusNotFound, "Booking not found")
    }

    // 2. Cek apakah booking milik user ini (security)
    if booking.UserID != userID {
        return c.JSON(http.StatusForbidden, "Forbidden")
    }

    // 3. Cek apakah sudah punya token (jangan buat ulang)
    if booking.SnapToken != "" && booking.PaymentStatus == "unpaid" {
        return c.JSON(http.StatusOK, map[string]string{
            "snap_token": booking.SnapToken,
            "client_key": h.cfg.MidtransClientKey,
        })
    }

    // 4. Buat Order ID unik
    orderID := fmt.Sprintf("booking-%s-%d", bookingID, time.Now().Unix())

    // 5. Inisialisasi Midtrans Snap client
    var snapClient snap.Client
    snapClient.New(h.cfg.MidtransServerKey, midtrans.Sandbox)

    // 6. Buat request pembayaran
    req := &snap.Request{
        TransactionDetails: midtrans.TransactionDetails{
            OrderID:  orderID,
            GrossAmt: int64(booking.Service.Price),  // Harga dari service
        },
        CustomerDetail: &midtrans.CustomerDetails{
            FName: booking.User.Username,
            Email: booking.User.Email,
        },
    }

    // 7. Call Midtrans API
    snapResp, snapErr := snapClient.CreateTransaction(req)

    if snapResp == nil || snapResp.Token == "" {
        if snapErr != nil {
            log.Println("Midtrans error:", snapErr)
        }
        return c.JSON(http.StatusInternalServerError, "Failed to Create Payment")
    }

    // 8. Simpan token ke database
    if err := h.bookingRepo.UpdatePaymentToken(booking.ID, snapResp.Token, orderID); err != nil {
        log.Println("Error UpdatePaymentToken:", err)
        return c.JSON(http.StatusInternalServerError, "Failed to save token")
    }

    // 9. Return token ke frontend
    return c.JSON(http.StatusOK, map[string]string{
        "snap_token": snapResp.Token,
        "client_key": h.cfg.MidtransClientKey,
    })
}
```

**Alur Pembayaran**:
```
User klik "Bayar"
   ↓
Frontend kirim POST /api/bookings/1/pay
   ↓
Handler cek booking ada
   ↓
Handler cek ini booking milik user (security)
   ↓
Handler buat Order ID unique: "booking-1-1234567890"
   ↓
Handler call Midtrans API CreateTransaction
   ↓
Midtrans return Snap Token
   ↓
Handler simpan token ke database
   ↓
Handler return token + client_key ke frontend
   ↓
Frontend terima token
   ↓
Frontend inisialisasi Midtrans Snap widget
   ↓
User bayar via Midtrans (CC, e-wallet, bank transfer, dll)
   ↓
Midtrans kirim webhook ke backend
   ↓
Backend update payment_status = 'paid'
```

#### **Handle Webhook** (handlers/payment_handler.go)

**Endpoint**:
```
POST /payment/webhook
(Public - tidak perlu JWT, tapi Midtrans verify)
```

**Handler**:
```go
func (h *PaymentHandler) HandleWebhook(c echo.Context) error {
    // 1. Parse webhook notification
    var notification map[string]interface{}
    if err := c.Bind(&notification); err != nil {
        return c.JSON(http.StatusBadRequest, nil)
    }

    // 2. Extract data dari webhook
    orderID := notification["order_id"].(string)
    transactionStatus := notification["transaction_status"].(string)
    fraudStatus, _ := notification["fraud_status"].(string)

    // 3. Cari booking dari order ID
    booking, err := h.bookingRepo.FindByOrderID(orderID)
    if err != nil {
        return c.JSON(http.StatusNotFound, nil)
    }

    // 4. Update status pembayaran berdasarkan transaction status
    if transactionStatus == "capture" && fraudStatus == "accept" {
        h.bookingRepo.UpdatePaymentStatus(booking.ID, "paid")
    } else if transactionStatus == "settlement" {
        h.bookingRepo.UpdatePaymentStatus(booking.ID, "paid")
    } else if transactionStatus == "deny" || transactionStatus == "cancel" || transactionStatus == "expire" {
        h.bookingRepo.UpdatePaymentStatus(booking.ID, "failed")
    }

    return c.JSON(http.StatusOK, nil)
}
```

**Penjelasan Status Midtrans**:
- `settlement` → Pembayaran berhasil dan final
- `capture` → Pembayaran berhasil (instant payment)
- `pending` → Pembayaran belum selesai (menunggu)
- `deny` → Pembayaran ditolak
- `cancel` → Pembayaran dibatalkan user
- `expire` → Pembayaran kedaluwarsa

---

### 10. MIDDLEWARE (Security Layers)

#### **Admin Only Middleware** (middleware/admin_only.go)

```go
func AdminOnly(next echo.HandlerFunc) echo.HandlerFunc {
    return func(c echo.Context) error {
        role, ok := c.Get("role").(string)
        if !ok || role != "admin" {
            return c.JSON(http.StatusForbidden, "Only admin can access this")
        }
        return next(c)
    }
}
```

**Penjelasan**:
- Ambil `role` dari context (sudah di-set JWTMiddleware)
- Jika tidak string atau bukan "admin", block akses
- Jika "admin", lanjut ke handler

#### **Cleaner Only Middleware** (middleware/cleaner_only.go)

Sama seperti AdminOnly, tapi check `role == "cleaner"`

---

## 🔵 PENJELASAN FRONTEND (React + TypeScript)

### 1. ENTRY POINT (main.tsx)

```jsx
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRouter from "./app/router";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

const queryClient = new QueryClient();

const root = createRoot(document.getElementById("root")!);

root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
```

**Penjelasan Layer by Layer** (dari dalam ke luar):

```
┌─────────────────────────────────────────────┐
│        AppRouter (Routing Logic)            │
│       Routes: /, /login, /profile, etc      │
└─────────────────────────────────────────────┘
                      ↑
┌─────────────────────────────────────────────┐
│      AuthProvider (Auth State)              │
│   Manage: user, token, isAuthenticated      │
└─────────────────────────────────────────────┘
                      ↑
┌─────────────────────────────────────────────┐
│    BrowserRouter (URL Routing)              │
│     Manage: pathname, navigation            │
└─────────────────────────────────────────────┘
                      ↑
┌─────────────────────────────────────────────┐
│  QueryClientProvider (React Query)          │
│   Manage: API cache, loading, error state   │
└─────────────────────────────────────────────┘
```

**Fungsi Masing-masing**:

1. **QueryClientProvider**
   - Menyediakan TanStack React Query (library untuk fetch data)
   - Otomatis cache, refetch, manage loading state
   - Membuat API call lebih mudah

2. **BrowserRouter**
   - Enable routing di React
   - Membaca URL dan display component yang sesuai
   - Enable `<Link>` dan `useNavigate()`

3. **AuthProvider**
   - Menyediakan auth state ke seluruh app
   - Siapa user yang login, token, dst
   - Bisa diakses dengan `useAuth()` hook

4. **AppRouter**
   - Define semua routes
   - Protected routes, public routes, admin routes

---

### 2. AUTH CONTEXT (context/AuthContext.tsx)

**Fungsi**: Menyimpan data auth (user, token) dan share ke seluruh app.

```tsx
type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
};

const STORAGE_KEY = "cleaning_auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Login: set state + simpan ke localStorage
  function login(newToken: string, newUser: AuthUser) {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: newToken, user: newUser })
    );
  }

  // Logout: clear state + clear localStorage
  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    navigate("/login");
  }

  // Restore auth dari localStorage (saat page refresh/reload)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setToken(parsed.token);
        setUser(parsed.user);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
```

**Penjelasan Baris Per Baris**:

1. **State Management**
```tsx
const [user, setUser] = useState<AuthUser | null>(null);
const [token, setToken] = useState<string | null>(null);
```
- `user` → Object user yang login (id, name, email, role)
- `token` → JWT token dari backend
- Awalnya null (belum login)

2. **login Function**
```tsx
function login(newToken: string, newUser: AuthUser) {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: newToken, user: newUser }));
}
```
- Set state
- Simpan ke `localStorage` (browser storage)
- Jadi kalau refresh, data masih ada

3. **logout Function**
```tsx
function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    navigate("/login");
}
```
- Clear state
- Clear localStorage
- Redirect ke login page

4. **useEffect untuk Restore Auth**
```tsx
useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            setToken(parsed.token);
            setUser(parsed.user);
        } catch {
            localStorage.removeItem(STORAGE_KEY);
        }
    }
    setIsLoading(false);
}, []);
```
- Runs sekali saat component mount
- Cek localStorage apakah ada saved auth
- Jika ada, restore state (jadi user tidak perlu login lagi setelah refresh)
- `setIsLoading(false)` → Signal bahwa auth check selesai

5. **useAuth Hook**
```tsx
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
```
- Custom hook untuk akses auth context
- Bisa digunakan di komponen manapun
- Contoh: `const { user, token, login } = useAuth();`

---

### 3. ROUTING (app/router.tsx)

```tsx
function DefaultRedirect() {
  const { user } = useAuth();
  if (user?.role === "admin") return <Navigate to="/admin/services" replace />;
  if (user?.role === "cleaner") return <Navigate to="/cleaner/schedule" replace />;
  return <Navigate to="/" replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
      </Route>

      {/* AUTH ROUTES */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* USER PROTECTED ROUTES */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>
      </Route>

      {/* ADMIN PROTECTED ROUTES */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/services" element={<AdminServicesPage />} />
          <Route path="/admin/cleaners" element={<AdminCleanerPage />} />
        </Route>
      </Route>

      {/* CLEANER PROTECTED ROUTES */}
      <Route element={<ProtectedRoute cleanerOnly />}>
        <Route element={<CleanerLayout />}>
          <Route path="/cleaner/schedule" element={<CleanerSchedulePage />} />
          <Route path="/cleaner/change-password" element={<ChangePasswordPage />} />
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
```

**Penjelasan Routes Structure**:

1. **Public Routes** - Bisa diakses siapa saja, tidak perlu login
   - `/` → HomePage
   - `/services` → Daftar services
   - `/services/:id` → Detail service
   - Wrapper: `<MainLayout />` → Header, Footer, etc

2. **Auth Routes** - Untuk login dan register
   - `/login` dan `/register`
   - Wrapper: `<AuthLayout />` → Layout khusus auth
   - Jika sudah login, redirect ke home

3. **User Protected Routes** - Hanya user biasa (role="user")
   - `/bookings` → Lihat booking saya
   - `/profile` → Lihat/edit profile
   - `/change-password` → Ganti password
   - Wrapper: `<ProtectedRoute />` → Check apakah sudah login
   - Jika belum login, redirect ke `/login`

4. **Admin Protected Routes** - Hanya admin (role="admin")
   - `/admin/bookings` → Kelola semua bookings
   - `/admin/services` → Kelola services
   - `/admin/cleaners` → Kelola cleaners
   - Wrapper: `<ProtectedRoute adminOnly />` → Check role="admin"

5. **Cleaner Protected Routes** - Hanya cleaner (role="cleaner")
   - `/cleaner/schedule` → Lihat jadwal saya
   - Wrapper: `<ProtectedRoute cleanerOnly />` → Check role="cleaner"

6. **Fallback** - Route yang tidak ada
   - `*` → Semua URL yang tidak match → Redirect ke home

---

### 4. API SETUP (lib/api.ts)

```typescript
import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

// Interceptor: Tambah Authorization header otomatis
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const saved = localStorage.getItem("cleaning_auth");

    if (saved && config.headers) {
      try {
        const parsed = JSON.parse(saved);
        const token = parsed.token;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
```

**Penjelasan**:

1. **Create Axios Instance**
```typescript
const api = axios.create({
  baseURL: "http://localhost:8080",
});
```
- `axios` → HTTP client library
- `baseURL` → Semua request akan ke URL ini
- Contoh: `api.get("/api/services")` → hit `http://localhost:8080/api/services`

2. **Request Interceptor**
```typescript
api.interceptors.request.use((config) => {
    const saved = localStorage.getItem("cleaning_auth");
    const token = JSON.parse(saved).token;
    config.headers.Authorization = `Bearer ${token}`;
    return config;
})
```
- Runs setiap kali ada request
- Otomatis tambah header: `Authorization: Bearer <token>`
- Jadi tidak perlu manual tambah header di setiap request

**Keuntungan**:
- Sekali setup, semua request otomatis dapat token
- Jika token berubah, semua request pakai yang baru
- Code lebih clean, tidak banyak repetisi

---

### 5. LOGIN FLOW

#### **Auth Service** (services/authService.ts)

```typescript
import api from "../lib/api";
import type { LoginRequest, LoginResponse } from "../contracts/auth.contract";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const res = await api.post("/auth/login", payload);
  return res.data;
}
```

**Penjelasan**:
- Async function yang call backend `/auth/login`
- Pass user input (`email` dan `password`)
- Return response dari backend (token + user info)

#### **Login Page** (pages/auth/Login.tsx)

```tsx
export default function Login() {
  return (
    <div className="w-full max-w-md">
      <Title level={3} className="text-center mb-6">
        Login
      </Title>
      <LoginForm />
      <div className="mt-4 flex justify-between text-sm">
        <Link to="/register" className="text-blue-500 hover:underline">
          Register
        </Link>
      </div>
    </div>
  );
}
```

**Penjelasan**:
- Simple page yang display `<LoginForm />` component
- Link ke register page

#### **Login Form Component** (components/organisms/LoginForm.tsx)

```tsx
export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const mutation = useMutation({
    mutationFn: loginService,  // Function yang di-call saat submit

    onSuccess: (data, variables) => {
      // Runs jika login berhasil
      const user = {
        id: data.user.id,
        name: data.user.username,
        email: data.user.email,
        role: data.user.role,
      };

      // 1. Simpan auth ke context
      login(data.token, user);

      // 2. Show success message
      message.success("Login successful!");

      // 3. Redirect berdasarkan role
      if (data.user.role === "admin") {
        navigate("/admin/bookings");
      } else if (data.user.role === "cleaner") {
        navigate("/cleaner/schedule");
      } else {
        navigate("/services");
      }
    },

    onError: () => {
      // Runs jika login gagal
      message.error("Invalid email or password");
    },
  });

  const onFinish = (values: LoginFormValues) => {
    // Runs saat form di-submit
    mutation.mutate(values);  // Trigger mutation
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
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

      <FormInput
        name="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        rules={[{ required: true, message: "Please input your password!" }]}
      />

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

**Penjelasan Baris Per Baris**:

1. **useMutation Hook**
```typescript
const mutation = useMutation({
    mutationFn: loginService,
    onSuccess: (data) => { ... },
    onError: () => { ... },
})
```
- React Query hook untuk async operation
- `mutationFn` → Function yang di-call (loginService)
- `onSuccess` → Callback jika berhasil
- `onError` → Callback jika error

2. **onSuccess Callback**
```typescript
onSuccess: (data) => {
    const user = {
        id: data.user.id,
        name: data.user.username,
        email: data.user.email,
        role: data.user.role,
    };
    
    login(data.token, user);  // Simpan ke AuthContext
    message.success("Login successful!");
    
    // Redirect berdasarkan role
    if (data.user.role === "admin") {
        navigate("/admin/bookings");
    } else if (data.user.role === "cleaner") {
        navigate("/cleaner/schedule");
    } else {
        navigate("/services");
    }
}
```
- Backend return: `{ token, user: { id, username, email, role } }`
- Transform ke format yang diinginkan
- Call `login()` dari AuthContext untuk simpan
- Show success notification
- Redirect ke halaman sesuai role

3. **Form onFinish**
```tsx
const onFinish = (values: LoginFormValues) => {
    mutation.mutate(values);
}
```
- Runs saat form di-submit dengan data valid
- `mutation.mutate()` → Trigger loginService
- Values adalah Ant Form result: `{ email, password }`

4. **Form Component**
```tsx
<Form layout="vertical" onFinish={onFinish}>
    <FormInput ... />
    <Button loading={mutation.isPending}>Login</Button>
</Form>
```
- Ant Design Form
- `onFinish` → Run saat form valid dan di-submit
- Button `loading={mutation.isPending}` → Show spinner saat loading

**Diagram Login Flow**:
```
User Input Email & Password
   ↓
Click "Login" Button
   ↓
Form Validate
   ↓ ✓ Valid
Trigger mutation.mutate(values)
   ↓
Call loginService({ email, password })
   ↓
API call: POST /auth/login
   ↓
Backend validate & generate token
   ↓
Backend return: { token, user { id, username, email, role } }
   ↓
onSuccess callback
   ├─ Call login() → Update AuthContext
   ├─ Show success notification
   └─ Redirect berdasarkan role
```

---

### 6. BOOKING SERVICE & QUERIES

#### **Booking Service** (services/bookingService.ts)

```typescript
export type Booking = {
  id: number;
  userId: number;
  serviceId: number;
  date: string;
  time: string;
  status: string;
  address?: string;
  paymentStatus: string;
  snapToken?: string;

  service?: {
    id: number;
    name: string;
    price: number;
    durationMinutes: number;
    isDeleted?: boolean;
  };

  cleaner?: {
    id: number;
    name: string;
  }
};

// Mapping dari API response ke frontend format
function mapBooking(b: BookingApi): Booking {
  return {
    id: b.ID,
    userId: b.UserID,
    serviceId: b.ServiceID,
    date: b.Date,
    time: b.Time,
    status: b.Status,
    address: b.Address,
    paymentStatus: b.PaymentStatus ?? "unpaid",
    snapToken: b.SnapToken,

    service: b.Service
      ? {
          id: b.Service.ID,
          name: b.Service.Name,
          price: b.Service.Price,
          durationMinutes: b.Service.Duration,
          isDeleted: !!b.Service.DeletedAt,
        }
      : undefined,

    cleaner: b.Cleaner
      ? {
          id: b.Cleaner.id,
          name: b.Cleaner.username,
        }
      : undefined,
  };
}

export async function createBooking(payload: CreateBookingRequest) {
  const res = await api.post("/api/bookings", payload);
  return res.data;
}
```

**Penjelasan**:

1. **Type Definition**
   - `Booking` → Struktur booking di frontend
   - Fix format naming: `ID` → `id`, `ServiceID` → `serviceId`

2. **Mapping Function**
   - Backend return: `ID`, `ServiceID`, `UserID`, etc (PascalCase)
   - Frontend: `id`, `serviceId`, `userId`, etc (camelCase)
   - Mapping function konversi format
   - `??` (nullish coalescing) → Default value jika undefined/null

3. **createBooking Function**
   - API call: `POST /api/bookings`
   - Payload: `{ serviceId, date, time, address }`
   - Return: response dari backend

---

### 7. SERVICE MANAGEMENT

#### **Service Type & API** (services/serviceService.ts)

```typescript
export type Service = {
  id: number;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  isDeleted?: boolean;
};

export async function getServices(): Promise<Service[]> {
  const res = await api.get("/api/services");

  return res.data.map((s: any) => ({
    id: s.ID,
    name: s.Name,
    description: s.Description ?? "",
    price: s.Price,
    durationMinutes: s.Duration,
    isDeleted: s.DeletedAt ? true : false,
  }));
}

export async function getServiceById(id: string): Promise<Service> {
  const res = await api.get(`/api/services/${id}`);
  const s = res.data;

  return {
    id: s.ID,
    name: s.Name,
    description: s.Description ?? "",
    price: s.Price,
    durationMinutes: s.Duration,
    isDeleted: s.DeletedAt ? true : false,
  };
}
```

**Penjelasan**:
- `getServices()` → GET semua services (public, tidak perlu token)
- `getServiceById(id)` → GET satu service by ID
- Map dari PascalCase ke camelCase

#### **Using Services with React Query** (services/queries/useServicesQuery.ts)

```typescript
import { useQuery } from "@tanstack/react-query";
import { getServices } from "../serviceService";

export function useServicesQuery() {
  return useQuery({
    queryKey: ["services"],
    queryFn: getServices,
  });
}
```

**Penjelasan**:
- `useQuery` → React Query hook untuk fetch data
- `queryKey: ["services"]` → Unique ID untuk cache
- `queryFn: getServices` → Function yang di-call untuk fetch
- Otomatis manage: loading, error, caching, refetch

**Contoh Penggunaan di Component**:
```tsx
function ServicesPage() {
  const { data: services, isLoading, error } = useServicesQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {services!.map(service => (
        <div key={service.id}>{service.name}</div>
      ))}
    </div>
  );
}
```

---

### 8. ADMIN BOOKINGS PAGE (pages/bookings/AdminBookingsPage.tsx)

**Fitur**:
- Tabel dengan semua bookings
- Filter by user dan status
- Tombol Approve (assign cleaner)
- Tombol Reject
- Statistics (total, pending, paid, approved)

**Penjelasan Key Parts**:

1. **State Management**
```tsx
const [bookings, setBookings] = useState<Booking[]>([]);
const [cleaners, setCleaners] = useState<Cleaner[]>([]);
const [loading, setLoading] = useState(false);
const [approveModalOpen, setApproveModalOpen] = useState(false);
const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
const [selectedCleanerId, setSelectedCleanerId] = useState<number | null>(null);
const [filterUser, setFilterUser] = useState<string | null>(null);
const [filterStatus, setFilterStatus] = useState<string | null>(null);
const { token } = useAuth();
```
- `bookings` → Data semua bookings
- `cleaners` → Data semua cleaners (untuk dropdown)
- `approveModalOpen` → Control modal approve
- `selectedBookingId`, `selectedCleanerId` → Data untuk approve action
- `filterUser`, `filterStatus` → Filter bookings

2. **Fetch Bookings Function**
```tsx
const fetchBookings = async () => {
  try {
    setLoading(true);
    const res = await fetch("http://localhost:8080/api/admin/bookings", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error();
    setBookings(await res.json());
  } catch {
    message.error("Gagal ambil data booking");
  } finally {
    setLoading(false);
  }
};
```
- Fetch dari endpoint `/api/admin/bookings`
- Pass token di header
- Set loading state
- Catch error dan show notification

3. **Approve Booking Function**
```tsx
const handleApproveConfirm = async () => {
  if (!selectedCleanerId) {
    message.warning("Pilih cleaner terlebih dahulu");
    return;
  }
  try {
    setApproveLoading(true);
    const res = await fetch(
      `http://localhost:8080/api/admin/bookings/${selectedBookingId}/approve`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cleaner_id: selectedCleanerId }),
      }
    );
    if (!res.ok) throw new Error();
    message.success("Booking approved!");
    setApproveModalOpen(false);
    fetchBookings();  // Refresh data
  } catch {
    message.error("Gagal approve booking");
  } finally {
    setApproveLoading(false);
  }
};
```
- Check apakah cleaner sudah dipilih
- Call API: `PUT /api/admin/bookings/:id/approve`
- Body: `{ cleaner_id: ... }`
- After success, refresh bookings

4. **Statistics Calculation**
```tsx
const totalBookings = bookings.length;
const pendingBookings = bookings.filter(b => b.Status === "pending").length;
const paidBookings = bookings.filter(b => b.PaymentStatus === "paid").length;
const approvedBookings = bookings.filter(b => b.Status === "approved").length;
```
- Calculate dari data bookings
- Use untuk display di dashboard

5. **Filter Logic**
```tsx
const filteredBookings = bookings.filter(b => {
  if (filterUser && b.User.email !== filterUser) return false;
  if (filterStatus && b.Status !== filterStatus) return false;
  return true;
});
```
- Filter bookings berdasarkan user email dan status
- Jika filter tidak pilih, semua data ditampilkan

---

## 🔄 ALUR DATA (FLOW)

### FLOW 1: USER REGISTER

```
┌─────────────────────────────┐
│   Frontend (Register.tsx)    │
│                             │
│ Form Input:                 │
│ - username                  │
│ - email                     │
│ - password                  │
└──────────────┬──────────────┘
               │
               │ POST /auth/register
               │ Body: { username, email, password }
               ↓
┌─────────────────────────────┐
│  Backend (auth_handler.go)  │
│                             │
│ 1. Validasi input           │
│ 2. Cek email sudah ada?     │
│ 3. Hash password            │
│ 4. CREATE USER di DB        │
└──────────────┬──────────────┘
               │
               │ Response: 201 Created
               ↓
┌─────────────────────────────┐
│   Frontend (Login.tsx)       │
│   "User Registered!          │
│    Please login"             │
└─────────────────────────────┘
```

### FLOW 2: USER LOGIN

```
┌─────────────────────────────┐
│  Frontend (LoginForm.tsx)   │
│                             │
│ Form Input:                 │
│ - email                     │
│ - password                  │
└──────────────┬──────────────┘
               │
               │ POST /auth/login
               │ Body: { email, password }
               ↓
┌─────────────────────────────┐
│  Backend (auth_handler.go)  │
│                             │
│ 1. Validasi input           │
│ 2. Query user by email      │
│ 3. Verify password (bcrypt) │
│ 4. Generate JWT Token       │
│ 5. Return token + user info │
└──────────────┬──────────────┘
               │
               │ Response: 200 OK
               │ Body: {
               │   token: "eyJhbGc...",
               │   user: {
               │     id: 1,
               │     username: "john",
               │     email: "john@...",
               │     role: "user"
               │   }
               │ }
               ↓
┌─────────────────────────────┐
│   Frontend (AuthContext)    │
│                             │
│ 1. Receive token + user     │
│ 2. Call login()             │
│ 3. Set state                │
│ 4. Save to localStorage     │
└──────────────┬──────────────┘
               │
               │ axios interceptor
               │ add Authorization header
               ↓
┌─────────────────────────────┐
│  Frontend (Navigate)        │
│                             │
│ Redirect by role:           │
│ - admin → /admin/bookings   │
│ - cleaner → /cleaner/...    │
│ - user → /services          │
└─────────────────────────────┘
```

### FLOW 3: USER CREATE BOOKING

```
┌────────────────────────────────────┐
│  Frontend (ServiceDetailPage.tsx)  │
│                                    │
│ User select:                       │
│ - Service: "General Cleaning"      │
│ - Date: "2025-02-27"              │
│ - Time: "10:00"                   │
│ - Address: "Jl. Merdeka No. 123"  │
│                                    │
│ Click "Booking" button             │
└────────────────┬───────────────────┘
                 │
                 │ POST /api/bookings
                 │ Headers:
                 │   Authorization: Bearer <token>
                 │ Body: {
                 │   serviceId: 1,
                 │   date: "2025-02-27",
                 │   time: "10:00",
                 │   address: "Jl. Merdeka No. 123"
                 │ }
                 ↓
┌───────────────────────────────────┐
│  Backend (JWT Middleware)         │
│                                   │
│ 1. Parse Authorization header     │
│ 2. Verify token signature         │
│ 3. Extract claims:                │
│    - user_id: 1                   │
│    - email: "john@..."            │
│    - role: "user"                 │
│ 4. Set c.Set("user_id", 1)        │
└────────────────┬──────────────────┘
                 │
                 │ (next middleware)
                 ↓
┌────────────────────────────────────┐
│  Backend (BookingHandler.Create)   │
│                                    │
│ 1. Get user_id from context        │
│ 2. Bind request body               │
│ 3. Validate input                  │
│ 4. Call service.CreateBooking()    │
└────────────────┬───────────────────┘
                 │
                 ↓
┌────────────────────────────────────┐
│  Backend (BookingService)          │
│                                    │
│ 1. Validate parameter              │
│ 2. Check service exists            │
│ 3. Create booking struct           │
│ 4. Call repo.Create()              │
└────────────────┬───────────────────┘
                 │
                 ↓
┌────────────────────────────────────┐
│  Backend (BookingRepository)       │
│                                    │
│ INSERT INTO bookings (             │
│   user_id, service_id, date, ...   │
│ ) VALUES (...)                     │
└────────────────┬───────────────────┘
                 │
                 ↓
┌────────────────────────────────────┐
│  Database (PostgreSQL)             │
│                                    │
│ New row in bookings table:         │
│ - id: 1                            │
│ - user_id: 1                       │
│ - service_id: 1                    │
│ - status: "pending"                │
│ - payment_status: "unpaid"         │
│ - created_at: now()                │
└────────────────┬───────────────────┘
                 │
                 │ Response: 201 Created
                 │ { message: "Booking created" }
                 ↓
┌────────────────────────────────────┐
│  Frontend (BookingsPage.tsx)       │
│                                    │
│ 1. Receive response                │
│ 2. Show success notification       │
│ 3. Refresh bookings list           │
│ 4. New booking visible in table    │
│    Status: "pending"               │
│    Payment: "unpaid"               │
└────────────────────────────────────┘
```

### FLOW 4: ADMIN APPROVE BOOKING WITH CLEANER

```
┌──────────────────────────────────┐
│  Frontend (AdminBookingsPage)    │
│                                  │
│ Admin klik "Approve" button       │
│ pada booking tertentu            │
└────────────────┬─────────────────┘
                 │
                 │ Modal popup
                 │ "Pilih Cleaner"
                 ↓
┌──────────────────────────────────┐
│  Frontend (Modal Select)         │
│                                  │
│ Admin pilih cleaner dari dropdown│
│ Contoh: "Budi (Cleaner)"         │
└────────────────┬─────────────────┘
                 │
                 │ Click "Confirm"
                 │ PUT /api/admin/bookings/1/approve
                 │ Headers:
                 │   Authorization: Bearer <admin_token>
                 │ Body: {
                 │   cleaner_id: 2
                 │ }
                 ↓
┌──────────────────────────────────┐
│  Backend (JWT Middleware)        │
│                                  │
│ Verify token (admin token)       │
│ Set claims di context            │
└────────────────┬─────────────────┘
                 │
                 ↓
┌──────────────────────────────────┐
│  Backend (AdminOnly Middleware)  │
│                                  │
│ Check: role == "admin"?          │
│ If yes → Continue                │
│ If no → Return 403 Forbidden     │
└────────────────┬─────────────────┘
                 │
                 ↓
┌──────────────────────────────────┐
│  Backend (AdminHandler.Approve)  │
│                                  │
│ 1. Extract booking_id dan cleaner_id
│ 2. Call service.ApproveWithCleaner()
└────────────────┬─────────────────┘
                 │
                 ↓
┌──────────────────────────────────┐
│  Backend (BookingService)        │
│                                  │
│ Call repo.ApproveWithCleaner()   │
└────────────────┬─────────────────┘
                 │
                 ↓
┌──────────────────────────────────┐
│  Backend (BookingRepository)     │
│                                  │
│ UPDATE bookings SET              │
│   status = 'approved',           │
│   cleaner_id = 2                 │
│ WHERE id = 1                     │
└────────────────┬─────────────────┘
                 │
                 ↓
┌──────────────────────────────────┐
│  Database (PostgreSQL)           │
│                                  │
│ Booking updated:                 │
│ - status: "approved"             │
│ - cleaner_id: 2                  │
│ - updated_at: now()              │
└────────────────┬─────────────────┘
                 │
                 │ Response: 200 OK
                 │ { message: "Booking approved" }
                 ↓
┌──────────────────────────────────┐
│  Frontend (AdminBookingsPage)    │
│                                  │
│ 1. Receive success response      │
│ 2. Close modal                   │
│ 3. Show notification             │
│ 4. Refresh bookings              │
│ 5. Booking row updated:          │
│    - Status: "approved"          │
│    - Cleaner: "Budi (2)"         │
└──────────────────────────────────┘
```

### FLOW 5: USER PAYMENT BOOKING

```
┌──────────────────────────────────┐
│  Frontend (BookingsPage)         │
│                                  │
│ User lihat booking dengan        │
│ status "approved" dan            │
│ payment_status: "unpaid"         │
│                                  │
│ Click "Pay" button               │
└────────────────┬─────────────────┘
                 │
                 │ POST /api/bookings/1/pay
                 │ Headers:
                 │   Authorization: Bearer <user_token>
                 │
                 ↓
┌──────────────────────────────────┐
│  Backend (PaymentHandler)        │
│                                  │
│ 1. Get user_id dari context      │
│ 2. Query booking dari DB         │
│ 3. Verify booking milik user     │
│ 4. Generate unique order_id      │
│    Format: "booking-1-1708933200"│
│ 5. Call Midtrans API:            │
│    snapClient.CreateTransaction()│
│ 6. Midtrans return snap_token    │
└────────────────┬─────────────────┘
                 │
                 ↓
┌──────────────────────────────────┐
│  Backend (BookingRepository)     │
│                                  │
│ UPDATE bookings SET              │
│   snap_token = '...',            │
│   midtrans_order_id = '...'      │
│ WHERE id = 1                     │
└────────────────┬─────────────────┘
                 │
                 │ Response: 200 OK
                 │ Body: {
                 │   snap_token: "...",
                 │   client_key: "..."
                 │ }
                 ↓
┌──────────────────────────────────┐
│  Frontend (Payment Component)    │
│                                  │
│ 1. Receive snap_token            │
│ 2. Initialize Midtrans Snap      │
│    window.snap.pay(snap_token)   │
│ 3. Midtrans modal popup          │
└────────────────┬─────────────────┘
                 │
                 │ User pilih metode pembayaran:
                 │ - Credit Card
                 │ - E-wallet
                 │ - Bank Transfer
                 │ - etc
                 │
                 ↓
┌──────────────────────────────────┐
│  Midtrans (Payment Gateway)      │
│                                  │
│ Process payment sesuai metode    │
│ yang dipilih user                │
└────────────────┬─────────────────┘
                 │
                 ├─ Success → Send webhook
                 ├─ Failed  → Send webhook
                 └─ Pending → Send webhook
                 │
                 ↓
┌──────────────────────────────────┐
│  Backend (Webhook Handler)       │
│                                  │
│ POST /payment/webhook            │
│ Body: {                          │
│   order_id: "booking-1-...",     │
│   transaction_status: "settle...│
│   fraud_status: "accept",        │
│   ...                            │
│ }                                │
│                                  │
│ 1. Extract order_id              │
│ 2. Query booking by order_id     │
│ 3. Check transaction_status      │
│ 4. Update payment_status         │
└────────────────┬─────────────────┘
                 │
                 ├─ settlement → payment_status: "paid"
                 ├─ capture    → payment_status: "paid"
                 ├─ deny       → payment_status: "failed"
                 ├─ cancel     → payment_status: "failed"
                 └─ expire     → payment_status: "failed"
                 │
                 ↓
┌──────────────────────────────────┐
│  Backend (BookingRepository)     │
│                                  │
│ UPDATE bookings SET              │
│   payment_status = 'paid'        │
│ WHERE id = 1 AND                 │
│   midtrans_order_id = '...'      │
└────────────────┬─────────────────┘
                 │
                 ↓
┌──────────────────────────────────┐
│  Database (PostgreSQL)           │
│                                  │
│ Booking updated:                 │
│ - payment_status: "paid"         │
│ - updated_at: now()              │
└────────────────┬─────────────────┘
                 │
                 ↓
┌──────────────────────────────────┐
│  Frontend                        │
│                                  │
│ (Polling atau WebSocket)         │
│                                  │
│ Jika payment_status == "paid":   │
│ - Close modal                    │
│ - Show success notification      │
│ - Update booking list            │
│ - Status: "approved", "paid"     │
└──────────────────────────────────┘
```

---

## 📁 KORELASI FILE

### Backend File Relationships

```
main.go
  │
  ├─→ config/config.go
  │     (Load konfigurasi dari .env)
  │
  ├─→ database/
  │   ├─ db.go (Connect ke PostgreSQL)
  │   └─ migrate.go (Create tables)
  │
  ├─→ middleware/
  │   ├─ jwt_middleware.go (Verify token)
  │   ├─ admin_only.go (Check admin)
  │   └─ cleaner_only.go (Check cleaner)
  │
  ├─→ handlers/
  │   ├─ auth_handler.go (Register, Login)
  │   ├─ booking_handler.go (Create, Get, Cancel)
  │   ├─ admin_handler.go (Approve, Reject)
  │   ├─ payment_handler.go (Snap token, Webhook)
  │   ├─ service_handler.go (Get services)
  │   └─ user_handler.go (Profile, etc)
  │     │
  │     ├─→ services/
  │     │   ├─ booking_service.go
  │     │   ├─ service_service.go
  │     │   └─ user_service.go
  │     │     │
  │     │     └─→ repositories/
  │     │         ├─ booking_repository.go
  │     │         ├─ service_repository.go
  │     │         └─ user_repository.go
  │     │           │
  │     │           └─→ Database (PostgreSQL)
  │     │
  │     └─→ models/
  │         ├─ user.go
  │         ├─ service.go
  │         └─ booking.go
  │
  └─→ utils/
      └─ jwt.go (Generate & Verify token)
```

### Frontend File Relationships

```
main.tsx (Entry point)
  │
  ├─ QueryClientProvider (React Query setup)
  ├─ BrowserRouter (Routing)
  ├─ AuthProvider (Auth context)
  └─ AppRouter (Routes definition)
        │
        ├─→ router.tsx
        │   ├─ Public routes (/, /services, /services/:id)
        │   ├─ Auth routes (/login, /register)
        │   ├─ Protected routes (/bookings, /profile)
        │   ├─ Admin routes (/admin/*)
        │   └─ Cleaner routes (/cleaner/*)
        │
        ├─→ context/AuthContext.tsx
        │   ├─ State: user, token
        │   ├─ Functions: login(), logout()
        │   └─ Hook: useAuth()
        │
        ├─→ lib/api.ts
        │   └─ Axios instance dengan JWT interceptor
        │
        ├─→ pages/
        │   ├─ auth/
        │   │   ├─ Login.tsx
        │   │   │   └─→ components/organisms/LoginForm.tsx
        │   │   │           └─→ services/authService.ts
        │   │   │               └─→ lib/api.ts
        │   │   └─ Register.tsx
        │   │
        │   ├─ bookings/
        │   │   ├─ BookingsPage.tsx
        │   │   │   └─→ services/bookingService.ts
        │   │   │       └─→ services/queries/useBookingsQuery.ts
        │   │   └─ AdminBookingsPage.tsx
        │   │       └─→ lib/api.ts
        │   │
        │   ├─ services/
        │   │   ├─ ServicesPage.tsx
        │   │   │   └─→ services/serviceService.ts
        │   │   │       └─→ services/queries/useServicesQuery.ts
        │   │   └─ ServiceDetailPage.tsx
        │   │
        │   ├─ profile/
        │   │   ├─ ProfilePage.tsx
        │   │   └─ ChangePasswordPage.tsx
        │   │
        │   ├─ home/
        │   │   └─ HomePage.tsx
        │   │
        │   ├─ cleaner/
        │   │   └─ CleanerSchedulePage.tsx
        │   │
        │   └─ admin/
        │       └─ AdminCleanerPage.tsx
        │
        ├─→ components/
        │   ├─ atoms/ (Small UI components)
        │   │   ├─ Buttons.tsx
        │   │   └─ Input.tsx
        │   ├─ molecules/ (Combined atoms)
        │   │   └─ FormInput.tsx
        │   └─ organisms/ (Complex components)
        │       ├─ LoginForm.tsx
        │       └─ RegisterForm.tsx
        │
        ├─→ routes/
        │   └─ ProtectedRoute.tsx (Route guard)
        │
        └─→ layouts/
            ├─ MainLayout.tsx
            ├─ AuthLayout.tsx
            ├─ AdminLayout.tsx
            └─ CleanerLayout.tsx
```

### Data Flow Through Files

**Contoh: Login User**

```
LoginForm.tsx (User input email, password)
    ↓ form submit
onFinish() function
    ↓ call mutation.mutate(values)
mutation uses loginService
    ↓ loginService async function
services/authService.ts
    ↓ api.post("/auth/login", payload)
lib/api.ts
    ↓ axios interceptor adds Bearer token
    ↓ POST request to backend
Backend /auth/login
    ↓ return { token, user }
LoginForm.tsx receives response
    ↓ onSuccess callback
AuthContext.login() dipanggil
    ↓ set state + save to localStorage
navigate() to home/admin/cleaner page
    ↓ user dapat akses protected routes
```

**Contoh: Get Bookings**

```
BookingsPage.tsx
    ↓ import useBookingsQuery
services/queries/useBookingsQuery.ts
    ↓ useQuery({ queryFn: getMyBookings })
services/bookingService.ts
    ↓ api.get("/api/bookings")
lib/api.ts
    ↓ axios interceptor adds Bearer token
    ↓ GET request to backend
Backend /api/bookings
    ↓ JWTMiddleware verify token
    ↓ get user_id dari context
BookingHandler.MyBookings()
    ↓ service.GetMyBookings(userID)
BookingService.GetMyBookings()
    ↓ repo.FindByUserID(userID)
BookingRepository.FindByUserID()
    ↓ GORM query with Preload
Database PostgreSQL
    ↓ SELECT + JOIN services, users
return bookings array
    ↓ React Query cache + update component state
BookingsPage.tsx display bookings in table
```

---

## 🎬 CONTOH USE CASE

### Use Case 1: User Membuat Booking dan Membayar

**Scenario**:
- User baru John sudah login
- John lihat service "General Cleaning" dengan harga Rp 200.000
- John ingin booking service untuk tanggal 27 Februari 2025

**Langkah-langkah**:

1. **John buka Services Page**
   - Frontend hit: `GET /api/services` (public)
   - Backend return semua services
   - John lihat "General Cleaning" Rp 200.000

2. **John klik Service, buka Detail Page**
   - Frontend hit: `GET /api/services/1`
   - Lihat detail: deskripsi, durasi, price

3. **John fill form booking**
   - Service: "General Cleaning" (ID: 1)
   - Date: "2025-02-27"
   - Time: "10:00"
   - Address: "Jl. Merdeka No. 123, Jakarta"

4. **John Submit Form**
   - Frontend: `POST /api/bookings`
   - Middleware verify JWT (John's token)
   - Handler extract user_id dari token = 1
   - Service create booking dengan status "pending"
   - DB insert → booking ID 5, user_id 1, status "pending"
   - Response: 201 Created

5. **Admin (Budi) Approve Booking**
   - Admin buka AdminBookingsPage
   - Lihat booking dari John dengan status "pending"
   - Admin klik "Approve"
   - Admin pilih cleaner "Rina" dari dropdown
   - Frontend: `PUT /api/admin/bookings/5/approve`
   - Body: `{ cleaner_id: 3 }`
   - Middleware verify admin token
   - AdminOnly middleware check role = "admin" ✓
   - Repository update: status = "approved", cleaner_id = 3
   - Response: 200 OK

6. **John Bayar Booking**
   - John lihat booking di BookingsPage
   - Status: "approved", payment_status: "unpaid"
   - John klik "Pay"
   - Frontend: `POST /api/bookings/5/pay`
   - Backend generate order_id: "booking-5-1708933200"
   - Backend call Midtrans API
   - Midtrans return snap_token
   - Backend save token ke DB
   - Frontend receive snap_token
   - Frontend show Midtrans Snap widget

7. **John Pilih Metode Pembayaran**
   - Midtrans widget show options: CC, e-wallet, bank transfer
   - John pilih "GCash" (e-wallet)
   - John scan QR code
   - GCash confirm payment

8. **Midtrans Webhook**
   - Midtrans verify payment sukses
   - Midtrans send webhook: `POST /payment/webhook`
   - Body: `{ order_id: "booking-5-1708933200", transaction_status: "settlement" }`
   - Backend find booking by order_id
   - Update payment_status = "paid"

9. **John Lihat Booking (Updated)**
   - Frontend reflect booking: payment_status = "paid"
   - John notification: "Payment successful!"
   - Booking siap dieksekusi oleh Rina (cleaner)

10. **Rina (Cleaner) Lihat Schedule**
    - Cleaner buka CleanerSchedulePage
    - Hit: `GET /api/cleaners/schedule`
    - Backend return bookings dengan cleaner_id = 3 (Rina's ID)
    - Rina lihat booking dari John
    - Date: 27 Feb 2025, Time: 10:00, Address: Jl. Merdeka
    - Service: General Cleaning, Customer: John

---

### Use Case 2: Admin Mengelola Services

**Scenario**:
- Admin Budi ingin tambah service baru

**Langkah-langkah**:

1. **Admin buka AdminServicesPage**
   - Hit: `GET /api/admin/services`
   - Return semua services (include soft-deleted)

2. **Admin klik "Add Service"**
   - Form popup
   - Input: name, description, price, duration

3. **Admin Submit**
   - Frontend: `POST /api/admin/services`
   - Middleware verify JWT token (admin)
   - AdminOnly check role = "admin"
   - Handler create new service
   - Save ke DB

4. **Service Visible di Services Page**
   - User bisa lihat service baru
   - Bisa booking service itu

---

Demikian penjelasan lengkap project Cleaning Mini Project. Struktur ini menggunakan **layered architecture** (handler → service → repository) yang memisahkan concerns:

- **Handler** → Handle HTTP request/response
- **Service** → Business logic
- **Repository** → Database operations
- **Model** → Data structure

Di frontend, menggunakan **component-based architecture** dengan **separation of concerns** (pages, services, context, etc) dan **React Query** untuk data fetching.

Semoga dokumentasi ini membantu Anda memahami keseluruhan flow project! 🎉
