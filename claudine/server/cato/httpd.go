package cato

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"
)

func root() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	}
}

func listContainers(docker *Docker) gin.HandlerFunc {
	return func(c *gin.Context) {
		containers, err := docker.ListContainers()
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
		c.JSON(http.StatusOK, containers)
	}
}

func inspectContainer(docker *Docker) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		container, err := docker.InspectContainer(id)
		if err != nil {
			c.String(http.StatusInternalServerError, fmt.Sprintf("%+v", err))
			return
		}
		c.JSON(http.StatusOK, container)
	}
}

type LaunchCmd struct {
	Name string `json:"name" binding:"required"`
}

func launchContainer(settings *Settings, docker *Docker, store *MemStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		var cmd LaunchCmd
		if err := c.BindJSON(&cmd); err != nil {
			c.String(http.StatusBadRequest, fmt.Sprintf("%+v", err))
			return
		}

		id, err := docker.Launch(settings.Docker.Image, cmd.Name)
		if err != nil {
			c.String(http.StatusInternalServerError, fmt.Sprintf("%+v", err))
			return
		}

		container := store.Add(id)
		container.Name = cmd.Name
		container.Image = settings.Docker.Image
		container.Launched = time.Now().Format(time.RFC3339)

		c.JSON(http.StatusOK, container)
	}
}

type ExecCmd struct {
	Cmd []string `json:"cmd" binding:"required"`
}

func execContainer(docker *Docker) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var cmd ExecCmd
		if err := c.BindJSON(&cmd); err != nil {
			c.String(http.StatusBadRequest, fmt.Sprintf("%+v", err))
			return
		}

		err := docker.Exec(id, cmd.Cmd)
		if err != nil {
			c.String(http.StatusInternalServerError, fmt.Sprintf("%+v", err))
			return
		}
		c.String(http.StatusOK, "ok")
	}
}

func stopContainer(docker *Docker) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		err := docker.Stop(id)
		if err != nil {
			c.String(http.StatusInternalServerError, fmt.Sprintf("%+v", err))
			return
		}
		c.String(http.StatusOK, "ok")
	}
}

func changesContainer(docker *Docker) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		changes, err := docker.Changes(id)
		if err != nil {
			c.String(http.StatusInternalServerError, fmt.Sprintf("%+v", err))
			return
		}
		c.JSON(http.StatusOK, changes)
	}
}

func diffGetContainer(docker *Docker) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		changes, err := docker.Changes(id)
		if err != nil {
			c.String(http.StatusInternalServerError, fmt.Sprintf("%+v", err))
			return
		}
		c.JSON(http.StatusOK, changes)
	}
}

type CommitDocker struct {
	Name       string   `json:"name" binding:"required"`
	Cwd        string   `json:"cwd" binding:"required"`
	Entrypoint []string `json:"entrypoint" binding:"required"`
	Listeners  []string `json:"listeners" binding:"required"`
}

func commitContainer(settings *Settings, docker *Docker, pool *WebSocketPool) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var commit CommitDocker
		if err := c.BindJSON(&commit); err != nil {
			c.String(http.StatusBadRequest, fmt.Sprintf("%+v", err))
			return
		}
		if err := docker.Commit(settings.Docker.Auth, id, commit.Name, commit.Cwd, commit.Entrypoint, pool, commit.Listeners); err != nil {
			c.String(http.StatusInternalServerError, fmt.Sprintf("%+v", err))
			return
		}
		c.String(http.StatusOK, "ok")
	}
}

type CheckStatusCmd struct {
	Url string `json:"url" binding:"required"`
}

func checkStatus() gin.HandlerFunc {
	return func(c *gin.Context) {
		var cmd CheckStatusCmd
		if err := c.BindJSON(&cmd); err != nil {
			c.String(http.StatusBadRequest, fmt.Sprintf("%+v", err))
			return
		}
		resp, err := http.Get(cmd.Url)
		if err != nil {
			c.String(http.StatusInternalServerError, fmt.Sprintf("%+v", err))
			return
		}
		c.Status(resp.StatusCode)
	}
}

func proxy(settings *Settings, docker *Docker) gin.HandlerFunc {
	//TODO determine the IP of the container that client is trying to proxy too
	//for now it will just be the IP of the docker api
	server := fmt.Sprintf("http://%s:6010", settings.Docker.Host)
	remote, err := url.Parse(server)
	if err != nil {
		log.Fatal(err)
	}

	return func(c *gin.Context) {
		proxy := httputil.NewSingleHostReverseProxy(remote)

		proxy.Director = func(req *http.Request) {
			req.Header = c.Request.Header
			req.Host = remote.Host
			req.URL.Scheme = remote.Scheme
			req.URL.Host = remote.Host
			req.URL.Path = c.Param("proxyPath")
		}

		log.Printf("Proxying %s => %s\n", c.Param("proxyPath"), server)
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

func storeDump(store *MemStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(200, store.Dump())
	}
}

func storeGetKeys(store *MemStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(200, gin.H{"keys": store.Keys()})
	}
}

func storePutKeyVal(store *MemStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var json map[string]interface{}
		if err := c.BindJSON(&json); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if s, found := store.Get(id); found {
			s.AppendMeta(json)
		} else {
			c.String(http.StatusNotFound, fmt.Sprintf("key not found: %s", id))
		}
		v, _ := store.Get(id)
		c.JSON(http.StatusOK, v)
	}
}

func storeDeleteKey(store *MemStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		store.Delete(id)
		c.String(http.StatusOK, id)
	}
}

func storeGetKey(store *MemStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		if val, found := store.Get(id); found {
			c.JSON(200, val)
			return
		}
		c.String(http.StatusNotFound, fmt.Sprintf("key not found: %s", id))
	}
}

func listHistory(store *MemStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		if s, found := store.Get(id); found {
			c.JSON(200, s.History)
			return
		}
		c.String(http.StatusNotFound, fmt.Sprintf("key not found: %s", id))
	}
}

func listEdits(store *MemStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		if s, found := store.Get(id); found {
			c.JSON(200, s.Edits)
			return
		}
		c.String(http.StatusNotFound, fmt.Sprintf("key not found: %s", id))
	}
}

func appendHistory(store *MemStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var json []string
		if err := c.BindJSON(&json); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if s, found := store.Get(id); found {
			s.AddHistory(json)
			c.JSON(200, s.History)
			return
		}
		c.String(http.StatusNotFound, fmt.Sprintf("key not found: %s", id))
	}
}

func appendEdits(store *MemStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var json []string
		if err := c.BindJSON(&json); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if s, found := store.Get(id); found {
			s.AddEdits(json)
			c.JSON(200, s.Edits)
			return
		}
		c.String(http.StatusNotFound, fmt.Sprintf("key not found: %s", id))
	}
}

func SetupRoutes(pool *WebSocketPool, settings *Settings, memstore *MemStore) *gin.Engine {

	router := gin.Default()
	router.GET("/", root())

	if *DEBUG_ENABLED {
		router.StaticFile("/term", "index.html")
	}

	router.POST("/cors/test", checkStatus())

	router.GET("/ws", ServeWebSocket(settings, pool))

	d, err := NewDocker(settings)
	if err != nil {
		log.Fatal(err)
	}

	store := router.Group("/store")
	{
		store.GET("/dump", storeDump(memstore))
		store.GET("/keys", storeGetKeys(memstore))
		store.GET("/key/:id", storeGetKey(memstore))
		store.PUT("/key/:id", storePutKeyVal(memstore))
		store.DELETE("/key/:id", storeDeleteKey(memstore))
	}

	containerStore := router.Group("/container/store/:id")
	{
		containerStore.GET("/history", listHistory(memstore))
		containerStore.PUT("/history", appendHistory(memstore))
		containerStore.GET("/edits", listEdits(memstore))
		containerStore.PUT("/edits", appendEdits(memstore))
		//containerStore.GET("/provisions", listHistory(memstore))
		//containerStore.GET("/provisions", listHistory(memstore))
	}

	container := router.Group("/container/ops")
	{
		//proxy to containers api
		container.Any("/*proxyPath", proxy(settings, d))
	}

	docker := router.Group("/docker")
	{
		docker.POST("/commit/:id", commitContainer(settings, d, pool))
		docker.GET("/changes/:id", changesContainer(d))
		//docker.PUT("/diff/changes/:id", diffSetContainer(d))
		docker.GET("/diff/changes/:id", diffGetContainer(d))
		docker.GET("/containers", listContainers(d))
		docker.POST("/exec/:id", execContainer(d))
		docker.GET("/inspect/:id", inspectContainer(d))
		docker.POST("/launch", launchContainer(settings, d, memstore))
		docker.DELETE("/stop/:id", stopContainer(d))
	}

	return router
}
