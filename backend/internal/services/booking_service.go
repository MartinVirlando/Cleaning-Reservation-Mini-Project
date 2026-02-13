package services

import (
	"backend/internal/models"
	"backend/internal/repositories"
	"errors"
)

type BookingService interface {
	CreateBooking(userID uint, serviceID uint, date, time string, address string) error
	GetMyBookings(userID uint) ([]models.Booking, error)

	UpdateStatus(id uint, status string) error
	GetAllBookings() ([]models.Booking, error)
}

type bookingService struct {
	repo        repositories.BookingRepository
	serviceRepo repositories.ServiceRepository
}

func NewBookingService(
	repo repositories.BookingRepository,
	serviceRepo repositories.ServiceRepository,
) BookingService {
	return &bookingService{repo: repo, serviceRepo: serviceRepo}
}

func (s *bookingService) CreateBooking(
	userID uint,
	serviceID uint,
	date string,
	time string,
	address string,
) error {

	if serviceID == 0 || date == "" || time == "" {
		return errors.New("service_id, date, time are required")
	}

	_, err := s.serviceRepo.GetByID(serviceID)
	if err != nil {
		return errors.New("service not found")
	}

	booking := models.Booking{
		UserID:    userID,
		ServiceID: serviceID,
		Date:      date,
		Time:      time,
		Status:    "pending",
		Address:   address,
	}

	return s.repo.Create(&booking)
}

func (s *bookingService) UpdateStatus(id uint, status string) error {
	return s.repo.UpdateStatus(id, status)
}

func (s *bookingService) GetAllBookings() ([]models.Booking, error) {
	return s.repo.FindAll()
}

func (s *bookingService) GetMyBookings(userID uint) ([]models.Booking, error) {
	return s.repo.FindByUserID(userID)
}
