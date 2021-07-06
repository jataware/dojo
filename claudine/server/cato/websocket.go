package cato

import (
	"context"
	"fmt"
	"github.com/gin-gonic/gin"
	ws "github.com/gorilla/websocket"
	"log"
	"net/http"
	"strconv"
	"time"
)

const (
	// Time allowed to write the file to the client.
	writeWait = 15 * time.Second

	// Time allowed to read the next pong message from the client.
	pongWait = 60 * time.Second

	// Send pings to client with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10
)

type WebSocketMessage struct {
	Channel string `json:"channel"`
	Payload string `json:"payload"`
}

type DirectMessage struct {
	Message WebSocketMessage `json:"message"`
	Clients []string         `json:"clients"`
}

var webSocketUpgrader = ws.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func WebSocketUpgrade(w http.ResponseWriter, r *http.Request) (*ws.Conn, error) {
	webSocketUpgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}
	conn, err := webSocketUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return conn, nil
}

func ServeWebSocket(settings *Settings, pool *WebSocketPool, clouseauWorkerPool *ClouseauWorkerPool, redisStore *RedisStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		idx := c.Param("idx")
		i, err := strconv.Atoi(idx)

		if err != nil {
			c.String(http.StatusInternalServerError, fmt.Sprintf("%+v", err))
			return
		}
		dockerServer := clouseauWorkerPool.Workers[i].Docker.Host

		log.Printf("WebSocket Upgrade\n")
		conn, err := WebSocketUpgrade(c.Writer, c.Request)
		if err != nil {
			fmt.Fprintf(c.Writer, "%+v\n", err)
			return
		}

		client := NewWebSocketClient(conn, pool, dockerServer, settings, redisStore)

		pool.Register <- client
		pool.Direct <- DirectMessage{
			Clients: []string{client.ID},
			Message: WebSocketMessage{Channel: "id", Payload: client.ID}}
		go client.KeepAlive()
		go client.Read()
	}
}

func ConnectionKeepAlive(ctx context.Context, id string, conn *ws.Conn) {
	ticker := time.NewTicker(pingPeriod)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			conn.SetWriteDeadline(time.Now().Add(writeWait))
			log.Printf("Send Keep Alive Id: %s\n", id)
			if err := conn.WriteMessage(ws.PingMessage, nil); err != nil {
				if ws.IsUnexpectedCloseError(err, ws.CloseGoingAway, ws.CloseAbnormalClosure) {
					LogError("Unexpected Error Keep Alive:", err)
				} else {
					log.Printf("Keep Alive Client gone - Id: %s\n", id)
				}
				return
			}
		case <-ctx.Done():
			log.Printf("Keep Alive Client cancelled - Id: %s\n", id)
			return
		}
	}
}
