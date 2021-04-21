package app

import (
	"flag"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"log"
	"os"
)

var (
	addr          = flag.String("addr", ":3000", "http service address")
	LOAD_ENV      = flag.Bool("env", false, "load .env file")
	SETTINGS_FILE = flag.String("settings", "settings.yaml", "settings file")
	DEBUG_ENABLED = flag.Bool("debug", false, "enable debug")
	TRACE_ENABLED = flag.Bool("trace", false, "enable tracing")
	PULL_IMAGES   = flag.Bool("pull-images", true, "disable - pull docker images before launch")
	LOGGER_FLAGS  = log.Ldate | log.Ltime | log.Lshortfile
	LOGGER        = log.New(os.Stderr, "", LOGGER_FLAGS)
)

func setup() *gin.Engine {
	settings := NewSettings(*SETTINGS_FILE)
	log.Printf("Settings: %+v\n", settings)
	pool := NewPool()
	go pool.Start()

	engine := SetupRoutes(pool, settings)
	return engine
}

func Run() {
	flag.Parse()
	log.SetFlags(LOGGER_FLAGS)

	if *LOAD_ENV {
		err := godotenv.Load()
		if err != nil {
			log.Fatalf("Error loading .env file %+v", err)
		}
	}

	log.Printf("Listening on %s", *addr)
	router := setup()
	router.Run(*addr)
}
