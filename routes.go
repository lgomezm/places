package main

func initializeRoutes() {
	router.GET("/places", getPlaces)
	router.GET("/places/:place_id", getPlace)
}
