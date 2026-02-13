package middleware

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func AdminOnly(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {

		role := c.Get("role")

		if role != "admin" {
			return c.JSON(http.StatusForbidden, map[string]string{
				"message": "admin only",
			})
		}

		return next(c)
	}
}
