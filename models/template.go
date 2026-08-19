package models

import "time"

// Element represents an individual graphic or text item on a PVC card.
type Element struct {
	ID           string  `json:"id"`
	Type         string  `json:"type"` // "text", "photo", "logo", "qr", "barcode", "badge", "shape", "line"
	Content      string  `json:"content"`
	X            float64 `json:"x"`      // Percentage or px
	Y            float64 `json:"y"`      // Percentage or px
	Width        float64 `json:"width"`  // Percentage or px
	Height       float64 `json:"height"` // Percentage or px
	Color        string  `json:"color,omitempty"`
	BgColor      string  `json:"bgColor,omitempty"`
	FontSize     float64 `json:"fontSize,omitempty"`
	FontWeight   string  `json:"fontWeight,omitempty"`
	FontFamily   string  `json:"fontFamily,omitempty"`
	TextAlign    string  `json:"textAlign,omitempty"`
	BorderRadius string  `json:"borderRadius,omitempty"`
	BorderWidth  float64 `json:"borderWidth,omitempty"`
	BorderColor  string  `json:"borderColor,omitempty"`
	ZIndex       int     `json:"zIndex"`
	IsDynamic    bool    `json:"isDynamic,omitempty"` // If content comes from CSV column (e.g., {name})
	DynamicTag   string  `json:"dynamicTag,omitempty"`
}

// CardSide represents the elements and background of one side of the PVC card.
type CardSide struct {
	BgColor       string    `json:"bgColor"`
	BgGradient    string    `json:"bgGradient,omitempty"`
	BgImage       string    `json:"bgImage,omitempty"`
	BgPattern     string    `json:"bgPattern,omitempty"` // "grid", "dots", "waves", "circuit", "none"
	Elements      []Element `json:"elements"`
	OverlayEffect string    `json:"overlayEffect,omitempty"` // "hologram", "glossy", "matte", "uv"
}

// CardTemplate represents a complete PVC card layout (Front & Back).
type CardTemplate struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Category    string    `json:"category"`    // "corporate", "education", "healthcare", "event", "security", "club"
	Orientation string    `json:"orientation"` // "landscape", "portrait"
	WidthMM     float64   `json:"widthMM"`     // Standard CR80: 85.6 mm
	HeightMM    float64   `json:"heightMM"`    // Standard CR80: 53.98 mm
	Front       CardSide  `json:"front"`
	Back        CardSide  `json:"back"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// BatchRecord represents a parsed CSV record mapped to card dynamic fields.
type BatchRecord struct {
	ID       string            `json:"id"`
	CardData map[string]string `json:"cardData"`
	Status   string            `json:"status"` // "ready", "printed", "error"
}

// CSVParseResponse payload returned from backend parsing.
type CSVParseResponse struct {
	Headers []string      `json:"headers"`
	Records []BatchRecord `json:"records"`
	Total   int           `json:"total"`
}
