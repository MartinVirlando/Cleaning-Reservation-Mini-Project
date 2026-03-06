package handlers

import (
	"backend/internal/repositories"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
)

type CompletionHandler struct {
	bookingRepo repositories.BookingRepository
}

func NewCompletionHandler(bookingRepo repositories.BookingRepository) *CompletionHandler {
	return &CompletionHandler{bookingRepo}
}

// ── CLEANER: Mulai kerja
func (h *CompletionHandler) StartJob(c echo.Context) error {
	cleanerID := uint(c.Get("user_id").(float64))
	id, _ := strconv.Atoi(c.Param("id"))

	booking, err := h.bookingRepo.FindByID(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Booking not found"})
	}

	if booking.CleanerID == nil || *booking.CleanerID != cleanerID {
		return c.JSON(http.StatusForbidden, map[string]string{"message": "Forbidden"})
	}

	if booking.Status != "approved" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Booking must be approved before starting",
		})
	}

	if err := h.bookingRepo.UpdateStatus(uint(id), "on_progress"); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to update status"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Job started"})
}

// ── CLEANER: Submit selesai + foto
func (h *CompletionHandler) SubmitDone(c echo.Context) error {
	cleanerID := uint(c.Get("user_id").(float64))
	id, _ := strconv.Atoi(c.Param("id"))

	fmt.Printf("DEBUG: id=%d, cleanerID=%d\n", id, cleanerID)

	booking, err := h.bookingRepo.FindByID(uint(id))
	if err != nil {

		fmt.Printf("DEBUG FindByID error: %v\n", err)
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Booking not found"})
	}

	fmt.Printf("DEBUG booking found: id=%d cleanerID=%v status=%s\n", booking.ID, booking.CleanerID, booking.Status)

	if booking.CleanerID == nil || *booking.CleanerID != cleanerID {
		return c.JSON(http.StatusForbidden, map[string]string{"message": "Forbidden"})
	}

	if booking.Status != "on_progress" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Job must be on_progress to submit",
		})
	}

	// Handle foto (opsional)
	imagePath := ""
	file, err := c.FormFile("image")
	if err == nil && file != nil {

		// Buat folder uploads kalau belum ada
		uploadDir := "uploads/completions"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to create upload dir"})
		}

		// Generate nama file unik
		ext := filepath.Ext(file.Filename)
		fileName := fmt.Sprintf("booking-%d-%d%s", id, time.Now().Unix(), ext)
		filePath := filepath.Join(uploadDir, fileName)

		// Simpan file
		src, err := file.Open()
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to open file"})
		}
		defer src.Close()

		dst, err := os.Create(filePath)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to save file"})
		}
		defer dst.Close()

		if _, err = io.Copy(dst, src); err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to write file"})
		}

		imagePath = "/" + filePath
	}

	if err := h.bookingRepo.SubmitCompletion(uint(id), imagePath); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to submit"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Submitted, waiting for user approval"})
}

// ── USER: Approve done
func (h *CompletionHandler) UserApproveDone(c echo.Context) error {
	userID := uint(c.Get("user_id").(float64))
	id, _ := strconv.Atoi(c.Param("id"))

	booking, err := h.bookingRepo.FindByID(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Booking not found"})
	}

	if booking.UserID != userID {
		return c.JSON(http.StatusForbidden, map[string]string{"message": "Forbidden"})
	}

	if booking.Status != "awaiting_approval" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Booking is not awaiting approval",
		})
	}

	if err := h.bookingRepo.UpdateStatus(uint(id), "done"); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to update status"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Booking marked as done"})
}

// ── USER: Complain
func (h *CompletionHandler) UserComplain(c echo.Context) error {
	userID := uint(c.Get("user_id").(float64))
	id, _ := strconv.Atoi(c.Param("id"))

	booking, err := h.bookingRepo.FindByID(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Booking not found"})
	}

	if booking.UserID != userID {
		return c.JSON(http.StatusForbidden, map[string]string{"message": "Forbidden"})
	}

	if booking.Status != "awaiting_approval" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Booking is not awaiting approval",
		})
	}

	var req struct {
		Note string `json:"note"`
	}
	c.Bind(&req)

	if req.Note == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Complaint note is required",
		})
	}

	if err := h.bookingRepo.SubmitComplain(uint(id), req.Note); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to submit complaint"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Complaint submitted to admin"})
}

// ── ADMIN: Resolve complain
func (h *CompletionHandler) AdminResolve(c echo.Context) error {
	id, _ := strconv.Atoi(c.Param("id"))

	var req struct {
		Action string `json:"action"` // "approve" atau "reject"
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request"})
	}

	if req.Action != "approve" && req.Action != "reject" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Action must be 'approve' or 'reject'",
		})
	}

	booking, err := h.bookingRepo.FindByID(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Booking not found"})
	}

	if booking.Status != "complained" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "Booking is not in complained status",
		})
	}

	newStatus := "done"
	if req.Action == "reject" {
		newStatus = "on_progress" // cleaner harus kirim ulang
	}

	if err := h.bookingRepo.ResolveComplain(uint(id), newStatus); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to resolve"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Resolved"})
}
