package services

import (
	"backend/internal/models"
	"backend/internal/repositories"
)

type ServiceService interface {
	GetAll() ([]models.Service, error)
	GetByID(id uint) (*models.Service, error)
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
