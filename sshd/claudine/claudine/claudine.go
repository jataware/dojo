package claudine

import (
	"encoding/json"
	"flag"
	"fmt"
	"github.com/rs/xid"
	"io/ioutil"
	"log"
	"net/http"
	"os"
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

var (
	addr          = flag.String("addr", ":6010", "http service address")
	SETTINGS_FILE = flag.String("settings", "settings.yaml", "settings file")
	LOGGER_FLAGS  = log.Ldate | log.Ltime | log.Lshortfile
	LOGGER        = log.New(os.Stderr, "", LOGGER_FLAGS)
)

type CLI struct {
	File string
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

func save(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Query().Get("path")
	if path == "" {
		http.NotFound(w, r)
		return
	}

	if r.Body == nil {
		http.Error(w, "Please send a request body", 400)
		return
	}

	contents, _ := ioutil.ReadAll(r.Body)

	f, err := os.OpenFile(path, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0755)
	defer f.Close()

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = f.Write(contents)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "ok")
}

func pub(pool *WebSocketPool) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		message := WebSocketMessage{Type: "message", Payload: "test pub"}
		pool.Broadcast <- message
		fmt.Fprintf(w, "ok")
	}
}

func clear(historyServer *HistorySocketServer) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		code := r.URL.Query().Get("code")
		if code == "" {
			http.NotFound(w, r)
			return
		}

		i, err := strconv.ParseUint(code, 10, 8)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		historyServer.ClearBlock(uint8(i))
		fmt.Fprintf(w, "ok")
	}
}

func rules(settings *Settings) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case "GET":
			result, _ := json.Marshal(settings.GetRules())
			fmt.Fprintf(w, string(result))
			break
		case "DELETE":
			rules := Rules{}
			err := json.NewDecoder(r.Body).Decode(&rules)
			if err != nil {
				http.Error(w, "Failed to decode json to rule", 400)
				break
			}
			settings.RemoveRules(&rules)
			result, _ := json.Marshal(settings.GetRules())
			fmt.Fprintf(w, string(result))
			break
		case "POST":
			rules := Rules{}
			err := json.NewDecoder(r.Body).Decode(&rules)
			if err != nil {
				http.Error(w, "Failed to decode json to rule", 400)
				break
			}
			settings.MergeRules(&rules)
			result, _ := json.Marshal(settings.GetRules())
			fmt.Fprintf(w, string(result))
			break
		default:
			http.Error(w, "Method Not Allowed", 400)
		}
	}
}

func setup() {
	settings := NewSettings(*SETTINGS_FILE)
	pool := NewPool()
	go pool.Start()

	historyServer := NewHistorySocketServer(pool, settings)
	go historyServer.Listen()

	http.HandleFunc("/cat", cat)
	http.HandleFunc("/save", save)
	http.HandleFunc("/rules", rules(settings))
	http.HandleFunc("/clear", clear(historyServer))
	http.HandleFunc("/pub", pub(pool))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		serveWs(pool, w, r)
	})

}

func Run() {
	flag.Parse()
	log.SetFlags(LOGGER_FLAGS)
	log.Printf("Listening on %s", *addr)

	setup()
	log.Fatal(http.ListenAndServe(*addr, nil))
}
