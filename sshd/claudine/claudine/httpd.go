package claudine

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/rs/xid"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
)

func catHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Query("path")
		if path == "" {
			c.String(http.StatusBadRequest, "path cannot be empty")
			c.Abort()
			return
		}
		b, err := ioutil.ReadFile(path)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		c.String(http.StatusOK, string(b))
	}
}

func saveHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Query("path")
		if path == "" {
			c.String(http.StatusBadRequest, "path cannot be empty")
			c.Abort()
			return
		}
		if c.Request.Body == nil {
			c.String(http.StatusBadRequest, "Please send a request body")
			c.Abort()
			return
		}

		contents, _ := c.GetRawData()
		f, err := os.OpenFile(path, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0755)
		defer f.Close()
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		_, err = f.Write(contents)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		c.String(http.StatusOK, "ok")
	}
}

func clearHandler(historyServer *HistorySocketServer) gin.HandlerFunc {
	return func(c *gin.Context) {
		code := c.Query("code")
		if code == "" {
			c.String(404, "Not Found")
			return
		}

		i, err := strconv.ParseUint(code, 10, 8)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		historyServer.ClearBlock(uint8(i))
		c.String(http.StatusOK, "ok")
	}
}

func rulesGetHandler(settings *Settings) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, settings.GetRules())
	}
}

func rulesPostHandler(settings *Settings) gin.HandlerFunc {
	return func(c *gin.Context) {
		rules := Rules{}
		if err := c.ShouldBindJSON(&rules); err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
		settings.MergeRules(&rules)
		c.JSON(http.StatusOK, settings.GetRules())
	}
}

func rulesDeleteHandler(settings *Settings) gin.HandlerFunc {
	return func(c *gin.Context) {
		rules := Rules{}
		if err := c.ShouldBindJSON(&rules); err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
		settings.RemoveRules(&rules)
		c.JSON(http.StatusOK, settings.GetRules())
	}
}

func serveWebSocket(pool *WebSocketPool) gin.HandlerFunc {
	return func(c *gin.Context) {
		fmt.Println("WebSocket Endpoint Hit")
		conn, err := WebSocketUpgrade(c.Writer, c.Request)
		if err != nil {
			fmt.Fprintf(c.Writer, "%+v\n", err)
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
}

func SetupRoutes(pool *WebSocketPool, settings *Settings, historyServer *HistorySocketServer) *gin.Engine {

	router := gin.Default()

	router.GET("/", serveWebSocket(pool))
	router.GET("/cat", catHandler())
	router.GET("/clear", clearHandler(historyServer))
	router.POST("/save", saveHandler())

	router.GET("/rules", rulesGetHandler(settings))
	router.POST("/rules", rulesPostHandler(settings))
	router.DELETE("/rules", rulesDeleteHandler(settings))
	return router
}
