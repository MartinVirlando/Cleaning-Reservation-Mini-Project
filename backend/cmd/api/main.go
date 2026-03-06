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
	userHandler := handlers.NewUserHandler(db)
	adminCleanerHandler := handlers.NewAdminCleanerHandler(db)

	serviceRepo := repositories.NewServiceRepository(db)
	serviceService := services.NewServiceService(serviceRepo)
	serviceHandler := handlers.NewServiceHandler(serviceService)
	adminServiceHandler := handlers.NewAdminServiceHandler(serviceService)

	bookingRepo := repositories.NewBookingRepository(db)
	completionHandler := handlers.NewCompletionHandler(bookingRepo)

	bookingService := services.NewBookingService(bookingRepo, serviceRepo)
	bookingHandler := handlers.NewBookingHandler(bookingService)
	adminHandler := handlers.NewAdminHandler(bookingService)
	cleanerHandler := handlers.NewCleanerHandler(bookingService)

	paymentHandler := handlers.NewPaymentHandler(bookingRepo, cfg)

	// PUBLIC ROUTES (NO JWT)

	e.POST("/auth/register", authHandler.Register)
	e.POST("/auth/login", authHandler.Login)

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"status": "ok",
			"port":   cfg.AppPort,
		})
	})
	e.Static("/uploads", "uploads")

	// SERVICES PUBLIC
	e.GET("/api/services", serviceHandler.GetAll)
	e.GET("/api/services/:id", serviceHandler.GetByID)

	// PROTECTED ROUTES (JWT)
	api := e.Group("/api")

	api.Use(middleware.JWTMiddleware)

	api.GET("/profile", userHandler.Profile)
	api.PUT("/profile", userHandler.UpdateProfile)
	api.PUT("/profile/password", userHandler.ChangePassword)
	api.POST("/bookings", bookingHandler.Create)
	api.GET("/bookings", bookingHandler.MyBookings)
	api.PUT("/bookings/:id/cancel", bookingHandler.Cancel)

	api.PUT("/bookings/:id/approve-done", completionHandler.UserApproveDone)
	api.PUT("/bookings/:id/complain", completionHandler.UserComplain)


	api.POST("/bookings/:id/pay", paymentHandler.CreateSnapToken)
	e.POST("/payment/webhook", paymentHandler.HandleWebhook)

	// ADMIN ROUTES
	admin := api.Group("/admin")

	admin.Use(middleware.AdminOnly)

	admin.PUT("/bookings/:id/approve", adminHandler.Approve)
	admin.PUT("/bookings/:id/reject", adminHandler.Reject)
	admin.GET("/bookings", adminHandler.GetAllBookings)

	admin.GET("/services", adminServiceHandler.GetAll)
	admin.POST("/services", adminServiceHandler.Create)
	admin.PUT("/services/:id", adminServiceHandler.Update)
	admin.DELETE("/services/:id", adminServiceHandler.Delete)

	admin.GET("/cleaners", adminCleanerHandler.GetAll)
	admin.POST("/cleaners", adminCleanerHandler.Create)
	admin.DELETE("/cleaners/:id", adminCleanerHandler.Delete)

	admin.PUT("/bookings/:id/resolve", completionHandler.AdminResolve)

	// CLEANER ROUTES
	cleaner := api.Group("/cleaner")
	cleaner.Use(middleware.CleanerOnly)
	cleaner.GET("/schedule", cleanerHandler.GetSchedule)

	cleaner.PUT("/bookings/:id/start", completionHandler.StartJob)
	cleaner.PUT("/bookings/:id/submit", completionHandler.SubmitDone)


	log.Printf("Server running at: http://localhost:%s\n", cfg.AppPort)
	e.Logger.Fatal(e.Start(":" + cfg.AppPort))
}
