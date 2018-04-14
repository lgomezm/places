package main

import (
	"os"

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
		panic("failed to connect database")
	}
	defer db.Close()

	db.AutoMigrate(&place{})

	router = gin.Default()
	initializeRoutes()
	router.Run()
}
