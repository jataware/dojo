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
	Server   string
	Conn     *ws.Conn
	Pool     *WebSocketPool
	Ssh      *SSHD
	Settings *Settings
	ProxyWS  *WebSocketProxyClient
	mu       sync.Mutex
}

func NewWebSocketClient(conn *ws.Conn, pool *WebSocketPool, settings *Settings) *WebSocketClient {
	server := settings.Docker.Host
	ssh_server := fmt.Sprintf("%s:2224", settings.Docker.Host)
	user := settings.SSH.User
	pass := settings.SSH.Password
	id := xid.New().String()
	return &WebSocketClient{
		ID:       id,
		Conn:     conn,
		Pool:     pool,
		Settings: settings,
		Ssh:      NewSSHD(ssh_server, user, pass),
		ProxyWS:  NewWebSocketProxyClient(id, server),
	}
}

func (c *WebSocketClient) RouteClientMessages(message WebSocketMessage, replyClientChan chan WebSocketMessage) {

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
		replyClientChan <- WebSocketMessage{Channel: "pong", Payload: fmt.Sprintf("PONG %s", message.Payload)}

	case "ssh":
		switch message.Payload {
		case "connect":
			// attempt to connect the WS first
			if err := c.ProxyWS.Connect(); err != nil {
				LogError("Proxy Connect Failed", err)
				replyClientChan <- WebSocketMessage{Channel: "fatal", Payload: fmt.Sprintf("[ERROR] %+v", err)}
			} else {
				go c.ProxyWS.Start(replyClientChan)
				log.Printf("Proxy Connected")
			}
			log.Printf("Message SSH Connect: %+v\n", message)
			go c.Ssh.Start(replyClientChan)

		case "disconnect":
			c.ProxyWS.Stop()
			c.Ssh.Stop()
			log.Printf("Message SSH Disconnect: %+v\n", message)
			replyClientChan <- WebSocketMessage{Channel: "xterm", Payload: "\r\n** Disconnected **\r\n"}
		}
	}
}

func (c *WebSocketClient) Read() {

	doneChan := make(chan bool)
	replyClientChan := make(chan WebSocketMessage)
	defer func() {
		c.Ssh.Stop()
		c.ProxyWS.Stop()
		c.Pool.Unregister <- c
		c.Conn.Close()
		close(replyClientChan)
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
			case msg := <-replyClientChan:
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
		c.RouteClientMessages(message, replyClientChan)
	}
	<-doneChan
}

func (c *WebSocketClient) KeepAlive() {
	defer c.Conn.Close()
	ConnectionKeepAlive(c.ID, c.Conn)
}
