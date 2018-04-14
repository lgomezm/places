package main

import (
	"github.com/jinzhu/gorm"
)

type place struct {
	gorm.Model
	Name        string `json:"name"`
	Description string `json:"description"`
}

func getAllPlaces() []place {
	var places []place
	db.Find(&places)
	return places
}

func getPlaceByID(placeID int) place {
	var p place
	db.First(&p, placeID)
	return p
}

func createPlace(p place) place {
	db.Create(&p)
	return p
}

func updatePlace(p place) place {
	db.Model(&p).Updates(place{Name: p.Name, Description: p.Description})
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
