package routes

import (
	"backend/internal/handlers"
	"backend/internal/middleware"

	"github.com/labstack/echo/v4"
)

func RegisterRoutes(
	e *echo.Echo,
	bookingHandler *handlers.BookingHandler,
	adminHandler *handlers.AdminHandler,
) {
	api := e.Group("/api")
	api.POST("/bookings", bookingHandler.Create, middleware.JWTMiddleware)
	api.GET("/bookings", bookingHandler.MyBookings, middleware.JWTMiddleware)

	// ADMIN ONLY GROUP
	admin := api.Group("/admin", middleware.JWTMiddleware, middleware.AdminOnly)

	admin.PUT("/bookings/:id/approve", adminHandler.Approve)
	admin.PUT("/bookings/:id/reject", adminHandler.Reject)

}
