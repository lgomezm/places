package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func initializeRoutes() {
	router.GET("/", index)
	router.POST("/login", login)
	router.GET("/logged-in", isLoggedIn)
	router.POST("/logout", logout)

	router.POST("/users", postUser)

	router.GET("/places", getPlaces)
	router.GET("/places/:place_id", getPlace)

	places := router.Group("/places")
	places.Use(authRequired)
	places.POST("/", postPlace)
	places.PUT("/:place_id", putPlace)
	places.DELETE("/:place_id", deletePlace)
	places.POST("/:place_id/photos", createPlacePhoto)
	places.DELETE("/:place_id/photos/:photo_id", deletePlacePhoto)

	owners := router.Group("/owners")
	owners.Use(authRequired)
	owners.GET("/", listOwners)
	owners.GET("/:owner_id", getOwner)
	owners.POST("/", postOwner)
	owners.PUT("/:owner_id", putOwner)
	owners.DELETE("/:owner_id", deleteOwner)
}

func index(c *gin.Context) {
	c.Redirect(http.StatusMovedPermanently, "static/index.html")
}
