package main

import "github.com/jinzhu/gorm"

type user struct {
	gorm.Model
	Name           string `json:"name"`
	UserName       string `json:"username"`
	Password       string `gorm:"-" json:"password"`
	PasswordDigest string `json:"-"`
}

func createUser(u user) user {
	db.Create(&u)
	return u
}

func auth(username string) user {
	var u user
	db.Where(&user{UserName: username}).First(&u)
	return u
}
