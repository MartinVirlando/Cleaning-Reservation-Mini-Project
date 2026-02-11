package main

import (
	"log"
	"net/http"

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/handlers"
	"backend/internal/middleware"

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

	e.POST("/auth/register", authHandler.Register)
	e.POST("/auth/login", authHandler.Login)

	api := e.Group("/api")
	api.Use(middleware.JWTMiddleware)

	api.GET("/profile", userHandler.Profile)

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"status": "ok",
			"port":   cfg.AppPort,
		})
	})

	log.Printf("Server running at: http://localhost:%s\n", cfg.AppPort)
	e.Logger.Fatal(e.Start(":" + cfg.AppPort))
}
