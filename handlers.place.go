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
		place := getPlaceByID(placeID)
		if place.ID > 0 {
			c.JSON(http.StatusOK, place)
		} else {
			c.AbortWithStatus(http.StatusNotFound)
		}
	} else {
		c.AbortWithStatus(http.StatusNotFound)
	}
}

func postPlace(c *gin.Context) {
	var p place
	c.BindJSON(&p)
	p = createPlace(p)
	c.JSON(http.StatusOK, p)
}

func putPlace(c *gin.Context) {
	var p place
	c.BindJSON(&p)
	p = updatePlace(p)
	c.JSON(http.StatusOK, p)
}

func deletePlace(c *gin.Context) {
	if placeID, err := strconv.Atoi(c.Param("place_id")); err == nil {
		deleted := softDeletePlace(placeID)
		if deleted {
			c.String(http.StatusNoContent, "")
		} else {
			c.AbortWithStatus(http.StatusNotFound)
		}
	} else {
		c.AbortWithStatus(http.StatusNotFound)
	}
}
