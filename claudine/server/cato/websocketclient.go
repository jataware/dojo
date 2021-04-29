package cato

import (
	"encoding/json"
	"fmt"
	ws "github.com/gorilla/websocket"
	"github.com/rs/xid"
	"log"
	"sync"
	"time"
)

type WebSocketClient struct {
	ID       string
	Conn     *ws.Conn
	Pool     *WebSocketPool
	Ssh      *SSHD
	Settings *Settings
	mu       sync.Mutex
}

func NewWebSocketClient(conn *ws.Conn, pool *WebSocketPool, settings *Settings) *WebSocketClient {
	server := fmt.Sprintf("%s:2224", settings.Docker.Host)
	user := settings.SSH.User
	pass := settings.SSH.Password

	return &WebSocketClient{
		ID:       xid.New().String(),
		Conn:     conn,
		Pool:     pool,
		Settings: settings,
		Ssh:      NewSSHD(server, user, pass),
	}
}

func (c *WebSocketClient) Route(message WebSocketMessage, replyChan chan WebSocketMessage) {

	switch message.Channel {
	case "xterm":
		if c.Ssh.Open {
			c.Ssh.In <- message
			LogTrace("Message Published: %+v", message)
		} else {
			LogTrace("Message Dropped: %+v", message)
		}
	case "terminal/resize":
		// Resize only works before SSH connections
		var term Terminal
		if err := json.Unmarshal([]byte(message.Payload), &term); err != nil {
			LogError("Unmarshall error", err)
			return
		}
		LogTrace("Resize Terminal: %+v", term)
		c.Ssh.Terminal = &term
	case "ping":
		// testing channel
		replyChan <- WebSocketMessage{Channel: "pong", Payload: fmt.Sprintf("PONG %s", message.Payload)}
	case "ssh":
		switch message.Payload {
		case "connect":
			log.Printf("Message SSH Connect: %+v\n", message)
			go c.Ssh.Start(replyChan)
		case "disconnect":
			log.Printf("Message SSH Disconnect: %+v\n", message)
			c.Ssh.Stop()
			replyChan <- WebSocketMessage{Channel: "xterm", Payload: "\r\n** Disconnected **\r\n"}
		}
	}
}

func (c *WebSocketClient) Read() {

	doneChan := make(chan bool)
	replyChan := make(chan WebSocketMessage)
	defer func() {
		c.Ssh.Stop()
		c.Pool.Unregister <- c
		c.Conn.Close()
		close(replyChan)
	}()

	c.Conn.SetReadLimit(512)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	go func() {
		for {
			select {
			case msg := <-replyChan:
				c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
				if err := c.Conn.WriteJSON(msg); err != nil {
					if ws.IsUnexpectedCloseError(err, ws.CloseGoingAway, ws.CloseAbnormalClosure) {
						LogError("Reply Error", err)
					}
					return
				}
			case <-doneChan:
				return
			}
		}
	}()

	for {
		_, payload, err := c.Conn.ReadMessage()

		if err != nil {
			if ws.IsUnexpectedCloseError(err, ws.CloseGoingAway, ws.CloseAbnormalClosure) {
				LogError("Conn ReadMessage Error", err)
			}
			return
		}

		LogTrace("Message Payload: %+v", string(payload))
		var message WebSocketMessage
		err = json.Unmarshal(payload, &message)
		if err != nil {
			LogError("Unmarshall error", err)
			return
		}

		LogTrace("Message Received: %+v", message)
		c.Route(message, replyChan)
	}
	<-doneChan
}

func (c *WebSocketClient) KeepAlive() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()
	for {
		select {
		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			log.Printf("Send Keep Alive Id: %s\n", c.ID)
			if err := c.Conn.WriteMessage(ws.PingMessage, nil); err != nil {
				if ws.IsUnexpectedCloseError(err, ws.CloseGoingAway, ws.CloseAbnormalClosure) {
					LogError("Unexpected Error Keep Alive:", err)
				} else {
					log.Printf("Keep Alive Client gone - Id: %s\n", c.ID)
				}
				return
			}
		}
	}
}
