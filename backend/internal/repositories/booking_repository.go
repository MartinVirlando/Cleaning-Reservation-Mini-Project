package repositories

import (
	"backend/internal/models"
	"errors"

	"gorm.io/gorm"
)

type BookingRepository interface {
	Create(booking *models.Booking) error
	FindByUserID(userID uint) ([]models.Booking, error)
	FindByID(id uint) (*models.Booking, error)
	UpdateStatus(id uint, status string) error
	FindAll() ([]models.Booking, error)
	ApproveWithCleaner(id uint, cleanerID uint) error
	FindByCleanerID(cleanerID uint) ([]models.Booking, error)
	CancelBooking(id uint, userID uint) error
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
		Preload("Service", func(db *gorm.DB) *gorm.DB {
			return db.Unscoped()
		}).
		Preload("User").
		Preload("Cleaner").
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

func (r *bookingRepository) UpdateStatus(id uint, status string) error {
	return r.db.Model(&models.Booking{}).
		Where("id = ?", id).
		Update("status", status).Error
}

func (r *bookingRepository) FindAll() ([]models.Booking, error) {
	var bookings []models.Booking
	err := r.db.
		Preload("User").
		Preload("Service").
		Preload("Cleaner").
		Find(&bookings).Error
	return bookings, err
}

func (r *bookingRepository) ApproveWithCleaner(id uint, cleanerID uint) error {
	return r.db.Model(&models.Booking{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":     "approved",
		"cleaner_id": cleanerID,
	}).Error
}

func (r *bookingRepository) FindByCleanerID(cleanerID uint) ([]models.Booking, error) {
	var bookings []models.Booking
	err := r.db.
		Preload("User").
		Preload("Service", func(db *gorm.DB) *gorm.DB {
			return db.Unscoped()
		}).
		Where("cleaner_id = ?", cleanerID).
		Find(&bookings).Error

	return bookings, err

}

func (r *bookingRepository) CancelBooking(id uint, userID uint) error {
	result := r.db.Model(&models.Booking{}).
		Where("id = ? AND user_id = ? AND status = ?", id, userID, "pending").
		Update("status", "canceled")

	if result.RowsAffected == 0 {
		return errors.New("Booking not found or cannot be canceled")
	}

	return result.Error
}
