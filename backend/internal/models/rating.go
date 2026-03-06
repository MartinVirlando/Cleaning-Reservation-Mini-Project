package models

import "time"

type Rating struct {
	ID        uint `gorm:"primaryKey"`
	BookingID uint `gorm:"uniqueIndex"`
	UserID    uint
	Stars     int    `gorm:"not null"`
	Comment   string `gorm:"type:text"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
