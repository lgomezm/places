package main

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/golang/crypto/bcrypt"
)

func postUser(c *gin.Context) {
	var u user
	c.BindJSON(&u)
	d, err := bcrypt.GenerateFromPassword([]byte(u.Password), 14)
	if err == nil {
		u.PasswordDigest = string(d)
		u = createUser(u)
		if u.ID != 0 {
			c.JSON(http.StatusOK, u)
		} else {
			c.AbortWithStatus(http.StatusInternalServerError)
		}
	} else {
		c.AbortWithStatus(http.StatusInternalServerError)
	}
}

func login(c *gin.Context) {
	session := sessions.Default(c)
	var params map[string]string
	c.BindJSON(&params)
	if strings.Trim(params["username"], " ") == "" || strings.Trim(params["password"], " ") == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Parameters can't be empty"})
		return
	}
	u := auth(params["username"])
	if u.UserName != params["username"] {
		c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": "User does not exist"})
	}
	err := bcrypt.CompareHashAndPassword([]byte(u.PasswordDigest), []byte(params["password"]))
	if err == nil {
		session.Set("user", params["username"])
		err := session.Save()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate session token"})
		} else {
			c.JSON(http.StatusOK, gin.H{"message": "Successfully authenticated user"})
		}
	} else {
		fmt.Println("Passwords don't match", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication failed"})
	}
}

func isLoggedIn(c *gin.Context) {
	session := sessions.Default(c)
	user := session.Get("user")
	if user == nil {
		c.Status(http.StatusUnauthorized)
	} else {
		c.Status(http.StatusOK)
	}
}

func logout(c *gin.Context) {
	session := sessions.Default(c)
	if isUserLoggedIn(session) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session token"})
	} else {
		session.Delete("user")
		session.Save()
		c.JSON(http.StatusOK, gin.H{"message": "Successfully logged out"})
	}
}

func isUserLoggedIn(session sessions.Session) bool {
	user := session.Get("user")
	return user != nil
}
