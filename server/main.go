package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"path"

	"crypto/rand"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upGrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}
var outputPath = "./storage"

func generateUUID() string {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		log.Fatal(err)
	}
	filename := fmt.Sprintf("%x", b)
	return filename
}
func upload(c *gin.Context) {
	ws, err := upGrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	_, frame, err := ws.ReadMessage()

	err = ioutil.WriteFile(path.Join(outputPath, generateUUID()+".webm"), frame, 0644)
	if err != nil {
		fmt.Sprintf("Error writing video frame: ", err)
		// return wssResponse{
		// 	Status:  false,
		// 	Message: fmt.Sprintf("Error writing video frame: ", err),
		// }

		defer ws.Close()

	}
}
func main() {
	address := ":8558"
	// if os.Getenv("port") != "" {
	// 	address = ":" + os.Getenv("port")
	// }
	// gin.SetMode(gin.ReleaseMode)
	r := gin.Default()
	r.GET("/upload", upload)
	// r.Static("/assets", "./assets")
	r.Run(address)
}
