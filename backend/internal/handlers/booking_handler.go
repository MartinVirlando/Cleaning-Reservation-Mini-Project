package handlers

import (
	"net/http"
	"strconv"

	"backend/internal/services"

	"github.com/labstack/echo/v4"
)

type BookingHandler struct {
	service services.BookingService
}

func NewBookingHandler(service services.BookingService) *BookingHandler {
	return &BookingHandler{service}
}

type CreateBookingRequest struct {
	ServiceID uint   `json:"serviceId"`
	Date      string `json:"date"`
	Time      string `json:"time"`
	Address   string `json:"address"`
}

func (h *BookingHandler) Create(c echo.Context) error {

	userIDFloat, ok := c.Get("user_id").(float64)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"message": "Unauthorized",
		})
	}

	userID := uint(userIDFloat)

	var req CreateBookingRequest

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Invalid request",
		})
	}

	if req.ServiceID == 0 || req.Date == "" || req.Time == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "service_id, date, time are required",
		})
	}

	err := h.service.CreateBooking(
		uint(userID),
		req.ServiceID,
		req.Date,
		req.Time,
		req.Address,
	)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Failed create booking",
		})
	}

	return c.JSON(http.StatusCreated, map[string]string{
		"message": "Booking created",
	})
}

func (h *BookingHandler) MyBookings(c echo.Context) error {
	userIDFloat, ok := c.Get("user_id").(float64)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"message": "Unauthorized",
		})
	}
	userID := uint(userIDFloat)

	bookings, err := h.service.GetMyBookings(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Failed get bookings",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, bookings)
}

func (h *BookingHandler) Detail(c echo.Context) error {

	id, _ := strconv.Atoi(c.Param("id"))

	booking, err := h.service.GetMyBookings(uint(id))

	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{
			"message": "Not found",
		})
	}

	return c.JSON(http.StatusOK, booking)
}
