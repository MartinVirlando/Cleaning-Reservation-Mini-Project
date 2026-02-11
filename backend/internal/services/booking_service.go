package services

import (
	"backend/internal/models"
	"backend/internal/repositories"
)

type BookingService interface {
	CreateBooking(userID uint, serviceID uint, date, time string) error
	GetMyBookings(userID uint) ([]models.Booking, error)
}

type bookingService struct {
	repo repositories.BookingRepository
}

func NewBookingService(repo repositories.BookingRepository) BookingService {
	return &bookingService{repo}
}

func (s *bookingService) CreateBooking(
	userID uint,
	serviceID uint,
	date string,
	time string,
) error {

	booking := models.Booking{
		UserID:    userID,
		ServiceID: serviceID,
		Date:      date,
		Time:      time,
		Status:    "pending",
	}

	return s.repo.Create(&booking)
}

func (s *bookingService) GetMyBookings(userID uint) ([]models.Booking, error) {
	return s.repo.FindByUserID(userID)
}
