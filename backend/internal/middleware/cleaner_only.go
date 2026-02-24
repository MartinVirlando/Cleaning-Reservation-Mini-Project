package middleware

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func CleanerOnly(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		role, ok := c.Get("role").(string)
		if !ok || role != "cleaner" {
			return c.JSON(http.StatusForbidden, map[string]string{
				"message": "Cleaner access only",
			})
		}
		return next(c)
	}
}
