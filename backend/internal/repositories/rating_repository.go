package repositories

import(
	"backend/internal/models"
	"gorm.io/gorm"
)

type RatingRepository interface{
	Create(rating *models.Rating) error
	FindByBookingID(bookingID uint) (*models.Rating, error)
	ExistsByBookingID(bookingID uint) bool
}

type ratingRepository struct {
	db *gorm.DB
}

func NewRatingRepository(db *gorm.DB) RatingRepository{
	return &ratingRepository{db}
}

func (r *ratingRepository) Create(rating *models.Rating) error {
	return r.db.Create(rating).Error
}

func (r *ratingRepository) FindByBookingID(bookingID uint) (*models.Rating, error) {
	var rating models.Rating
	err := r.db.Where("booking_id = ?", bookingID).First(&rating).Error
	return &rating, err
}

func (r *ratingRepository) ExistsByBookingID(bookingID uint) bool {
	var count  int64
	r.db.Model(&models.Rating{}).Where("booking_id = ?", bookingID).Count(&count)
	return count > 0
}


