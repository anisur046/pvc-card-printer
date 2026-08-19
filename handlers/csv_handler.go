package handlers

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"pvc-card-printer/models"
)

// ProcessCSV accepts multipart form CSV file or raw CSV body and returns structured card records.
func ProcessCSV(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var reader *csv.Reader

	// Check if multipart form or plain text
	contentType := r.Header.Get("Content-Type")
	if strings.HasPrefix(contentType, "multipart/form-data") {
		file, _, err := r.FormFile("file")
		if err != nil {
			http.Error(w, "Failed to read uploaded CSV file: "+err.Error(), http.StatusBadRequest)
			return
		}
		defer file.Close()
		reader = csv.NewReader(file)
	} else {
		reader = csv.NewReader(r.Body)
	}

	records, err := reader.ReadAll()
	if err != nil {
		http.Error(w, "Error parsing CSV content: "+err.Error(), http.StatusBadRequest)
		return
	}

	if len(records) == 0 {
		http.Error(w, "CSV file is empty", http.StatusBadRequest)
		return
	}

	headers := records[0]
	for i, h := range headers {
		headers[i] = strings.TrimSpace(strings.ToLower(h))
	}

	var batchRecords []models.BatchRecord
	for idx, row := range records[1:] {
		if len(row) == 0 {
			continue
		}
		cardData := make(map[string]string)
		for hIdx, header := range headers {
			val := ""
			if hIdx < len(row) {
				val = strings.TrimSpace(row[hIdx])
			}
			cardData[header] = val
		}

		recID := cardData["id"]
		if recID == "" {
			recID = fmt.Sprintf("rec-%d", idx+1)
		}

		batchRecords = append(batchRecords, models.BatchRecord{
			ID:       recID,
			CardData: cardData,
			Status:   "ready",
		})
	}

	resp := models.CSVParseResponse{
		Headers: headers,
		Records: batchRecords,
		Total:   len(batchRecords),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// SampleCSV returns a pre-populated CSV template for demonstration.
func SampleCSV(w http.ResponseWriter, r *http.Request) {
	sample := `name,role,dept,id,photo
Dr. Evelyn Vance,Chief Medical Officer,Emergency,CMO-901,https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80
Marcus Holloway,Lead Security Engineer,CyberOps,SEC-404,https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80
Sophia Al-Mansoor,Senior Systems Architect,Infrastructure,INF-882,https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80
Jordan Lee,Product Designer,UX Studio,DES-105,https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80`

	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", "attachment; filename=\"pvc_cards_sample.csv\"")
	io.WriteString(w, sample)
}
