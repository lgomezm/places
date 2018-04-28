package main

import (
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/gin-gonic/gin"
)

func uploadPhoto(c *gin.Context) {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, fmt.Sprintf("get form err: %s", err.Error()))
		return
	}
	f, err := fileHeader.Open()
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, fmt.Sprintf("get form err: %s", err.Error()))
		return
	}
	s, err := session.NewSession(&aws.Config{Region: aws.String("us-east-2")})
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, fmt.Sprintf("get form err: %s", err.Error()))
		return
	}
	err = uploadToS3(s, fileHeader.Filename, f)
	if err != nil {
		c.String(http.StatusOK, err.Error())
	} else {
		c.String(http.StatusOK, "All good!")
	}
}

func uploadToS3(s *session.Session, fileDir string, r io.Reader) error {
	uploader := s3manager.NewUploader(s)
	_, err := uploader.Upload(&s3manager.UploadInput{
		ACL:    aws.String("public-read"),
		Bucket: aws.String(os.Getenv("S3_BUCKET_NAME")),
		Key:    aws.String(fileDir),
		Body:   r,
	})
	return err
}
