package app

import (
	"fmt"
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
)

type DockerSettings struct {
	Image string `yaml:"image"`
	Host  string
	Auth  string
}

func (d DockerSettings) String() string {

	l := 8
	if l >= len(d.Auth) {
		l = len(d.Auth)
	}
	return fmt.Sprintf("{Image:%s Host:%s Auth:%s...}", d.Image, d.Host, d.Auth[0:l])
}

type SSHSettings struct {
	User     string `yaml:"user"`
	Password string `yaml:"password"`
}

type Settings struct {
	Docker DockerSettings `yaml:"docker"`
	SSH    SSHSettings    `yaml:"ssh"`
}

func GetEnvFatal(key string) string {
	v := os.Getenv(key)

	if key == "" {
		log.Fatalf("Missing Env Configuration: %s", key)
	}
	return v
}

func NewSettings(fp string) *Settings {

	settings := Settings{}
	filename, _ := filepath.Abs(fp)
	yamlFile, err := ioutil.ReadFile(filename)
	if err != nil {
		log.Fatalf("error loading yaml: %v", err)
		return &settings
	}

	err = yaml.Unmarshal(yamlFile, &settings)
	if err != nil {
		log.Fatalf("error unmarshal yaml: %v", err)
		return &settings
	}

	settings.Docker.Auth = GetEnvFatal("DOCKERHUB_AUTH")
	settings.Docker.Host = GetEnvFatal("DOCKER_IP")

	return &settings
}
