package main

import (
	"claudine/server/cato"
	"fmt"
)

var (
	Version string
	Build   string
	Commit  string
)

func main() {
	cato.GlobalBuildInfo.Version = Version
	cato.GlobalBuildInfo.Commit = Commit
	cato.GlobalBuildInfo.Build = Build
	fmt.Printf("BuildInfo=%+v\n", cato.GlobalBuildInfo)
	cato.Run()
}
