package main

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func listOwners(c *gin.Context) {
	dniType := c.Query("dni_type")
	dni := c.Query("dni")
	firstName := c.Query("firstname")
	lastName := c.Query("lastname")
	email := c.Query("email")
	limit, err := strconv.ParseUint(c.Query("limit"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Param 'limit' should be a positive number"})
		return
	}
	start, err := strconv.ParseUint(c.Query("start"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Param 'start' should be a positive number"})
		return
	}
	owners := getOwners(dniType, dni, firstName, lastName, email, uint(start), uint(limit))
	c.JSON(http.StatusOK, owners)
}

func getOwner(c *gin.Context) {
	if ownerID, err := strconv.Atoi(c.Param("owner_id")); err == nil {
		owner := getOwnerByID(ownerID)
		if owner.ID > 0 {
			c.JSON(http.StatusOK, owner)
		} else {
			c.JSON(http.StatusNotFound, gin.H{"error": "Owner does not exist"})
		}
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Owner id should be a number"})
	}
}

func postOwner(c *gin.Context) {
	var o owner
	c.BindJSON(&o)
	o, err := createOwner(o)
	if err == nil {
		c.JSON(http.StatusCreated, o)
	} else {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
	}
}

func putOwner(c *gin.Context) {
	if ownerID, err := strconv.Atoi(c.Param("owner_id")); err == nil {
		var o owner
		c.BindJSON(&o)
		if o.ID == uint(ownerID) {
			o = updateOwner(o)
			c.JSON(http.StatusOK, o)
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Path id and owner id must match"})
		}
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Owner id should be a number"})
	}
}

func deleteOwner(c *gin.Context) {
	if ownerID, err := strconv.Atoi(c.Param("owner_id")); err == nil {
		deleted := softDeleteOwner(ownerID)
		if deleted {
			c.String(http.StatusNoContent, "")
		} else {
			c.JSON(http.StatusNotFound, gin.H{"error": "Can't find owner"})
		}
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Owner id should be a number"})
	}
}
