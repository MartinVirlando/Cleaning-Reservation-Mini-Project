package handlers

import (
	"net/http"
	"strconv"

	"backend/internal/services"

	"github.com/labstack/echo/v4"
)

type ServiceHandler struct {
	service services.ServiceService
}

func NewServiceHandler(service services.ServiceService) *ServiceHandler {
	return &ServiceHandler{service: service}
}

func (h *ServiceHandler) GetAll(c echo.Context) error {
	services, err := h.service.GetAll()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Failed to get services",
		})
	}
	return c.JSON(http.StatusOK, services)
}

func (h *ServiceHandler) GetByID(c echo.Context) error {
	idParam := c.Param("id")

	idInt, err := strconv.Atoi(idParam)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Invalid service id",
		})
	}

	service, err := h.service.GetByID(uint(idInt))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{
			"message": "Service not found",
		})
	}

	return c.JSON(http.StatusOK, service)
}
