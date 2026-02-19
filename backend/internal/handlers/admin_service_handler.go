package handlers

import (
	"net/http"
	"strconv"

	"backend/internal/models"
	"backend/internal/services"

	"github.com/labstack/echo/v4"
)

type AdminServiceHandler struct {
	service services.ServiceService
}

func NewAdminServiceHandler(service services.ServiceService) *AdminServiceHandler {
	return &AdminServiceHandler{service: service}
}

func (h *AdminServiceHandler) GetAll(c echo.Context) error {
	services, err := h.service.GetAll()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Failed to get services",
		})
	}
	return c.JSON(http.StatusOK, services)
}

func (h *AdminServiceHandler) Create(c echo.Context) error {
	var input struct {
		Name        string `json:"name" validate: required`
		Description string `json:"description"`
		Price       int    `json:"price" validate: required`
		Duration    int    `json:"duration" validate: required`
	}
	if err := c.Bind(&input); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Invalid request body",
		})
	}
	service := &models.Service{
		Name:        input.Name,
		Description: input.Description,
		Price:       input.Price,
		Duration:    input.Duration,
	}

	if err := h.service.Create(service); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Failed to create service",
		})
	}
	return c.JSON(http.StatusCreated, service)
}

func (h *AdminServiceHandler) Update(c echo.Context) error {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Invalid service id",
		})
	}

	existingService, err := h.service.GetByID(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{
			"message": "Service not found",
		})
	}
	var input struct {
		Name        string `json: "name"`
		Description string `json: "description"`
		Price       int    `json: "price"`
		Duration    int    `json: "duration"`
	}

	if err := c.Bind(&input); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Invalid Input",
		})
	}

	existingService.Name = input.Name
	existingService.Description = input.Description
	existingService.Price = input.Price
	existingService.Duration = input.Duration

	if err := h.service.Update(existingService); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Failed to Update Service",
		})
	}
	return c.JSON(http.StatusOK, existingService)
}

func (h *AdminServiceHandler) Delete(c echo.Context) error {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "invalid service ID",
		})
	}
	_, err = h.service.GetByID(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{
			"message": "Service Not Found",
		})
	}

	if err := h.service.Delete(uint(id)); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Failed to Delete Service",
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Delete Successfully",
	})
}
