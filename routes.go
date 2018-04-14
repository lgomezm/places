package main

func initializeRoutes() {
	router.GET("/places", getPlaces)
	router.GET("/places/:place_id", getPlace)
	router.POST("/places", postPlace)
	router.PUT("/places/:place_id", putPlace)
	router.DELETE("/places/:place_id", deletePlace)
}
