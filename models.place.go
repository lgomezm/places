package main

import (
	"strings"

	"github.com/jinzhu/gorm"
)

type place struct {
	gorm.Model
	Name        string    `json:"name" gorm:"not null"`
	Description string    `json:"description"`
	Type        string    `json:"type"`
	Area        float32   `json:"area"`
	Floor       uint      `json:"floor"`
	Bedrooms    uint      `json:"bedrooms"`
	Bathrooms   uint      `json:"bathrooms"`
	Stratum     uint      `json:"stratum"`
	Parking     uint      `json:"parking"`
	Location    string    `json:"location"`
	Latitude    float64   `json:"latitude"`
	Longitude   float64   `json:"longitude"`
	Purposes    []purpose `json:"purposes" gorm:"auto_preload"`
	Photos      []photo   `json:"photos"`
}

type purpose struct {
	Purpose string `json:"purpose" gorm:"primary_key"`
	PlaceID uint   `json:"place_id" gorm:"primary_key"`
	Price   int64  `json:"price"`
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
	q := db.Joins("JOIN purposes ON places.id = purposes.place_id")
	if strings.Trim(placeType, " ") != "" {
		q = q.Where("places.type = ?", placeType)
	}
	purposeQry := []string{}
	var values []interface{}
	if strings.Trim(purpose, " ") != "" {
		purposeQry = append(purposeQry, "purposes.purpose = ?")
		values = append(values, purpose)
	}
	if minPrice > 0 {
		purposeQry = append(purposeQry, "purposes.price >= ?")
		values = append(values, minPrice)
	}
	if maxPrice > 0 {
		purposeQry = append(purposeQry, "purposes.price <= ?")
		values = append(values, maxPrice)
	}
	if len(purposeQry) == 0 {
		q = q.Preload("Purposes")
	} else {
		c := strings.Join(purposeQry, " AND ")
		var conditions []interface{}
		conditions = append(conditions, c)
		conditions = append(conditions, values...)
		q = q.Where(c, values...).Preload("Purposes", conditions...)
	}
	if minArea > 0 {
		q = q.Where("places.area >= ?", minArea)
	}
	if maxArea > 0 {
		q = q.Where("places.area <= ?", maxArea)
	}
	if rooms > 0 {
		q = q.Where("places.bedrooms >= ?", rooms)
	}
	if floor > 0 {
		q = q.Where("places.floor >= ?", floor)
	}
	if strings.Trim(location, " ") != "" {
		q = q.Where("places.location = ?", location)
	}
	var places []place
	q.Find(&places)
	return places
}

func getPlaceByID(placeID int) place {
	var p place
	db.Preload("Purposes").Preload("Photos").First(&p, placeID)
	return p
}

func createPlace(p place) place {
	db.Create(&p)
	return p
}

func updatePlace(p place) place {
	tx := db.Begin()
	tx.Model(&p).Updates(
		place{
			Name:        p.Name,
			Description: p.Description,
			Type:        p.Type,
			Area:        p.Area,
			Floor:       p.Floor,
			Bedrooms:    p.Bedrooms,
			Bathrooms:   p.Bathrooms,
			Stratum:     p.Stratum,
			Parking:     p.Parking,
			Location:    p.Location,
			Latitude:    p.Latitude,
			Longitude:   p.Longitude,
		})
	if len(p.Purposes) > 0 {
		tx.Where("place_id = ?", p.ID).Delete(purpose{})
		for _, pr := range p.Purposes {
			pr.PlaceID = p.ID
			tx.Create(&pr)
		}
	}
	tx.Commit()
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
