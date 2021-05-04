package cato

import (
	"encoding/json"
	"fmt"
	ws "github.com/gorilla/websocket"
	"log"
	"net/url"
	"time"
)

type WebSocketProxyClient struct {
	ID    string
	Url   url.URL
	Conn  *ws.Conn
	In    chan WebSocketMessage
	Out   chan WebSocketMessage
	Close chan bool
	Open  bool
}

func NewWebSocketProxyClient(parentID string, server string) *WebSocketProxyClient {
	addr := fmt.Sprintf("%s:6010", server)
	u := url.URL{Scheme: "ws", Host: addr, Path: "/websocket"}
	return &WebSocketProxyClient{
		ID:    fmt.Sprintf("proxy-%s", parentID),
		Url:   u,
		Conn:  nil,
		In:    make(chan WebSocketMessage),
		Out:   make(chan WebSocketMessage),
		Open:  false,
		Close: make(chan bool),
	}
}

func (c *WebSocketProxyClient) KeepAlive() {
	defer c.Conn.Close()
	ConnectionKeepAlive(c.ID, c.Conn)
}

func (c *WebSocketProxyClient) Stop() {
	if c.Open {
		c.Close <- true
	}
	c.Open = false
	log.Printf("Proxy WebSocket Stopped %s", c.ID)
}

func (c *WebSocketProxyClient) Start(replyClientChan chan WebSocketMessage) {
	if c.Open {
		log.Printf("Proxy already Running\n")
		return
	}
	defer func() {
		log.Printf("Proxy defer Stopped %s ", c.Url)
		c.Stop()
	}()
	c.Open = true
	go c.KeepAlive()
	c.Read(replyClientChan)
}

func (c *WebSocketProxyClient) Connect() error {
	if c.Open {
		log.Printf("Proxy already Connected\n")
		return nil
	}

	conn, _, err := ws.DefaultDialer.Dial(c.Url.String(), nil)
	if err != nil {
		LogError("Failed to connect to WebSocket", err)
		return err
	}
	c.Conn = conn
	return nil
}

func (c *WebSocketProxyClient) RouteProxyMessages(message WebSocketMessage, replyClientChan chan<- WebSocketMessage) {
	LogTrace("Proxy Message: %+v", message)
	replyClientChan <- message
}

func (c *WebSocketProxyClient) Read(replyClientChan chan<- WebSocketMessage) {
	defer c.Conn.Close()
	c.Conn.SetReadLimit(512)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	go func() {
		for {
			_, payload, err := c.Conn.ReadMessage()

			if err != nil {
				if ws.IsUnexpectedCloseError(err, ws.CloseGoingAway, ws.CloseAbnormalClosure) {
					LogError("Proxy Conn ReadMessage Error", err)
				}
				return
			}

			LogTrace("Proxy Message Payload: %+v", string(payload))
			var message WebSocketMessage
			err = json.Unmarshal(payload, &message)
			if err != nil {
				LogError("Unmarshall error", err)
				return
			}

			LogTrace("Proxy Message Received: %+v", message)
			c.RouteProxyMessages(message, replyClientChan)
		}
	}()

	for {
		select {
		case msg := <-c.In:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteJSON(msg); err != nil {
				if ws.IsUnexpectedCloseError(err, ws.CloseGoingAway, ws.CloseAbnormalClosure) {
					LogError("Reply Error", err)
				}
				return
			}
		case <-c.Close:
			err := c.Conn.WriteMessage(ws.CloseMessage, ws.FormatCloseMessage(ws.CloseNormalClosure, ""))
			if err != nil {
				LogError("Proxy Write close:", err)
				return
			}
			c.Conn.Close()
			log.Printf("Normal Closing Proxy\n")
			return
		}
	}

	LogTrace("Stop Reading")
}
