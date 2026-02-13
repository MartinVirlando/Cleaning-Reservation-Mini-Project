package repositories

import (
	"backend/internal/models"

	"gorm.io/gorm"
)

type ServiceRepository interface {
	GetAll() ([]models.Service, error)
	GetByID(id uint) (*models.Service, error)
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
