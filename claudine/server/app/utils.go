package app

import (
	"fmt"
	"log"
)

func LogError(msg string, err error) {
	log.Printf("[ERROR] %s, %+v\n", msg, err)
}

func LogTrace(format string, args ...interface{}) {
	if *TRACE_ENABLED {
		fmt.Printf("[TRACE] "+format+"\n", args...)
	}
}

func IntsContain(s []int, e int) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

func StringsContains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}
