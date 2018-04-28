package main

import (
	"strings"

	"github.com/jinzhu/gorm"
)

type place struct {
	gorm.Model
	Name        string  `json:"name" gorm:"not null"`
	Description string  `json:"description"`
	Type        string  `json:"type"`
	Purpose     string  `json:"purpose"`
	Area        float32 `json:"area"`
	Floor       uint    `json:"floor"`
	Bedrooms    uint    `json:"bedrooms"`
	Bathrooms   uint    `json:"bathrooms"`
	Stratum     uint    `json:"stratum"`
	Parking     uint    `json:"parking"`
	Price       int64   `json:"price"`
	Location    string  `json:"location"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Photos      []photo `json:"photos"`
}

type photo struct {
	gorm.Model
	URL     string `json:"url" gorm:"not null"`
	PlaceID uint   `json:"place_id"`
}

func getPlacesBy(placeType string, purpose string,
	minArea float32, maxArea float32, minPrice int64,
	maxPrice int64, rooms uint, floor uint,
	location string) []place {
	q := db
	if strings.Trim(placeType, " ") != "" {
		q = db.Where("type = ?", placeType)
	}
	if strings.Trim(purpose, " ") != "" {
		q = q.Where("purpose = ?", purpose)
	}
	if minArea > 0 {
		q = q.Where("area >= ?", minArea)
	}
	if maxArea > 0 {
		q = q.Where("area <= ?", maxArea)
	}
	if minPrice > 0 {
		q = q.Where("price >= ?", minPrice)
	}
	if maxPrice > 0 {
		q = q.Where("price <= ?", maxPrice)
	}
	if rooms > 0 {
		q = q.Where("bedrooms >= ?", rooms)
	}
	if floor > 0 {
		q = q.Where("floor >= ?", floor)
	}
	if strings.Trim(location, " ") != "" {
		q = q.Where("location = ?", location)
	}
	var places []place
	q.Find(&places)
	return places
}

func getPlaceByID(placeID int) place {
	var p place
	var photos []photo
	db.First(&p, placeID)
	db.Model(&p).Related(&photos)
	p.Photos = photos
	return p
}

func createPlace(p place) place {
	db.Create(&p)
	return p
}

func updatePlace(p place) place {
	db.Model(&p).Updates(
		place{
			Name:        p.Name,
			Description: p.Description,
			Type:        p.Type,
			Purpose:     p.Purpose,
			Area:        p.Area,
			Floor:       p.Floor,
			Bedrooms:    p.Bedrooms,
			Bathrooms:   p.Bathrooms,
			Stratum:     p.Stratum,
			Parking:     p.Parking,
			Price:       p.Price,
			Location:    p.Location,
			Latitude:    p.Latitude,
			Longitude:   p.Longitude,
		})
	return p
}

func softDeletePlace(placeID int) bool {
	var p place
	db.First(&p, placeID)
	if p.ID > 0 {
		db.Delete(&p)
		return true
	}
	return false
}

func createPhoto(p photo) photo {
	db.Create(&p)
	return p
}
