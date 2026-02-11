package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type UserHandler struct{}

func NewUserHandler() *UserHandler {
	return &UserHandler{}
}

func (h *UserHandler) Profile(c echo.Context) error {

	userID := c.Get("user_id")
	email := c.Get("email")

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Profile accessed",
		"user_id": userID,
		"email":   email,
	})
}
