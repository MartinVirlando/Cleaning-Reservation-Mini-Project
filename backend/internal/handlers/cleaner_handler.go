package handlers

import (
	"net/http"

	"backend/internal/services"

	"github.com/labstack/echo/v4"
)

type CleanerHandler struct {
	bookingService services.BookingService
}

func NewCleanerHandler(bookingService services.BookingService) *CleanerHandler {
	return &CleanerHandler{bookingService: bookingService}
}

func (h *CleanerHandler) GetSchedule(c echo.Context) error {
	cleanerID := uint(c.Get("user_id").(float64))

	bookings, err := h.bookingService.GetMySchedule(cleanerID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Failed to get schedule",
		})
	}

	return c.JSON(http.StatusOK, bookings)
}
