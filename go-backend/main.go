package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	rootDir := "../gno/examples/gno.land/"
	packages, err := findGnoPackages(rootDir)
	if err != nil {
		fmt.Printf("Error finding Gno packages: %v\n", err)
		return
	}

	output := make(map[string]map[string]interface{})
	for pkg, imports := range packages {
		output[pkg] = map[string]interface{}{
			"imports": imports,
			"creator": "monorepo",
		}
	}

	SetPackagesData(output)

	http.HandleFunc("/getAllPackages", GetAllPackages)
	fmt.Println("Starting server on :8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
