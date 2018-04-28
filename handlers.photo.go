package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/gin-gonic/gin"
	"github.com/satori/go.uuid"
	"gopkg.in/h2non/filetype.v1"
)

func createPlacePhoto(c *gin.Context) {
	placeID, err := strconv.Atoi(c.Param("place_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "The place id should be a number"})
		return
	}
	p := getPlaceByID(placeID)
	if p.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "The place does not exist"})
		return
	}
	f, err := getFileFromRequest(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Can't read the file"})
		return
	}
	s, err := session.NewSession(&aws.Config{Region: aws.String("us-east-2")})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Can't create S3 session"})
		return
	}
	n, err := uuid.NewV4()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Can't create file name"})
		return
	}
	u, err := uploadToS3(s, n.String(), f)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not upload file"})
		return
	}
	photo := createPhoto(photo{URL: u, PlaceID: p.ID})
	c.JSON(http.StatusOK, photo)
}

func getFileFromRequest(c *gin.Context) (io.Reader, error) {
	fileHeader, err := c.FormFile("file")
	if err == nil {
		if f, err := fileHeader.Open(); err == nil {
			return f, nil
		}
		return nil, err
	}
	return nil, err
}

func uploadToS3(s *session.Session, fileID string, r io.Reader) (string, error) {
	kind, err := filetype.MatchReader(r)
	if err != nil {
		return "", err
	}
	fmt.Printf("File type: %s. MIME: %s\n", kind.Extension, kind.MIME.Value)
	uploader := s3manager.NewUploader(s)
	o, err := uploader.Upload(&s3manager.UploadInput{
		ACL:                aws.String("public-read"),
		Bucket:             aws.String(os.Getenv("S3_BUCKET_NAME")),
		Key:                aws.String(fileID + "." + kind.Extension),
		Body:               r,
		ContentType:        aws.String(kind.MIME.Value),
		ContentDisposition: aws.String("inline"),
	})
	if err != nil {
		return "", err
	}
	return o.Location, nil
}
