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

func getPlacesBy(placeType string, thePurpose string,
	minArea float32, maxArea float32, minPrice int64,
	maxPrice int64, rooms uint, floor uint,
	location string) []place {
	q := db.Model(&place{}).Joins("JOIN purposes ON places.id = purposes.place_id")
	if strings.Trim(placeType, " ") != "" {
		q = q.Where("places.type = ?", placeType)
	}
	purposeQry := []string{}
	var values []interface{}
	if strings.Trim(thePurpose, " ") != "" {
		purposeQry = append(purposeQry, "purposes.purpose = ?")
		values = append(values, thePurpose)
	}
	if minPrice > 0 {
		purposeQry = append(purposeQry, "purposes.price >= ?")
		values = append(values, minPrice)
	}
	if maxPrice > 0 {
		purposeQry = append(purposeQry, "purposes.price <= ?")
		values = append(values, maxPrice)
	}
	if len(purposeQry) != 0 {
		c := strings.Join(purposeQry, " AND ")
		q = q.Where(c, values...)
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
	q.Select(`DISTINCT id, name, description, type, area, 
		floor, bedrooms, bathrooms, stratum, parking, 
		location, latitude, longitude`).Scan(&places)
	purposes := getPurposesOf(places, thePurpose, minPrice, maxPrice)
	m := make(map[uint][]purpose)
	for _, p := range purposes {
		m[p.PlaceID] = append(m[p.PlaceID], p)
	}
	for i := 0; i < len(places); i++ {
		places[i].Purposes = m[places[i].ID]
	}
	return places
}

func getPurposesOf(places []place, thePurpose string,
	minPrice int64, maxPrice int64) []purpose {
	q := db
	if strings.Trim(thePurpose, " ") != "" {
		q = q.Where("purpose = ?", thePurpose)
	}
	if minPrice > 0 {
		q = q.Where("price >= ?", minPrice)
	}
	if maxPrice > 0 {
		q = q.Where("price <= ?", maxPrice)
	}
	var ids []uint
	for _, p := range places {
		ids = append(ids, p.ID)
	}
	var purposes []purpose
	q.Where("place_id in (?)", ids).Find(&purposes)
	return purposes
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
