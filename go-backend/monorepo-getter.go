package main

import (
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

func findGnoPackages(root string) (map[string][]string, error) {
	packages := make(map[string][]string)

	err := filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() && strings.HasPrefix(d.Name(), ".") {
			return filepath.SkipDir
		}

		if !d.IsDir() {
			return nil
		}

		files, err := os.ReadDir(path)
		if err != nil {
			return err
		}

		var hasGnoFiles bool
		for _, file := range files {
			if strings.HasSuffix(file.Name(), ".gno") {
				hasGnoFiles = true
				break
			}
		}

		if hasGnoFiles {
			imports, err := extractImports(path)
			if err != nil {
				return err
			}

			relPath := strings.TrimPrefix(path, root)
			packages[relPath] = imports
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return packages, nil
}

func extractImports(dir string) ([]string, error) {
	imports := make(map[string]struct{})

	files, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".gno") {
			filePath := filepath.Join(dir, file.Name())
			content, err := os.ReadFile(filePath)
			if err != nil {
				return nil, err
			}

			for _, imp := range parseImports(string(content)) {
				imports[imp] = struct{}{}
			}
		}
	}

	var uniqueImports []string
	for imp := range imports {
		uniqueImports = append(uniqueImports, imp)
	}

	return uniqueImports, nil
}

func parseImports(content string) []string {
	var imports []string
	lines := strings.Split(content, "\n")
	var inImportBlock bool

	for _, line := range lines {
		line = strings.TrimSpace(line)

		if strings.HasPrefix(line, "import (") {
			inImportBlock = true
			continue
		}

		if inImportBlock {
			if line == ")" {
				inImportBlock = false
				continue
			}
			importPath := strings.Trim(line, `"`)
			if importPath != "" {
				parts := strings.Split(importPath, " ")
				imports = append(imports, strings.Trim(parts[len(parts)-1], `"`))
			}
			continue
		}

		if strings.HasPrefix(line, "import ") {
			importPath := strings.Trim(line[len("import "):], `"`)
			parts := strings.Split(importPath, " ")
			imports = append(imports, strings.Trim(parts[len(parts)-1], `"`))
		}
	}
	return imports
}
