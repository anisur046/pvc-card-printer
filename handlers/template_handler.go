package handlers

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"pvc-card-printer/models"
)

type TemplateStore struct {
	mu        sync.RWMutex
	templates map[string]models.CardTemplate
}

func NewTemplateStore() *TemplateStore {
	store := &TemplateStore{
		templates: make(map[string]models.CardTemplate),
	}
	store.loadDefaults()
	return store
}

func (s *TemplateStore) loadDefaults() {
	now := time.Now()

	// 1. Corporate Executive ID
	s.templates["corporate-executive"] = models.CardTemplate{
		ID:          "corporate-executive",
		Name:        "Corporate Executive ID",
		Category:    "corporate",
		Orientation: "landscape",
		WidthMM:     85.6,
		HeightMM:    53.98,
		CreatedAt:   now,
		UpdatedAt:   now,
		Front: models.CardSide{
			BgColor:       "#0b0f19",
			BgGradient:    "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
			BgPattern:     "circuit",
			OverlayEffect: "hologram",
			Elements: []models.Element{
				{ID: "hdr-bar", Type: "shape", Content: "", X: 0, Y: 0, Width: 100, Height: 8, BgColor: "#6366f1", ZIndex: 1},
				{ID: "logo-text", Type: "text", Content: "NEXUS CORP", X: 6, Y: 12, Width: 45, Height: 8, Color: "#f8fafc", FontSize: 14, FontWeight: "800", FontFamily: "Outfit, sans-serif", ZIndex: 2},
				{ID: "sub-text", Type: "text", Content: "GLOBAL SYSTEMS", X: 6, Y: 21, Width: 45, Height: 5, Color: "#818cf8", FontSize: 8, FontWeight: "600", FontFamily: "Inter, sans-serif", ZIndex: 2},
				{ID: "badge-vip", Type: "badge", Content: "EXEC ACCESS", X: 65, Y: 12, Width: 28, Height: 8, Color: "#ffffff", BgColor: "#4f46e5", FontSize: 9, FontWeight: "700", BorderRadius: "4px", ZIndex: 2},
				{ID: "photo", Type: "photo", Content: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80", X: 6, Y: 32, Width: 26, Height: 58, BorderRadius: "8px", BorderWidth: 2, BorderColor: "#6366f1", ZIndex: 3},
				{ID: "name", Type: "text", Content: "ALEXANDER ROLAND", X: 36, Y: 34, Width: 58, Height: 10, Color: "#ffffff", FontSize: 15, FontWeight: "700", FontFamily: "Outfit, sans-serif", IsDynamic: true, DynamicTag: "name", ZIndex: 2},
				{ID: "title", Type: "text", Content: "VP of Product Engineering", X: 36, Y: 46, Width: 58, Height: 6, Color: "#38bdf8", FontSize: 10, FontWeight: "500", FontFamily: "Inter, sans-serif", IsDynamic: true, DynamicTag: "role", ZIndex: 2},
				{ID: "dept", Type: "text", Content: "DEPT: R&D Division", X: 36, Y: 56, Width: 58, Height: 5, Color: "#94a3b8", FontSize: 9, FontWeight: "400", FontFamily: "Inter, sans-serif", IsDynamic: true, DynamicTag: "dept", ZIndex: 2},
				{ID: "id-num", Type: "text", Content: "ID: NX-892401", X: 36, Y: 64, Width: 35, Height: 5, Color: "#cbd5e1", FontSize: 9, FontWeight: "600", FontFamily: "Courier New, monospace", IsDynamic: true, DynamicTag: "id", ZIndex: 2},
				{ID: "qr", Type: "qr", Content: "NX-892401|ALEXANDER ROLAND|EXEC", X: 74, Y: 60, Width: 20, Height: 30, ZIndex: 3},
				{ID: "ftr-line", Type: "line", Content: "", X: 0, Y: 96, Width: 100, Height: 4, BgColor: "#4f46e5", ZIndex: 1},
			},
		},
		Back: models.CardSide{
			BgColor:       "#0b0f19",
			BgGradient:    "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
			OverlayEffect: "glossy",
			Elements: []models.Element{
				{ID: "mag-stripe", Type: "shape", Content: "", X: 0, Y: 10, Width: 100, Height: 20, BgColor: "#111827", ZIndex: 1},
				{ID: "sig-panel", Type: "shape", Content: "", X: 6, Y: 38, Width: 60, Height: 18, BgColor: "#f8fafc", ZIndex: 1},
				{ID: "sig-label", Type: "text", Content: "AUTHORIZED SIGNATURE", X: 6, Y: 58, Width: 60, Height: 5, Color: "#94a3b8", FontSize: 7, FontWeight: "600", ZIndex: 2},
				{ID: "sec-badge", Type: "badge", Content: "SECURITY LEVEL 5", X: 70, Y: 38, Width: 24, Height: 18, Color: "#f8fafc", BgColor: "#dc2626", FontSize: 8, FontWeight: "800", BorderRadius: "4px", ZIndex: 2},
				{ID: "terms", Type: "text", Content: "This card is the property of Nexus Corp. If found, please return to 100 Innovation Way, Suite 400. Property of Security Operations.", X: 6, Y: 68, Width: 88, Height: 12, Color: "#64748b", FontSize: 7, FontWeight: "400", FontFamily: "Inter, sans-serif", ZIndex: 2},
				{ID: "barcode", Type: "barcode", Content: "NX8924019920", X: 15, Y: 82, Width: 70, Height: 14, ZIndex: 3},
			},
		},
	}

	// 2. University Campus Pass (Portrait orientation)
	s.templates["campus-pass"] = models.CardTemplate{
		ID:          "campus-pass",
		Name:        "University Campus Pass",
		Category:    "education",
		Orientation: "portrait",
		WidthMM:     53.98,
		HeightMM:    85.6,
		CreatedAt:   now,
		UpdatedAt:   now,
		Front: models.CardSide{
			BgColor:       "#064e3b",
			BgGradient:    "linear-gradient(180deg, #022c22 0%, #065f46 60%, #047857 100%)",
			BgPattern:     "dots",
			OverlayEffect: "hologram",
			Elements: []models.Element{
				{ID: "univ-logo", Type: "text", Content: "STANFORD ACADEMY", X: 5, Y: 6, Width: 90, Height: 6, Color: "#ecfdf5", FontSize: 13, FontWeight: "800", FontFamily: "Outfit, sans-serif", TextAlign: "center", ZIndex: 2},
				{ID: "univ-sub", Type: "text", Content: "STUDENT IDENTIFICATION", X: 5, Y: 13, Width: 90, Height: 4, Color: "#a7f3d0", FontSize: 8, FontWeight: "600", TextAlign: "center", ZIndex: 2},
				{ID: "photo", Type: "photo", Content: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80", X: 20, Y: 20, Width: 60, Height: 35, BorderRadius: "12px", BorderWidth: 3, BorderColor: "#10b981", ZIndex: 3},
				{ID: "name", Type: "text", Content: "MARCUS CHEN", X: 5, Y: 58, Width: 90, Height: 7, Color: "#ffffff", FontSize: 14, FontWeight: "700", FontFamily: "Outfit, sans-serif", TextAlign: "center", IsDynamic: true, DynamicTag: "name", ZIndex: 2},
				{ID: "role", Type: "text", Content: "Computer Science Major", X: 5, Y: 66, Width: 90, Height: 5, Color: "#6ee7b7", FontSize: 10, FontWeight: "500", TextAlign: "center", IsDynamic: true, DynamicTag: "role", ZIndex: 2},
				{ID: "id-num", Type: "text", Content: "ID: STU-2026-8819", X: 5, Y: 73, Width: 90, Height: 4, Color: "#d1fae5", FontSize: 9, FontWeight: "600", FontFamily: "Courier New, monospace", TextAlign: "center", IsDynamic: true, DynamicTag: "id", ZIndex: 2},
				{ID: "qr", Type: "qr", Content: "STU-2026-8819|MARCUS CHEN", X: 35, Y: 79, Width: 30, Height: 16, ZIndex: 3},
			},
		},
		Back: models.CardSide{
			BgColor:       "#022c22",
			BgGradient:    "linear-gradient(180deg, #022c22 0%, #064e3b 100%)",
			OverlayEffect: "glossy",
			Elements: []models.Element{
				{ID: "notice", Type: "text", Content: "Campus Emergency: +1 (800) 555-0199\nLibrary Access Granted\nValid thru: AUG 2028", X: 10, Y: 15, Width: 80, Height: 20, Color: "#a7f3d0", FontSize: 9, FontWeight: "500", TextAlign: "center", ZIndex: 2},
				{ID: "barcode", Type: "barcode", Content: "202688190012", X: 10, Y: 45, Width: 80, Height: 20, ZIndex: 3},
			},
		},
	}

	// 3. Healthcare Medical Staff ID
	s.templates["healthcare-staff"] = models.CardTemplate{
		ID:          "healthcare-staff",
		Name:        "Healthcare Medical Staff",
		Category:    "healthcare",
		Orientation: "landscape",
		WidthMM:     85.6,
		HeightMM:    53.98,
		CreatedAt:   now,
		UpdatedAt:   now,
		Front: models.CardSide{
			BgColor:       "#0284c7",
			BgGradient:    "linear-gradient(135deg, #0369a1 0%, #0f172a 100%)",
			OverlayEffect: "hologram",
			Elements: []models.Element{
				{ID: "hosp-name", Type: "text", Content: "METRO GENERAL HOSPITAL", X: 6, Y: 10, Width: 60, Height: 8, Color: "#ffffff", FontSize: 13, FontWeight: "800", ZIndex: 2},
				{ID: "hosp-sub", Type: "text", Content: "EMERGENCY MEDICINE DEPT", X: 6, Y: 19, Width: 60, Height: 5, Color: "#38bdf8", FontSize: 8, FontWeight: "600", ZIndex: 2},
				{ID: "cross-badge", Type: "badge", Content: "+ CLINICAL", X: 70, Y: 10, Width: 24, Height: 8, Color: "#ffffff", BgColor: "#e11d48", FontSize: 9, FontWeight: "800", BorderRadius: "4px", ZIndex: 2},
				{ID: "photo", Type: "photo", Content: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80", X: 6, Y: 28, Width: 26, Height: 62, BorderRadius: "6px", BorderWidth: 2, BorderColor: "#38bdf8", ZIndex: 3},
				{ID: "name", Type: "text", Content: "DR. SARAH JENNINGS", X: 36, Y: 30, Width: 58, Height: 9, Color: "#ffffff", FontSize: 14, FontWeight: "700", IsDynamic: true, DynamicTag: "name", ZIndex: 2},
				{ID: "title", Type: "text", Content: "Attending Cardiologist", X: 36, Y: 40, Width: 58, Height: 6, Color: "#7dd3fc", FontSize: 10, FontWeight: "600", IsDynamic: true, DynamicTag: "role", ZIndex: 2},
				{ID: "lic-num", Type: "text", Content: "MD LIC: #MD-90821-NY", X: 36, Y: 50, Width: 58, Height: 5, Color: "#e0f2fe", FontSize: 9, FontWeight: "500", IsDynamic: true, DynamicTag: "id", ZIndex: 2},
				{ID: "access-badge", Type: "badge", Content: "ICU & OPERATING ROOM ACCESS", X: 36, Y: 60, Width: 58, Height: 12, Color: "#ffffff", BgColor: "#0284c7", FontSize: 8, FontWeight: "700", BorderRadius: "4px", ZIndex: 2},
				{ID: "qr", Type: "qr", Content: "MD-90821-NY|DR. SARAH JENNINGS|ICU", X: 74, Y: 73, Width: 20, Height: 22, ZIndex: 3},
			},
		},
		Back: models.CardSide{
			BgColor:       "#0f172a",
			OverlayEffect: "glossy",
			Elements: []models.Element{
				{ID: "code-red", Type: "badge", Content: "CODE RED RESPONDER", X: 6, Y: 12, Width: 88, Height: 14, Color: "#ffffff", BgColor: "#dc2626", FontSize: 10, FontWeight: "800", ZIndex: 2},
				{ID: "info", Type: "text", Content: "Hospital Security: Ext. 4444. This card provides encrypted RFID access to Level 3 Pharmacies and Surgical Wards.", X: 6, Y: 35, Width: 88, Height: 20, Color: "#94a3b8", FontSize: 8, FontWeight: "400", ZIndex: 2},
				{ID: "barcode", Type: "barcode", Content: "MD90821NY2026", X: 15, Y: 65, Width: 70, Height: 22, ZIndex: 3},
			},
		},
	}

	// 4. Cyber VIP Event Pass
	s.templates["cyber-vip"] = models.CardTemplate{
		ID:          "cyber-vip",
		Name:        "Cyber VIP Event Pass",
		Category:    "event",
		Orientation: "landscape",
		WidthMM:     85.6,
		HeightMM:    53.98,
		CreatedAt:   now,
		UpdatedAt:   now,
		Front: models.CardSide{
			BgColor:       "#09090b",
			BgGradient:    "linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)",
			BgPattern:     "waves",
			OverlayEffect: "hologram",
			Elements: []models.Element{
				{ID: "evt-logo", Type: "text", Content: "DEVCON 2026", X: 6, Y: 10, Width: 55, Height: 9, Color: "#22d3ee", FontSize: 16, FontWeight: "900", FontFamily: "Outfit, sans-serif", ZIndex: 2},
				{ID: "vip-badge", Type: "badge", Content: "ALL ACCESS VIP", X: 65, Y: 10, Width: 28, Height: 9, Color: "#09090b", BgColor: "#a855f7", FontSize: 9, FontWeight: "900", BorderRadius: "6px", ZIndex: 2},
				{ID: "photo", Type: "photo", Content: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80", X: 6, Y: 28, Width: 26, Height: 60, BorderRadius: "12px", BorderWidth: 2, BorderColor: "#a855f7", ZIndex: 3},
				{ID: "name", Type: "text", Content: "DEVON VANCE", X: 36, Y: 32, Width: 58, Height: 9, Color: "#ffffff", FontSize: 15, FontWeight: "800", IsDynamic: true, DynamicTag: "name", ZIndex: 2},
				{ID: "role", Type: "text", Content: "Keynote Speaker / AI Specialist", X: 36, Y: 43, Width: 58, Height: 6, Color: "#c084fc", FontSize: 10, FontWeight: "600", IsDynamic: true, DynamicTag: "role", ZIndex: 2},
				{ID: "pass-id", Type: "text", Content: "PASS #VIP-09921", X: 36, Y: 53, Width: 35, Height: 5, Color: "#38bdf8", FontSize: 9, FontWeight: "700", IsDynamic: true, DynamicTag: "id", ZIndex: 2},
				{ID: "qr", Type: "qr", Content: "DEVCON2026|DEVON VANCE|VIP", X: 74, Y: 60, Width: 20, Height: 30, ZIndex: 3},
			},
		},
		Back: models.CardSide{
			BgColor:       "#09090b",
			OverlayEffect: "glossy",
			Elements: []models.Element{
				{ID: "back-title", Type: "text", Content: "VIP LOUNGE & AFTERPARTY ACCESS", X: 6, Y: 15, Width: 88, Height: 10, Color: "#c084fc", FontSize: 11, FontWeight: "800", TextAlign: "center", ZIndex: 2},
				{ID: "barcode", Type: "barcode", Content: "VIP09921DEVCON", X: 15, Y: 45, Width: 70, Height: 25, ZIndex: 3},
			},
		},
	}
}

func (s *TemplateStore) ListTemplates(w http.ResponseWriter, r *http.Request) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []models.CardTemplate
	for _, tmpl := range s.templates {
		result = append(result, tmpl)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (s *TemplateStore) GetTemplate(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Missing template id parameter", http.StatusBadRequest)
		return
	}

	s.mu.RLock()
	tmpl, exists := s.templates[id]
	s.mu.RUnlock()

	if !exists {
		http.Error(w, "Template not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tmpl)
}

func (s *TemplateStore) SaveTemplate(w http.ResponseWriter, r *http.Request) {
	var tmpl models.CardTemplate
	if err := json.NewDecoder(r.Body).Decode(&tmpl); err != nil {
		http.Error(w, "Invalid JSON payload: "+err.Error(), http.StatusBadRequest)
		return
	}

	if tmpl.ID == "" {
		tmpl.ID = "custom-" + time.Now().Format("20060102150405")
	}
	tmpl.UpdatedAt = time.Now()
	if tmpl.CreatedAt.IsZero() {
		tmpl.CreatedAt = tmpl.UpdatedAt
	}

	s.mu.Lock()
	s.templates[tmpl.ID] = tmpl
	s.mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(tmpl)
}
