package claudine

import (
	"flag"
	"fmt"
	"github.com/hpcloud/tail"
	"github.com/rs/xid"
	"io/ioutil"
	"log"
	"net/http"
	"os"
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

var (
	addr         = flag.String("addr", ":6010", "http service address")
	tailfile     = flag.String("file", "/tmp/.histfile", "filepath")
	LOGGER_FLAGS = log.Ldate | log.Ltime | log.Lshortfile
	LOGGER       = log.New(os.Stderr, "", LOGGER_FLAGS)
)

type CLI struct {
	File string
}

func tf(pool *WebSocketPool, path string) {
	config := tail.Config{Follow: true, Logger: LOGGER}
	config.Location = &tail.SeekInfo{0, os.SEEK_END}

	t, err := tail.TailFile(path, config)

	if err != nil {
		log.Fatalf("Error Tail: %+v\n", err)
		return
	}

	for line := range t.Lines {
		message := WebSocketMessage{Type: "message", Payload: string(line.Text)}
		log.Printf("Broadcast Tail: %+v\n", message)
		pool.Broadcast <- message
	}

	log.Printf("Tail Exiting\n")
}

func serveWs(pool *WebSocketPool, w http.ResponseWriter, r *http.Request) {
	fmt.Println("WebSocket Endpoint Hit")
	conn, err := WebSocketUpgrade(w, r)
	if err != nil {
		fmt.Fprintf(w, "%+v\n", err)
		return
	}

	client := &WebSocketClient{
		ID:   xid.New().String(),
		Conn: conn,
		Pool: pool,
	}

	pool.Register <- client
	go client.KeepAlive()
	client.Read()
}

func cat(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Query().Get("path")
	if path == "" {
		http.NotFound(w, r)
		return
	}
	b, err := ioutil.ReadFile(path)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	str := string(b)
	fmt.Fprintf(w, str)
}

func setupRoutes() {
	pool := NewPool()
	go pool.Start()

	http.HandleFunc("/cat", cat)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		serveWs(pool, w, r)
	})
	go tf(pool, *tailfile)
}

func Run() {
	flag.Parse()
	log.SetFlags(LOGGER_FLAGS)
	log.Printf("Listening on %s", *addr)
	setupRoutes()
	log.Fatal(http.ListenAndServe(*addr, nil))
}
