package main

import (
	"claudine/embedded/app"
	"fmt"
)

var (
	Version string
	Build   string
	Commit  string
)

func main() {
	app.GlobalBuildInfo.Version = Version
	app.GlobalBuildInfo.Commit = Commit
	app.GlobalBuildInfo.Build = Build
	fmt.Printf("BuildInfo=%+v\n", app.GlobalBuildInfo)

	app.Run()
}
