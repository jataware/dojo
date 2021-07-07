package cato

import (
	"context"
	"encoding/json"
	"fmt"
	ws "github.com/gorilla/websocket"
	"github.com/rs/xid"
	"log"
	"sync"
	"time"
)

type WebSocketClient struct {
	ID              string
	containerID     string
	DockerServer    string
	Conn            *ws.Conn
	Pool            *WebSocketPool
	Ssh             *SSHD
	Settings        *Settings
	ProxyWS         *WebSocketProxyClient
	clientReplyChan chan WebSocketMessage
	redisStore      *RedisStore
	mu              sync.Mutex
	ctx             context.Context
	cancel          context.CancelFunc
}

func NewWebSocketClient(conn *ws.Conn, pool *WebSocketPool, dockerServer string, settings *Settings, redisStore *RedisStore) *WebSocketClient {
	sshServer := fmt.Sprintf("%s:2224", dockerServer)
	user := settings.SSH.User
	pass := settings.SSH.Password
	id := xid.New().String()

	ctx, cancel := context.WithCancel(context.Background())
	client := WebSocketClient{
		ID:           id,
		Conn:         conn,
		Pool:         pool,
		DockerServer: dockerServer,
		Settings:     settings,
		redisStore:   redisStore,
		ctx:          ctx,
		cancel:       cancel,
	}

	client.Ssh = NewSSHD(ctx, sshServer, user, pass, client.RouteSSHMessages)
	client.ProxyWS = NewWebSocketProxyClient(ctx, id, dockerServer, client.RouteProxyMessages)
	return &client
}

func (c *WebSocketClient) RouteSSHMessages(message WebSocketMessage) {
	LogTrace("SSH Message: %+v", message)
	c.clientReplyChan <- message
}

func (c *WebSocketClient) RouteProxyMessages(message WebSocketMessage) {
	LogTrace("Proxy Message: %+v", message)
	c.clientReplyChan <- message
}

func (c *WebSocketClient) RouteClientMessages(message WebSocketMessage) {

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
		c.clientReplyChan <- WebSocketMessage{Channel: "pong", Payload: fmt.Sprintf("PONG %s", message.Payload)}

	case "ssh/connect":
		// message payload ignored

		// attempt to connect the WS first
		if err := c.ProxyWS.Connect(); err != nil {
			LogError("Proxy Connect Failed", err)
			c.clientReplyChan <- WebSocketMessage{Channel: "fatal", Payload: fmt.Sprintf("[ERROR] %+v", err)}
			return
		} else {
			go c.ProxyWS.Start()
			log.Printf("Proxy Connected")
		}
		log.Printf("Message SSH Connect: %+v\n", message)
		go c.Ssh.Start()
	case "ssh/disconnect":
		// message payload ignored

		c.ProxyWS.Stop()
		c.Ssh.Stop()
		log.Printf("Message SSH Disconnect: %+v\n", message)
		c.clientReplyChan <- WebSocketMessage{Channel: "xterm", Payload: "\r\n** Disconnected **\r\n"}

	}
}

func (c *WebSocketClient) InspectReplyMessage(message WebSocketMessage) {
	// This inspects the message right before being written to the client
	switch message.Channel {
	case "client/containerID":
		c.containerID = message.Payload
		log.Printf("Set Working Container %s\n", c.containerID)
	case "term/message":
		var history map[string]string
		if err := json.Unmarshal([]byte(message.Payload), &history); err != nil {
			LogError("Unmarshall error", err)
			return
		}
		if c.containerID != "" {
			store := NewContainerStore(c.redisStore, c.containerID)

			LogTrace("Appending Store History %s: %+v", c.containerID, history)
			store.AddHistory(history)
		}
	}
}

func (c *WebSocketClient) Stop() {
	log.Printf("Stopping WebSocketClient %s\n", c.ID)
	defer c.Conn.Close()
	c.cancel()
	c.Pool.Unregister <- c
	c.Ssh.Stop()
	c.containerID = ""
	log.Printf("WebSocketClient Stopped %s\n", c.ID)
}

func (c *WebSocketClient) Read() {
	c.clientReplyChan = make(chan WebSocketMessage)
	defer c.Stop()

	c.Conn.SetReadLimit(512)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	go func() {
		for {
			select {
			case msg := <-c.clientReplyChan:
				c.InspectReplyMessage(msg)
				c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
				if err := c.Conn.WriteJSON(msg); err != nil {
					if ws.IsUnexpectedCloseError(err, ws.CloseGoingAway, ws.CloseAbnormalClosure) {
						LogError("Reply Error", err)
					}
					return
				}
			case <-c.ctx.Done():
				return
			}
		}
		LogTrace("Client Reply Closed %s", c.ID)
	}()

	for {
		messageType, payload, err := c.Conn.ReadMessage()
		_ = messageType

		if err != nil {
			if ws.IsUnexpectedCloseError(err, ws.CloseGoingAway, ws.CloseAbnormalClosure) {
				LogError("Conn ReadMessage Error", err)
			}
			LogTrace("Client Reader Closed")
			break
		}

		LogTrace("Message Payload: %+v", string(payload))
		var message WebSocketMessage
		err = json.Unmarshal(payload, &message)
		if err != nil {
			LogError("Unmarshall error", err)
			break
		}

		LogTrace("Message Received: %+v", message)
		c.RouteClientMessages(message)

		select {

		case <-c.ctx.Done():
			LogTrace("Break IO Reader %s", c.ID)
			return
		default:
			break
		}
	}
	LogTrace("Exiting Reader %s", c.ID)
}

func (c *WebSocketClient) KeepAlive() {
	defer c.Stop()
	ConnectionKeepAlive(c.ctx, c.ID, c.Conn)
}
