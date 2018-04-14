package main

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func getPlaces(c *gin.Context) {
	c.JSON(http.StatusOK, getAllPlaces())
}

func getPlace(c *gin.Context) {
	if placeID, err := strconv.Atoi(c.Param("place_id")); err == nil {
		if place, err := getPlaceByID(placeID); err == nil {
			c.JSON(http.StatusOK, place)
		} else {
			c.AbortWithError(http.StatusNotFound, err)
		}
	} else {
		c.AbortWithStatus(http.StatusNotFound)
	}
}
