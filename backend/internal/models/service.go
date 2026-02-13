package models

import "time"

type Service struct {
	ID          uint   `gorm:"primaryKey"`
	Name        string `gorm:"size:100;not null"`
	Description string `gorm:"size:255"`
	Price       int    `gorm:"not null"`
	Duration    int    `gorm:"not null"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
