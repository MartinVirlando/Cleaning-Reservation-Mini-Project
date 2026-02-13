## Penjelasan Kode — Project Cleaning (Hingga Progress Terakhir)

Dokumentasi ini menjelaskan bagian-bagian inti dari project (backend & frontend) sampai progress terakhir. Penjelasan dibuat dalam Bahasa Indonesia, ditujukan untuk pemula. Saya fokus pada file-file yang sudah diimplementasikan: `main.go`, handler auth/user/booking, model, service, repository, middleware JWT, utils JWT, serta sebagian arsitektur frontend auth.

-- Catatan istilah singkat:
- `h` pada method receiver (contoh `func (h *AuthHandler) Register(...)`) = variabel receiver untuk akses properti struct handler.
- `c` di handler Go = `echo.Context`, objek yang mewakili request/response, berisi header, body, params, dan helper JSON.
- `repo` = layer akses database (CRUD), `service` = logika bisnis, `handler` = lapisan HTTP (routing, validasi request).
- JWT = JSON Web Token, token yang menyimpan klaim (user_id, email) untuk otentikasi.

--------------------
## Backend — `cmd/api/main.go` (penjelasan baris demi baris)

```go
cfg := config.Load()
```
- Memanggil fungsi `Load()` dari package `config` untuk memuat konfigurasi aplikasi (seperti port, connection string, JWT secret).

```go
db, err := database.Connect(cfg)
```
- Menghubungkan ke database menggunakan konfigurasi. Mengembalikan objek `*gorm.DB`.

```go
if err := database.Migrate(db); err != nil {
    log.Fatal(err)
}
```
- Menjalankan migrasi (membuat tabel berdasarkan model) jika diperlukan. Jika gagal, proses berhenti.

```go
e := echo.New()
```
- Membuat instance Echo (framework HTTP) untuk mendaftarkan route dan middleware.

```go
e.Use(echoMiddleware.CORSWithConfig(...))
```
- Mengaktifkan CORS agar frontend (biasanya `http://localhost:5173`) dapat memanggil API.

```go
authHandler := handlers.NewAuthHandler(db)
userHandler := handlers.NewUserHandler()
```
- Menginisialisasi handler: `authHandler` diberi akses ke DB; `userHandler` stateless.

```go
e.POST("/auth/register", authHandler.Register)
e.POST("/auth/login", authHandler.Login)
```
- Route publik untuk registrasi dan login. Method `Register` dan `Login` ada di `AuthHandler`.

```go
api := e.Group("/api")
api.Use(middleware.JWTMiddleware)
api.GET("/profile", userHandler.Profile)
```
- Membuat group route yang dilindungi middleware JWT. Semua route di `/api` memerlukan token.

```go
e.Logger.Fatal(e.Start(":" + cfg.AppPort))
```
- Menjalankan server pada port yang diambil dari konfigurasi.

--------------------
## Backend — `internal/handlers/auth_handler.go`

File ini berisi HTTP handler untuk register & login.

Penjelasan fungsi dan baris penting:

- `type AuthHandler struct { DB *gorm.DB }` — struct handler menyimpan dependency DB.
- `NewAuthHandler(db *gorm.DB)` — constructor sederhana untuk memberi DB ke handler.

Register flow (singkat):
- `c.Bind(&req)` : parse JSON body ke `RegisterRequest`.
- Validasi: cek field kosong.
- Cek keberadaan email: `h.DB.Where("email = ?", req.Email).First(&existing)`.
- Hash password: `bcrypt.GenerateFromPassword`.
- Simpan user: `h.DB.Create(&user)`.
- Response: `201 Created` jika sukses.

Login flow (singkat):
- Bind request -> validasi.
- Ambil user berdasarkan email.
- Bandingkan password: `bcrypt.CompareHashAndPassword`.
- Generate token: `utils.GenerateToken(user.ID, user.Email)`.
- Return token + info user.

Per-baris (ringkas, tetap mudah dimengerti):
- `var req RegisterRequest` : buat struct untuk menampung input JSON.
- `if err := c.Bind(&req); err != nil { ... }` : jika parsing body gagal, kembalikan 400.
- `if req.Username == "" || ...` : validasi manual.
- `err := h.DB.Where("email = ?", req.Email).First(&existing).Error` : cek apakah email sudah ada.
- `hashedPassword, err := bcrypt.GenerateFromPassword(...)` : enkripsi password.
- `user := models.User{...}` lalu `h.DB.Create(&user)` : membuat record user baru.

Untuk `Login`:
- `var user models.User` lalu `h.DB.Where("email = ?", req.Email).First(&user)` : ambil user.
- `bcrypt.CompareHashAndPassword` : bandingkan hash.
- `token, err := utils.GenerateToken(user.ID, user.Email)` : buat JWT.

--------------------
## Backend — `internal/handlers/user_handler.go`

`Profile` handler membaca data user yang sudah disimpan di context oleh middleware JWT:

- `userID := c.Get("user_id")` dan `email := c.Get("email")` : mengambil klaim JWT yang disimpan di `c`.
- Mengembalikan JSON sederhana berisi `user_id` dan `email`.

Penjelasan: handler ini tidak mengakses DB, hanya menampilkan klaim token. Untuk menampilkan profil lengkap, handler ini harus membaca DB berdasarkan `user_id`.

--------------------
## Backend — `internal/handlers/booking_handler.go`

Fungsi utama:
- `Create` : membuat booking baru. Mengambil `user_id` dari context (JWT), binding request, lalu memanggil `service.CreateBooking`.
- `MyBookings` : memanggil `service.GetMyBookings(userID)` agar mendapatkan semua booking milik user.
- `Detail` : mencoba ambil detail booking (catatan: di code `Detail` memanggil `GetMyBookings` dengan id; ini nampak bug/ketidaksesuaian — seharusnya `GetBookingByID`).

Catatan: handler ini menggunakan `userID := c.Get("user_id").(float64)` — karena saat claim diset melalui `jwt.MapClaims`, nilainya bisa berupa float64; sebaiknya di-cast/konversi hati-hati.

--------------------
## Backend — Models (penjelasan fields)

- `User` (`internal/models/user.go`):
  - `ID uint` : primary key.
  - `Username, Email` : data user.
  - `PasswordHash` : menyimpan hash password (tidak dikembalikan ke client; tag json:"-" menyembunyikannya).

- `Service` (`internal/models/service.go`):
  - Menyimpan data layanan (name, price, duration).

- `Booking` (`internal/models/booking.go`):
  - `UserID`, `ServiceID` : foreign key.
  - `Date`, `Time`, `Status` : informasi booking.
  - `Preload("Service")` di repos digunakan supaya response booking menyertakan data service.

--------------------
## Backend — `internal/services/booking_service.go`

Service bertanggung jawab atas logika pembuatan booking:
- `CreateBooking` membuat object `models.Booking` dan memanggil `repo.Create(&booking)`.
- `GetMyBookings` memanggil `repo.FindByUserID`.

Ini memisahkan logika bisnis dari akses DB (clean architecture sederhana).

--------------------
## Backend — `internal/repositories/booking_repository.go`

Repository berinteraksi langsung dengan GORM:
- `Create(booking)` -> `db.Create(booking)`.
- `FindByUserID(userID)` -> `db.Preload("Service").Where("user_id = ?", userID).Find(&bookings)`.
- `FindByID(id)` -> `First(&booking, id)`.

Repository inilah yang mengembalikan model Go yang kemudian dikembalikan sebagai JSON oleh handler.

--------------------
## Backend — `internal/utils/jwt.go` dan `internal/middleware/jwt_middleware.go`

`GenerateToken(userID, email)`:
- Membuat klaim custom `JwtCustomClaims` berisi `UserID` dan `Email`.
- Menetapkan `ExpiresAt` dan `IssuedAt`.
- Membuat token HS256 dan menandatanganinya dengan `JWT_SECRET` dari environment.

`JWTMiddleware`:
- Ambil header `Authorization`.
- Format harus `Bearer <token>`.
- `jwt.Parse(tokenString, ...)` dengan secret dari config.
- Jika valid, ambil klaim: `claims["user_id"]` dan `claims["email"]`, lalu simpan ke context `c.Set("user_id", ...)`.
- Selanjutnya `next(c)` memanggil handler yang diminta.

Penjelasan teknis singkat: middleware memeriksa token sebelum handler jalan. Itu artinya handler tidak perlu mem-parsing token sendiri — cukup ambil klaim dari `c.Get(...)`.

--------------------
## Frontend — inti alur auth

File penting:
- `frontend/src/lib/http.ts` : helper `http()` yang memanggil `fetch` ke `http://localhost:8080` dan menambahkan header `Authorization` jika `authToken` sudah diset. Juga memanggil `onUnauthorized()` ketika mendapat 401.
- `frontend/src/services/api.ts` : instance `axios` yang otomatis menaruh token dari `localStorage` ke header `Authorization` lewat interceptor.
- `frontend/src/services/authService.ts` : memanggil endpoint `/auth/login` lewat `api.post` dan mengembalikan `res.data`.
- `frontend/src/components/organisms/LoginForm.tsx` : form UI (Ant Design) yang saat submit memanggil `loginService`, lalu pada `onSuccess` memanggil `authLogin(...)` dari context, menyimpan token, dan redirect.

Per-line & konsep yang perlu diperhatikan (frontend):
- `api.interceptors.request.use(...)` : setiap request axios akan memeriksa `localStorage` untuk token dan menambahkannya ke header.
- `loginService` mengembalikan `data` dengan struktur `{ token, user }` sesuai response backend.
- `LoginForm` menggunakan `useMutation` dari React Query untuk memanggil service dan menangani status loading/success/error.

--------------------
## Alur sinergi antar-file (end-to-end auth & protected route)

1. User mengisi form di `LoginForm` (frontend).
2. `LoginForm` memanggil `authService.login(payload)` yang melakukan POST ke `/auth/login` melalui `api`.
3. Backend: request masuk ke `e.POST("/auth/login", authHandler.Login)`.
4. `AuthHandler.Login`:
   - Bind request -> ambil user dari DB -> verify password -> generate JWT lewat `utils.GenerateToken` -> return token.
5. Frontend menerima `token`, menyimpan ke `localStorage` (atau state global) melalui `AuthContext`.
6. Untuk request selanjutnya, `api` (axios) menambahkan header `Authorization: Bearer <token>` ke semua request.
7. Backend menerima request ke route yang dilindungi (mis. `/api/profile`), middleware `JWTMiddleware` membaca header, mem-parse token, memvalidasi, lalu menyimpan klaim ke `echo.Context`.
8. Handler seperti `UserHandler.Profile` membaca klaim dari context (`c.Get("user_id")`) dan mengembalikan data yang sesuai.

Diagram singkat alur (linear):
- Frontend LoginForm -> authService -> backend AuthHandler.Login -> utils.GenerateToken -> response token -> frontend simpan token -> api/interceptor menambahkan token -> request ke /api/* -> middleware verifikasi -> handler -> repo/service jika perlu DB -> response ke frontend

--------------------
## Catatan implementasi & perbaikan yang direkomendasikan

- `booking_handler.Detail` saat ini memanggil `GetMyBookings` dengan ID — ini terlihat tidak sesuai; seharusnya memanggil method untuk mengambil booking by ID (`FindByID`) dan memverifikasi kepemilikan.
- Konversi tipe `user_id` dari context: saat JWT klaim di-parse sebagai `jwt.MapClaims`, nilai numerik sering menjadi `float64`. Sebaiknya normalisasi: cast ke `uint` dengan aman.
- `UserHandler.Profile` saat ini hanya menampilkan klaim token. Untuk menampilkan profil lengkap, handler harus query DB menggunakan `user_id`.
- Error message consistency: di beberapa tempat ada typo (`"messgae"`) — sebaiknya konsisten.

--------------------
## Frontend — Penjelasan Per-baris (file inti)

Berikut penjelasan per-baris/section untuk file frontend yang paling berpengaruh pada alur auth dan integrasi dengan backend.

1) `frontend/src/lib/http.ts`

```ts
let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;
```
- `authToken` menyimpan token saat runtime (state module). Jika aplikasi menggunakan localStorage, fungsi `setAuthToken` mengisinya juga.
- `onUnauthorized` adalah callback yang bisa di-set untuk menangani skenario 401 (mis. redirect ke login).

```ts
export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setUnauthorizedHandler(handler : () => void){
  onUnauthorized = handler;
}
```
- Dua setter publik agar bagian lain aplikasi bisa mengontrol token dan handler 401.

```ts
export async function http<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`http://localhost:8080${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? {Authorization: `Bearer ${authToken}`}: {}),
      ...(options.headers || {}),
    },
  });

  if(res.status === 401) {
    onUnauthorized?.(); 
    throw new Error("Unauthorized");
  }

  if(!res.ok){
    const error = await res.json().catch(() => ({
      message: "Unexpected Error",
    }));
    throw error;
  }
  return res.json();
}
```
- `http` adalah helper kecil yang membungkus `fetch`:
  - Menggabungkan `base URL` (localhost:8080).
  - Menambahkan header `Content-Type` dan `Authorization` jika `authToken` diset.
  - Jika server merespon `401`, memanggil `onUnauthorized` lalu melempar error.
  - Jika response bukan `ok`, mencoba parse JSON error dan melemparkannya.
  - Jika sukses, mengembalikan `res.json()`.

2) `frontend/src/services/api.ts` (axios wrapper)

```ts
const api = axios.create({ baseURL: "http://localhost:8080" });

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
```
- Membuat instance `axios` dengan `baseURL`.
- Interceptor: setiap request otomatis mengambil token dari `localStorage` dan menambahkan header `Authorization`.

3) `frontend/src/services/authService.ts`

```ts
export async function login(
  payload: LoginRequest
): Promise<LoginResponse> {
  const res = await api.post("/auth/login", payload);

  return res.data;
}
```
- Fungsi `login` memanggil endpoint `/auth/login` pada backend menggunakan `api` (axios). Ia mengirim `payload` (email & password) dan mengembalikan `res.data` yang berisi `token` dan `user`.

4) `frontend/src/components/organisms/LoginForm.tsx`

Bagian inti:

- Import dan setup:
  - `Form, message` dari Ant Design untuk UI dan notifikasi.
  - `Button`, `FormInput` component, `useNavigate` dari React Router.
  - `useMutation` dari React Query untuk melakukan side-effect (login).
  - `useAuth` dari `AuthContext` untuk menyimpan state auth (user + token).

- `const mutation = useMutation({ mutationFn: loginService, onSuccess: (data, variables) => { ... }, onError: () => { ... } })`:
  - `mutationFn`: panggil `loginService` (yang memanggil backend).
  - `onSuccess`: ketika login berhasil, memanggil `authLogin({ email: variables.email }, data.token)` untuk menyimpan user & token di `AuthContext`, menampilkan pesan sukses, lalu redirect.
  - `onError`: menampilkan pesan error.

- `const onFinish = (values: LoginFormValues) => { mutation.mutate(values); }` : submit form -> jalankan mutation.

- Form fields (`FormInput`) dengan rules validasi — setelah `onFinish`, data dikirim ke backend.

5) `frontend/src/pages/auth/Login.tsx`

- Komponen halaman yang menampilkan `LoginForm` dan link ke register.
- Tidak ada logika auth di sini — hanya UI wrapper.

6) `frontend/src/context/AuthContext.tsx` (ringkasan)

Ringkasan perilaku umum (file ini mengatur state auth, meskipun tidak dijelaskan per-baris di file ini):
- Menyediakan `AuthProvider` dan `useAuth()` hook.
- `login(user, token)` di context biasanya akan:
  - Menyimpan token ke `localStorage` atau module state.
  - Set header default (jika menggunakan axios instance) atau memanggil `setAuthToken` pada helper `http.ts`.
  - Menyimpan informasi user di state global untuk dipakai di komponen lain.

--------------------
## Catatan praktis untuk pemula

- Di frontend ada dua pendekatan token: `api.ts` menggunakan `localStorage` + axios interceptor; `lib/http.ts` menyimpan token di module-scoped variable. Pastikan aplikasi hanya menggunakan satu pola untuk menghindari inkonsistensi.
- Saat login sukses, harus ada satu titik menyimpan token (mis. `AuthContext`) dan satu titik yang menambahkan token ke semua request (mis. axios interceptor atau `http.ts`).
- Jangan lupa untuk meng-handle 401: redirect user ke halaman login dan bersihkan token.

--------------------
## Status sekarang

Saya telah menambahkan penjelasan frontend per-baris ke [backend/CODE_EXPLANATION.md](backend/CODE_EXPLANATION.md). Jika mau, saya bisa:
- Pindahkan dokumen gabungan ke root `CODE_EXPLANATION.md` (supaya mudah diakses), atau
- Ekspansi penjelasan per-baris untuk file frontend lainnya (mis. `AuthContext.tsx`, `queryClient.ts`, komponen UI).



