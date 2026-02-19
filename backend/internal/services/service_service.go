package services

import (
	"backend/internal/models"
	"backend/internal/repositories"
)

type ServiceService interface {
	GetAll() ([]models.Service, error)
	GetByID(id uint) (*models.Service, error)
	Create(service *models.Service) error
	Update(service *models.Service) error
	Delete(id uint) error
}

type serviceService struct {
	repo repositories.ServiceRepository
}

func NewServiceService(repo repositories.ServiceRepository) ServiceService {
	return &serviceService{repo: repo}
}

func (s *serviceService) GetAll() ([]models.Service, error) {
	return s.repo.GetAll()
}

func (s *serviceService) GetByID(id uint) (*models.Service, error) {
	return s.repo.GetByID(id)
}

func (s *serviceService) Create(service *models.Service) error {
	return s.repo.Create(service)
}

func (s *serviceService) Update(service *models.Service) error {
	return s.repo.Update(service)
}

func (s *serviceService) Delete(id uint) error {
	return s.repo.Delete(id)
}
