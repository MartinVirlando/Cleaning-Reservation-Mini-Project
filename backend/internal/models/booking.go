package models

import "time"

type Booking struct {
	ID uint `gorm:"primaryKey"`

	UserID uint
	User   User

	ServiceID uint
	Service   Service

	Date   string `gorm:"size:20"`
	Time   string `gorm:"size:20"`
	Status string `gorm:"size:20"`

	CreatedAt time.Time
	UpdatedAt time.Time
}
