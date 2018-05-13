package main

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
)

func getPlaces(c *gin.Context) {
	placeType := c.Query("type")
	purpose := c.Query("purpose")
	minArea := toFloat32(c.Query("minArea"))
	maxArea := toFloat32(c.Query("maxArea"))
	minPrice := toInt64(c.Query("minPrice"))
	maxPrice := toInt64(c.Query("maxPrice"))
	rooms := toUInt(c.Query("rooms"))
	floor := toUInt(c.Query("floor"))
	location := c.Query("location")

	ps := getPlacesBy(placeType, purpose, minArea,
		maxArea, minPrice, maxPrice, rooms, floor, location)
	session := sessions.Default(c)
	if !isUserLoggedIn(session) {
		for i := 0; i < len(ps); i++ {
			ps[i].Address = ""
		}
	}
	c.JSON(http.StatusOK, ps)
}

func toFloat32(s string) float32 {
	f, err := strconv.ParseFloat(s, 32)
	if err != nil {
		return float32(0)
	}
	return float32(f)
}

func toUInt(s string) uint {
	i, err := strconv.ParseUint(s, 10, 32)
	if err != nil {
		return uint(0)
	}
	return uint(i)
}

func toInt64(s string) int64 {
	i, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		return int64(0)
	}
	return i
}

func getPlace(c *gin.Context) {
	if placeID, err := strconv.Atoi(c.Param("place_id")); err == nil {
		place := getPlaceByID(placeID)
		if place.ID > 0 {
			session := sessions.Default(c)
			if !isUserLoggedIn(session) {
				place.Address = ""
			}
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
