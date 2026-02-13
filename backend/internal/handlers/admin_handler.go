package handlers

import(
	"net/http"
	"strconv"

	"backend/internal/services"

	"github.com/labstack/echo/v4"
)

type AdminHandler struct {
	bookingService services.BookingService
}

func NewAdminHandler(bookingService services.BookingService) *AdminHandler {
	return &AdminHandler{bookingService: bookingService}
}

func (h *AdminHandler) Approve(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))

	err := h.bookingService.UpdateStatus(uint(id), "approved")
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Failed to approve booking",
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Booking approved",
	})
}

func (h *AdminHandler) Reject(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))

	err := h.bookingService.UpdateStatus(uint(id), "rejected")
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Failed to reject booking",
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Booking rejected",
	})
}