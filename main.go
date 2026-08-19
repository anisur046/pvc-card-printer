package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"pvc-card-printer/handlers"
)

// enableCORS middleware for cross-origin development
func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func main() {
	port := "8080"
	if envPort := os.Getenv("PORT"); envPort != "" {
		port = envPort
	}

	templateStore := handlers.NewTemplateStore()

	// API Routes
	http.HandleFunc("/api/health", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "online",
			"service": "PVC Card Printer Backend API",
			"version": "1.0.0",
		})
	}))

	http.HandleFunc("/api/templates", enableCORS(templateStore.ListTemplates))
	http.HandleFunc("/api/template", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			templateStore.GetTemplate(w, r)
		} else if r.Method == http.MethodPost {
			templateStore.SaveTemplate(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	http.HandleFunc("/api/batch/csv", enableCORS(handlers.ProcessCSV))
	http.HandleFunc("/api/batch/sample.csv", enableCORS(handlers.SampleCSV))

	// Static Frontend Server (serves frontend/dist if present)
	distPath := filepath.Join(".", "frontend", "dist")
	if _, err := os.Stat(distPath); err == nil {
		fs := http.FileServer(http.Dir(distPath))
		http.Handle("/", fs)
		log.Printf("Serving production frontend build from %s\n", distPath)
	} else {
		http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path != "/" {
				http.NotFound(w, r)
				return
			}
			w.Header().Set("Content-Type", "text/html")
			fmt.Fprintf(w, `
				<!DOCTYPE html>
				<html>
				<head><title>PVC Card Printer API</title></head>
				<body style="font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; text-align: center;">
					<h1>🎴 PVC Card Printer Backend API</h1>
					<p style="color: #38bdf8;">Server running on <strong>http://localhost:%s</strong></p>
					<p>Run Vite frontend with <code>npm run dev</code> inside <code>/frontend</code> or build production assets.</p>
				</body>
				</html>
			`, port)
		})
	}

	log.Printf("🚀 PVC Card Printer Go server running at http://localhost:%s\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
