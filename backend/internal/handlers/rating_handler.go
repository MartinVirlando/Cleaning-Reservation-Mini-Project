package handlers 

import (
	"backend/internal/models"
	"backend/internal/repositories"
	"net/http"
	"strconv"
	"time"


	"github.com/labstack/echo/v4"

)

type RatingHandler struct {
	ratingRepo repositories.RatingRepository
	bookingRepo repositories.BookingRepository

}

func NewRatingHandler(
    ratingRepo repositories.RatingRepository,
    bookingRepo repositories.BookingRepository,
) *RatingHandler {
    return &RatingHandler{ratingRepo, bookingRepo}
}


func (h *RatingHandler) Create(c echo.Context) error {
    userID := uint(c.Get("user_id").(float64))
    bookingID, _ := strconv.Atoi(c.Param("bookingId"))

    // Cek booking exists dan milik user ini
    booking, err := h.bookingRepo.FindByID(uint(bookingID))
    if err != nil {
        return c.JSON(http.StatusNotFound, map[string]string{"message": "Booking not found"})
    }

    if booking.UserID != userID {
        return c.JSON(http.StatusForbidden, map[string]string{"message": "Forbidden"})
    }

    // Hanya booking done yang bisa dirating
    if booking.Status != "done" {
        return c.JSON(http.StatusBadRequest, map[string]string{
            "message": "Booking must be done before rating",
        })
    }

    // Cek sudah pernah rating belum
    if h.ratingRepo.ExistsByBookingID(uint(bookingID)) {
        return c.JSON(http.StatusBadRequest, map[string]string{
            "message": "Booking already rated",
        })
    }

    var req struct {
        Stars   int    `json:"stars"`
        Comment string `json:"comment"`
    }
    if err := c.Bind(&req); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request"})
    }

    if req.Stars < 1 || req.Stars > 5 {
        return c.JSON(http.StatusBadRequest, map[string]string{
            "message": "Stars must be between 1 and 5",
        })
    }

    rating := &models.Rating{
        BookingID: uint(bookingID),
        UserID:    userID,
        Stars:     req.Stars,
        Comment:   req.Comment,
        CreatedAt: time.Now(),
    }

    if err := h.ratingRepo.Create(rating); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to save rating"})
    }

    return c.JSON(http.StatusCreated, rating)
}


func (h *RatingHandler) GetByBookingID(c echo.Context) error {
    bookingID, _ := strconv.Atoi(c.Param("bookingId"))

    rating, err := h.ratingRepo.FindByBookingID(uint(bookingID))
    if err != nil {
        return c.JSON(http.StatusNotFound, map[string]string{"message": "Rating not found"})
    }

    return c.JSON(http.StatusOK, rating)
}