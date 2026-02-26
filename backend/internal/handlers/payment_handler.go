package handlers

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"backend/internal/config"
	"backend/internal/repositories"

	"github.com/labstack/echo/v4"
	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/snap"
)

type PaymentHandler struct {
	bookingRepo repositories.BookingRepository
	cfg         *config.Config
}

func NewPaymentHandler(bookingRepo repositories.BookingRepository, cfg *config.Config) *PaymentHandler {
	return &PaymentHandler{bookingRepo: bookingRepo, cfg: cfg}
}

func (h *PaymentHandler) CreateSnapToken(c echo.Context) error {
	bookingID := c.Param("id")
	userID := uint(c.Get("user_id").(float64))

	booking, err := h.bookingRepo.FindByID(parseUint(bookingID))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{
			"message": "Booking not found",
		})
	}

	if booking.UserID != userID {
		return c.JSON(http.StatusForbidden, map[string]string{
			"message": "Forbidden",
		})
	}

	if booking.SnapToken != "" && booking.PaymentStatus == "unpaid" {
		return c.JSON(http.StatusOK, map[string]string{
			"snap_token": booking.SnapToken,
			"client_key": h.cfg.MidtransClientKey,
		})
	}

	orderID := fmt.Sprintf("booking-%s-%d", bookingID, time.Now().Unix())

	var snapClient snap.Client
	snapClient.New(h.cfg.MidtransServerKey, midtrans.Sandbox)

	req := &snap.Request{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  orderID,
			GrossAmt: int64(booking.Service.Price),
		},
		CustomerDetail: &midtrans.CustomerDetails{
			FName: booking.User.Username,
			Email: booking.User.Email,
		},
	}

	snapResp, snapErr := snapClient.CreateTransaction(req)

	if snapResp == nil || snapResp.Token == "" {
		if snapErr != nil {
			log.Println("Midtrans error:", snapErr)
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Failed to Create Payment",
		})
	}

	if err := h.bookingRepo.UpdatePaymentToken(booking.ID, snapResp.Token, orderID); err != nil {
		log.Println("Error UpdatePaymentToken:", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": "Failed to save token: " + err.Error(),
		})
	}

	log.Println("Token saved:", snapResp.Token)
	return c.JSON(http.StatusOK, map[string]string{
		"snap_token": snapResp.Token,
		"client_key": h.cfg.MidtransClientKey,
	})

}

func (h *PaymentHandler) HandleWebhook(c echo.Context) error {

	var notification map[string]interface{}
	if err := c.Bind(&notification); err != nil {
		return c.JSON(http.StatusBadRequest, nil)
	}

	orderID := notification["order_id"].(string)
	transactionStatus := notification["transaction_status"].(string)
	fraudStatus, _ := notification["fraud_status"].(string)

	booking, err := h.bookingRepo.FindByOrderID(orderID)
	if err != nil {
		return c.JSON(http.StatusNotFound, nil)
	}

	if transactionStatus == "capture" && fraudStatus == "accept" {
		h.bookingRepo.UpdatePaymentStatus(booking.ID, "paid")
	} else if transactionStatus == "settlement" {
		h.bookingRepo.UpdatePaymentStatus(booking.ID, "paid")
	} else if transactionStatus == "deny" || transactionStatus == "cancel" || transactionStatus == "expire" {
		h.bookingRepo.UpdatePaymentStatus(booking.ID, "failed")
	}

	return c.JSON(http.StatusOK, nil)

}

func parseUint(s string) uint {
	var id uint
	fmt.Sscanf(s, "%d", &id)
	return id
}
