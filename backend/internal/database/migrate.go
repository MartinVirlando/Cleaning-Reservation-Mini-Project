package database

import (
	"backend/internal/models"

	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {

	if err := db.AutoMigrate(
		&models.User{},
		&models.Service{},
		&models.Booking{},
	); err != nil {
		return err
	}

	return nil
}
