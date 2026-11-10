package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Response standard API response format
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// JSONSuccess responds with HTTP 200 and success data
func JSONSuccess(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Success: true,
		Data:    data,
	})
}

// JSONCreated responds with HTTP 201 and created resource data
func JSONCreated(c *gin.Context, data interface{}, message string) {
	c.JSON(http.StatusCreated, Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// JSONError responds with an HTTP status code and error message
func JSONError(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, Response{
		Success: false,
		Error:   message,
	})
}

// JSONBadRequest responds with HTTP 400
func JSONBadRequest(c *gin.Context, message string) {
	JSONError(c, http.StatusBadRequest, message)
}

// JSONUnauthorized responds with HTTP 401
func JSONUnauthorized(c *gin.Context, message string) {
	JSONError(c, http.StatusUnauthorized, message)
}

// JSONNotFound responds with HTTP 404
func JSONNotFound(c *gin.Context, message string) {
	JSONError(c, http.StatusNotFound, message)
}

// JSONInternalError responds with HTTP 500
func JSONInternalError(c *gin.Context, message string) {
	JSONError(c, http.StatusInternalServerError, message)
}

