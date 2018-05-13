package main

import (
	"errors"
	"strings"

	"github.com/jinzhu/gorm"
)

type owner struct {
	gorm.Model
	DniType      string `json:"dni_type" gorm:"unique_index:idx_dni_dni_type"`
	Dni          string `json:"dni" gorm:"unique_index:idx_dni_dni_type"`
	FirstName    string `json:"firstname"`
	LastName     string `json:"lastname"`
	ContactPhone string `json:"phone"`
	Email        string `json:"email"`
	Bank         string `json:"bank"`
	Account      string `json:"account"`
	AccountType  string `json:"account_type"`
}

func createOwner(o owner) (owner, error) {
	if err := db.Create(&o).Error; err != nil {
		return o, errors.New("Could not create owner")
	}
	return o, nil
}

func updateOwner(o owner) owner {
	db.Model(&o).Updates(
		owner{
			FirstName:    o.FirstName,
			LastName:     o.LastName,
			ContactPhone: o.ContactPhone,
			Email:        o.Email,
			Bank:         o.Bank,
			Account:      o.Account,
			AccountType:  o.AccountType,
		})
	return o
}

func softDeleteOwner(ownerID int) bool {
	var o owner
	if db.First(&o, ownerID).RecordNotFound() {
		return false
	}
	db.Delete(&o)
	return true
}

func getOwnerByID(ownerID int) owner {
	var o owner
	db.First(&o, ownerID)
	return o
}

func getOwners(dniType string, dni string, firstName string, lastName string, email string, start uint, limit uint) []owner {
	q := db
	if strings.Trim(dniType, " ") != "" {
		q = q.Where("dni_type = ?", dniType)
	}
	if strings.Trim(dni, " ") != "" {
		q = q.Where("dni = ?", dni)
	}
	if strings.Trim(firstName, " ") != "" {
		q = q.Where("first_name LIKE ?", firstName+"%")
	}
	if strings.Trim(lastName, " ") != "" {
		q = q.Where("last_name LIKE ?", lastName+"%")
	}
	if strings.Trim(email, " ") != "" {
		q = q.Where("email = ?", email)
	}
	var owners []owner
	q.Offset(start).Limit(limit).Find(&owners)
	return owners
}
