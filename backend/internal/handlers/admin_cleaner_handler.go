package handlers

import (
	"net/http"
	"strconv"

	"backend/internal/models"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AdminCleanerHandler struct {
	db *gorm.DB
}

func NewAdminCleanerHandler(db *gorm.DB) *AdminCleanerHandler {
	return &AdminCleanerHandler{db: db}
}

func (h *AdminCleanerHandler) GetAll(c echo.Context) error {
	var cleaners []models.User

	if err := h.db.Where("role = ?", "cleaner").Find(&cleaners).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Failed to get cleaners",
		})
	}

	type CleanerResponse struct {
		ID       uint   `json:"id"`
		Username string `json:"username"`
		Email    string `json:"email"`
	}

	var result []CleanerResponse
	for _, c := range cleaners {
		result = append(result, CleanerResponse{
			ID:       c.ID,
			Username: c.Username,
			Email:    c.Email,
		})
	}

	if result == nil {
		result = []CleanerResponse{}
	}

	return c.JSON(http.StatusOK, result)

}

func (h *AdminCleanerHandler) Create(c echo.Context) error {
	type CreateCleanerRequest struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var req CreateCleanerRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Invalid request",
		})
	}

	if req.Username == "" || req.Email == "" || req.Password == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Username, email, and password are required",
		})
	}

	if len(req.Password) < 6 {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Password must be at least 6 characters",
		})
	}

	var existing models.User
	if err := h.db.Where("email = ?", req.Email).First(&existing).Error; err == nil {
		return c.JSON(http.StatusConflict, map[string]string{
			"message": "Email already registered",
		})
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Failed to process password",
		})
	}

	cleaner := models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hashed),
		Role:         "cleaner",
	}

	if err := h.db.Create(&cleaner).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"messgae": "Failed to create cleaner",
		})
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"message": "Cleaner created successfully",
		"cleaner": map[string]interface{}{
			"id":       cleaner.ID,
			"username": cleaner.Username,
			"email":    cleaner.Email,
		},
	})

}

func (h *AdminCleanerHandler) Delete(c echo.Context) error {
    id, _ := strconv.Atoi(c.Param("id"))

    var cleaner models.User
    if err := h.db.Where("id = ? AND role = ?", id, "cleaner").First(&cleaner).Error; err != nil {
        return c.JSON(http.StatusNotFound, map[string]string{
            "message": "Cleaner not found",
        })
    }

    if err := h.db.Delete(&cleaner).Error; err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{
            "message": "Failed to delete cleaner",
        })
    }

    return c.JSON(http.StatusOK, map[string]string{
        "message": "Cleaner deleted successfully",
    })
}
