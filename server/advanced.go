package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}
var serverHost = "localhost"
var serverPort = "8086"
var storage = "./tmp"

func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}

func main() {

	if err := os.MkdirAll(storage+"/files/", 0755); err != nil {
		// log.Println(err)
	}
	if err := os.MkdirAll(storage+"/links/", 0755); err != nil {
		// log.Println(err)
	}
	r := gin.Default()
	r.GET("/ws", uploadChunks)
	r.Run(":" + serverPort)
}
func uploadChunks(c *gin.Context) {
	var err error
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("error", err)
		return
	}
	// log.Println("connection", c.ClientIP)
	filename, linkname := "", ""
	var f *os.File
	go func(conn *websocket.Conn) {
		for {
			mt, data, connErr := conn.ReadMessage()
			if connErr != nil {
				log.Println("error", connErr)
				return
			}
			if mt == 1 {
				event := strings.Split(string(data), ":")
				if event[0] == "upload" {
					filename = storage + "/files/" + event[1]
					if fileExists(filename) {
						log.Println(filename + " already exists")
						if err := conn.WriteMessage(1, []byte("exists")); err != nil {
							log.Println("error sending exists message")
						}
					} else {
						f, err = os.Create(filename)
						if err != nil {
							log.Println(err)
						}
					}
					linkname = storage + "/links/" + event[2]
					err = os.Symlink(filename, linkname)
					if err != nil {
						log.Println(err)
					}
				}
				log.Println(string(event[0]), filename)
				if event[0] == "ready" {
					f.Close()
					if mt := mimeType(filename); mt != "" {
						log.Println(filename, mt)
					} else {
						log.Println(filename, "unknown file type")
					}
					if err := conn.WriteMessage(1, []byte("ready")); err != nil {
						log.Println("error sending ready message")
					}
					filename = ""
				}
			}
			if mt == 2 {
				log.Println("chunk", filename)
				f.Write(data)
			}
		}
	}(conn)
}

func mimeType(filename string) string {
	if f, err := os.Open(filename); err == nil {
		buffer := make([]byte, 512)
		if _, err := f.Read(buffer); err == nil {
			return http.DetectContentType(buffer)
		}
	}
	return ""
}
