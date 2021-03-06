package main

import (
	"os"

	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

var router *gin.Engine
var db *gorm.DB

func main() {
	var err error
	db, err = gorm.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		panic("Failed to connect database")
	}
	defer db.Close()

	db.AutoMigrate(&user{})
	db.AutoMigrate(&owner{})
	db.AutoMigrate(&place{})
	db.AutoMigrate(&purpose{})
	db.AutoMigrate(&photo{})
	db.LogMode(true)

	router = gin.Default()
	router.Static("/static", "static")
	store := sessions.NewCookieStore([]byte("secret"))
	router.Use(sessions.Sessions("mysession", store))
	initializeRoutes()
	router.Run()
}
