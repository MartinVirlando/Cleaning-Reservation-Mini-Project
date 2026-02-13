package main

import (
	"log"
	"net/http"

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/handlers"
	"backend/internal/middleware"
	"backend/internal/repositories"
	"backend/internal/services"

	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
)

func main() {

	cfg := config.Load()

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal(err)
	}

	if err := database.Migrate(db); err != nil {
		log.Fatal(err)
	}

	log.Println("DB Connected")

	e := echo.New()

	e.Use(echoMiddleware.CORSWithConfig(echoMiddleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:5173"},
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE},
		AllowHeaders: []string{
			echo.HeaderOrigin,
			echo.HeaderContentType,
			echo.HeaderAccept,
			echo.HeaderAuthorization,
		},
	}))

	authHandler := handlers.NewAuthHandler(db)
	userHandler := handlers.NewUserHandler()

	serviceRepo := repositories.NewServiceRepository(db)
	serviceService := services.NewServiceService(serviceRepo)
	serviceHandler := handlers.NewServiceHandler(serviceService)

	bookingRepo := repositories.NewBookingRepository(db)

	bookingService := services.NewBookingService(bookingRepo, serviceRepo)
	bookingHandler := handlers.NewBookingHandler(bookingService)
	adminHandler := handlers.NewAdminHandler(bookingService)

	// PUBLIC ROUTES (NO JWT)

	e.POST("/auth/register", authHandler.Register)
	e.POST("/auth/login", authHandler.Login)

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"status": "ok",
			"port":   cfg.AppPort,
		})
	})

	// SERVICES PUBLIC
	e.GET("/api/services", serviceHandler.GetAll)
	e.GET("/api/services/:id", serviceHandler.GetByID)

	// PROTECTED ROUTES (JWT)
	api := e.Group("/api")
	api.Use(middleware.JWTMiddleware)

	api.GET("/profile", userHandler.Profile)
	api.POST("/bookings", bookingHandler.Create)
	api.GET("/bookings", bookingHandler.MyBookings)

	// ADMIN ROUTES
	admin := api.Group("/admin")
	admin.Use(middleware.AdminOnly)

	admin.PUT("/bookings/:id/approve", adminHandler.Approve)
	admin.PUT("/bookings/:id/reject", adminHandler.Reject)

	log.Printf("Server running at: http://localhost:%s\n", cfg.AppPort)
	e.Logger.Fatal(e.Start(":" + cfg.AppPort))
}
