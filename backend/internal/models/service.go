package models

import "time"

type Service struct {
	ID        uint   `gorm:"primaryKey"`
	Name      string `gorm:"size:100;not null"`
	Price     int    `gorm:"not null"`
	Duration  int    `gorm:"not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
