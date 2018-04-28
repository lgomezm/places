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
	router.POST("/places", postPlace)
	router.PUT("/places/:place_id", putPlace)
	router.DELETE("/places/:place_id", deletePlace)
	router.POST("/places/:place_id/photos", uploadPhoto)

	private := router.Group("/private")
	private.Use(authRequired)
	private.GET("/", private1)
	private.GET("/two", private2)
}

func index(c *gin.Context) {
	c.Redirect(http.StatusMovedPermanently, "static/index.html")
}

func private1(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"hello": "user"})
}

func private2(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"hello": "Logged in user"})
}
