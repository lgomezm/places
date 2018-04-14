package main

import "errors"

type place struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

var placeList = []place{
	place{ID: 1, Name: "House 1", Description: "Nice house"},
	place{ID: 2, Name: "Apartment 1", Description: "Comfortable apt"},
	place{ID: 3, Name: "House 2", Description: "Big house"},
}

func getAllPlaces() []place {
	return placeList
}

func getPlaceByID(placeID int) (*place, error) {
	for _, p := range placeList {
		if p.ID == placeID {
			return &p, nil
		}
	}
	return nil, errors.New("Place not found")
}
