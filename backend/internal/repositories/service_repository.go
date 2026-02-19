package repositories

import (
	"backend/internal/models"

	"gorm.io/gorm"
)

type ServiceRepository interface {
	GetAll() ([]models.Service, error)
	GetByID(id uint) (*models.Service, error)
	Create(service *models.Service) error
	Update(service *models.Service) error
	Delete(id uint) error
}

type serviceRepository struct {
	db *gorm.DB
}

func NewServiceRepository(db *gorm.DB) ServiceRepository {
	return &serviceRepository{db: db}
}

func (r *serviceRepository) GetAll() ([]models.Service, error) {
	var services []models.Service
	
	err := r.db.Find(&services).Error
	if err != nil {
		return nil, err
	}

	return services, nil
}

func (r *serviceRepository) GetByID(id uint) (*models.Service, error) {
	var services models.Service
	err := r.db.First(&services, id).Error
	if err != nil {
		return nil, err
	}
	return &services, nil
}

func(r *serviceRepository) Create(service *models.Service) error {
	return r.db.Create(service).Error
}

func(r *serviceRepository) Update(service *models.Service) error {
	return r.db.Save(service).Error
}

func(r *serviceRepository) Delete(id uint) error {
	return r.db.Delete(&models.Service{}, id).Error
}


