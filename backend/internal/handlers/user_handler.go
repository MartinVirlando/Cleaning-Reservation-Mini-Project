package handlers

import (
	"net/http"

	"backend/internal/models"
	"backend/internal/utils"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserHandler struct {
	db *gorm.DB
}

func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{db: db}
}

func (h *UserHandler) Profile(c echo.Context) error {
	userID := c.Get("user_id").(float64)

	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{
			"message": "User not found",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"id":       user.ID,
		"username": user.Username,
		"email":    user.Email,
		"role":     user.Role,
	})
}

func (h *UserHandler) UpdateProfile(c echo.Context) error {
	userID := c.Get("user_id").(float64)

	type UpdateProfileRequest struct {
		Username string `json:"username"`
		Email    string `json:"email"`
	}

	var req UpdateProfileRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Invalid request",
		})
	}

	if len(req.Username) < 3 {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Username must be at least 3 characters",
		})
	}
	if req.Email == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Email is required",
		})
	}

	var existing models.User
	if err := h.db.Where("email = ? AND id != ?", req.Email, userID).First(&existing).Error; err == nil {
		return c.JSON(http.StatusConflict, map[string]string{
			"message": "Email already used by another account",
		})
	}

	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{
			"message": "User not found",
		})
	}

	// Update field
	user.Username = req.Username
	user.Email = req.Email

	if err := h.db.Save(&user).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Failed to update profile",
		})
	}

	newToken, err := utils.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Failed to generate token",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Profile updated successfully",
		"token":   newToken,
		"user": map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"role":     user.Role,
		},
	})
}

func (h *UserHandler) ChangePassword(c echo.Context) error {
	userID := c.Get("user_id").(float64)

	type ChangePasswordRequest struct {
		CurrentPassword string `json:"currentPassword"`
		NewPassword     string `json:"newPassword"`
	}

	var req ChangePasswordRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Invalid request",
		})
	}

	if req.CurrentPassword == "" || req.NewPassword == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Current password and new password are required",
		})
	}

	if len(req.NewPassword) < 6 {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "New password must be at least 6 characters",
		})
	}

	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{
			"message": "User not found",
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.CurrentPassword)); err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"message": "Current password is incorrect",
		})
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Failed to process new password",
		})
	}

	user.PasswordHash = string(hashed)

	if err := h.db.Save(&user).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Failed to update password",
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Password changed successfully",
	})
}
