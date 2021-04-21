package app

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
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

func launchContainer(settings *Settings, docker *Docker) gin.HandlerFunc {
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
		c.JSON(http.StatusOK, gin.H{"id": id})
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

func SetupRoutes(pool *WebSocketPool, settings *Settings) *gin.Engine {

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

	docker := router.Group("/docker")
	{
		docker.POST("/commit/:id", commitContainer(settings, d, pool))
		docker.GET("/changes/:id", changesContainer(d))
		docker.GET("/containers", listContainers(d))
		docker.POST("/exec/:id", execContainer(d))
		docker.GET("/inspect/:id", inspectContainer(d))
		docker.POST("/launch", launchContainer(settings, d))
		docker.DELETE("/stop/:id", stopContainer(d))
	}

	return router
}
