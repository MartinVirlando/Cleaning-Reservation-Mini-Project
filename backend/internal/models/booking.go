package models

import "time"

type Booking struct {
	ID uint `gorm:"primaryKey"`

	UserID uint
	User   User

	ServiceID uint
	Service   Service

	CleanerID *uint
	Cleaner   *User

	Date    string `gorm:"size:20"`
	Time    string `gorm:"size:20"`
	Status  string `gorm:"size:30"`
	Address string `gorm:"size:255"`

	PaymentStatus   string `gorm:"size:20;default:'unpaid'"`
	SnapToken       string `gorm:"size:500"`
	MidTransOrderID string `gorm:"size:100"`

	CompletionImage string `gorm:"size:500"`
	ComplainNote    string `gorm:"type:text"`

	CreatedAt time.Time
	UpdatedAt time.Time
}
