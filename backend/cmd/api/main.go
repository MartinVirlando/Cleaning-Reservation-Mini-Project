package main

import (
	"log"
	"net/http"

	"backend/internal/config"
	"backend/internal/database"

	"github.com/labstack/echo/v4"
)

func main() {

	cfg := config.Load()

	log.Println("DB_USER:", cfg.DBUser)
	log.Println("DB_PASS:", cfg.DBPassword)
	log.Println("DB_NAME:", cfg.DBName)

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal(err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal(err)
	}

	if err := sqlDB.Ping(); err != nil {
		log.Fatal("DB ping failed", err)
	}

	log.Println("DB Connected")

	e := echo.New()

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"status": "ok",
			"port":   cfg.AppPort,
		})
	})

	e.Logger.Fatal(e.Start(":" + cfg.AppPort))
}
