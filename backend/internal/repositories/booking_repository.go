package repositories

import (
	"backend/internal/models"

	"gorm.io/gorm"
)

type BookingRepository interface {
	Create(booking *models.Booking) error
	FindByUserID(userID uint) ([]models.Booking, error)
	FindByID(id uint) (*models.Booking, error)
}

type bookingRepository struct {
	db *gorm.DB
}

func NewBookingRepository(db *gorm.DB) BookingRepository {
	return &bookingRepository{db}
}

func (r *bookingRepository) Create(booking *models.Booking) error {
	return r.db.Create(booking).Error
}

func (r *bookingRepository) FindByUserID(userID uint) ([]models.Booking, error) {
	var bookings []models.Booking

	err := r.db.
		Preload("Service").
		Where("user_id = ?", userID).
		Find(&bookings).Error

	return bookings, err
}

func (r *bookingRepository) FindByID(id uint) (*models.Booking, error) {
	var booking models.Booking

	err := r.db.
		Preload("Service").
		First(&booking, id).Error

	if err != nil {
		return nil, err
	}

	return &booking, nil
}
