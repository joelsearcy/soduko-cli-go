package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/joelsearcy/sudoku-go/backend/internal/board"
)

// Server represents the HTTP server for the Sudoku API
type Server struct {
	generator board.Generator
	mux       *http.ServeMux
}

// NewServer creates a new API server
func NewServer() *Server {
	s := &Server{
		generator: board.NewGenerator(),
		mux:       http.NewServeMux(),
	}
	s.setupRoutes()
	return s
}

// setupRoutes configures all the API routes
func (s *Server) setupRoutes() {
	// Enable CORS for all routes
	s.mux.HandleFunc("/", s.corsMiddleware(s.healthCheck))
	s.mux.HandleFunc("/api/board/new", s.corsMiddleware(s.generateBoard))
	s.mux.HandleFunc("/api/board/validate", s.corsMiddleware(s.validateBoard))
	s.mux.HandleFunc("/api/board/hint", s.corsMiddleware(s.getHint))
}

// corsMiddleware adds CORS headers
func (s *Server) corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

// healthCheck provides a simple health check endpoint
func (s *Server) healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "healthy",
		"service": "sudoku-api",
	})
}

// GenerateBoardRequest represents the request for generating a new board
type GenerateBoardRequest struct {
	Difficulty string `json:"difficulty"`
}

// GenerateBoardResponse represents the response for a generated board
type GenerateBoardResponse struct {
	Board      board.Board `json:"board"`
	Difficulty string      `json:"difficulty"`
}

// generateBoard handles POST /api/board/new
func (s *Server) generateBoard(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get difficulty from query parameters
	difficultyStr := r.URL.Query().Get("difficulty")
	if difficultyStr == "" {
		difficultyStr = "easy"
	}

	// Parse difficulty
	var difficulty board.Difficulty
	switch difficultyStr {
	case "easy":
		difficulty = board.Easy
	case "medium":
		difficulty = board.Medium
	case "hard":
		difficulty = board.Hard
	case "expert":
		difficulty = board.Expert
	default:
		http.Error(w, "Invalid difficulty level", http.StatusBadRequest)
		return
	}

	// Generate board
	generatedBoard, err := s.generator.Generate(difficulty)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to generate board: %v", err), http.StatusInternalServerError)
		return
	}

	// Return response
	response := GenerateBoardResponse{
		Board:      generatedBoard,
		Difficulty: difficultyStr,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// ValidateBoardRequest represents the request for validating a board
type ValidateBoardRequest struct {
	Board board.Board `json:"board"`
}

// ValidateBoardResponse represents the response for board validation
type ValidateBoardResponse struct {
	IsValid    bool              `json:"isValid"`
	IsComplete bool              `json:"isComplete"`
	Errors     []ValidationError `json:"errors,omitempty"`
}

// ValidationError represents a validation error
type ValidationError struct {
	Row     int    `json:"row"`
	Col     int    `json:"col"`
	Message string `json:"message"`
}

// validateBoard handles POST /api/board/validate
func (s *Server) validateBoard(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ValidateBoardRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Check if board is complete
	isComplete := true
	for i := 0; i < 9; i++ {
		for j := 0; j < 9; j++ {
			if req.Board[i][j] == 0 {
				isComplete = false
				break
			}
		}
		if !isComplete {
			break
		}
	}

	// Validate board
	errors := s.validateBoardLogic(req.Board)
	isValid := len(errors) == 0

	response := ValidateBoardResponse{
		IsValid:    isValid,
		IsComplete: isComplete,
		Errors:     errors,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// validateBoardLogic performs the actual board validation
func (s *Server) validateBoardLogic(b board.Board) []ValidationError {
	var errors []ValidationError

	// Check rows
	for i := 0; i < 9; i++ {
		seen := make(map[int]int)
		for j := 0; j < 9; j++ {
			val := b[i][j]
			if val != 0 {
				if prevCol, exists := seen[val]; exists {
					errors = append(errors, ValidationError{
						Row:     i,
						Col:     j,
						Message: fmt.Sprintf("Duplicate %d in row %d (also at column %d)", val, i+1, prevCol+1),
					})
				} else {
					seen[val] = j
				}
			}
		}
	}

	// Check columns
	for j := 0; j < 9; j++ {
		seen := make(map[int]int)
		for i := 0; i < 9; i++ {
			val := b[i][j]
			if val != 0 {
				if prevRow, exists := seen[val]; exists {
					errors = append(errors, ValidationError{
						Row:     i,
						Col:     j,
						Message: fmt.Sprintf("Duplicate %d in column %d (also at row %d)", val, j+1, prevRow+1),
					})
				} else {
					seen[val] = i
				}
			}
		}
	}

	// Check 3x3 boxes
	for boxRow := 0; boxRow < 3; boxRow++ {
		for boxCol := 0; boxCol < 3; boxCol++ {
			seen := make(map[int][2]int)
			for i := 0; i < 3; i++ {
				for j := 0; j < 3; j++ {
					row := boxRow*3 + i
					col := boxCol*3 + j
					val := b[row][col]
					if val != 0 {
						if prevPos, exists := seen[val]; exists {
							errors = append(errors, ValidationError{
								Row:     row,
								Col:     col,
								Message: fmt.Sprintf("Duplicate %d in 3x3 box (also at row %d, col %d)", val, prevPos[0]+1, prevPos[1]+1),
							})
						} else {
							seen[val] = [2]int{row, col}
						}
					}
				}
			}
		}
	}

	return errors
}

// HintResponse represents the response for getting hints
type HintResponse struct {
	ValidNumbers   []int `json:"validNumbers"`
	InvalidNumbers []int `json:"invalidNumbers"`
}

// getHint handles GET /api/board/hint
func (s *Server) getHint(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse query parameters
	boardStr := r.URL.Query().Get("board")
	rowStr := r.URL.Query().Get("row")
	colStr := r.URL.Query().Get("col")

	if boardStr == "" || rowStr == "" || colStr == "" {
		http.Error(w, "Missing required parameters: board, row, col", http.StatusBadRequest)
		return
	}

	// Parse board JSON
	var b board.Board
	if err := json.Unmarshal([]byte(boardStr), &b); err != nil {
		http.Error(w, "Invalid board JSON", http.StatusBadRequest)
		return
	}

	// Parse row and col
	row, err := strconv.Atoi(rowStr)
	if err != nil {
		http.Error(w, "Invalid row parameter", http.StatusBadRequest)
		return
	}

	col, err := strconv.Atoi(colStr)
	if err != nil {
		http.Error(w, "Invalid col parameter", http.StatusBadRequest)
		return
	}

	// Validate row and col bounds
	if row < 0 || row >= 9 || col < 0 || col >= 9 {
		http.Error(w, "Row and col must be between 0 and 8", http.StatusBadRequest)
		return
	}

	// Calculate valid and invalid numbers
	validNumbers := []int{}
	invalidNumbers := []int{}

	for num := 1; num <= 9; num++ {
		if s.isValidMove(b, row, col, num) {
			validNumbers = append(validNumbers, num)
		} else {
			invalidNumbers = append(invalidNumbers, num)
		}
	}

	response := HintResponse{
		ValidNumbers:   validNumbers,
		InvalidNumbers: invalidNumbers,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// isValidMove checks if placing a number at the given position is valid
func (s *Server) isValidMove(b board.Board, row, col, num int) bool {
	// Check row
	for j := 0; j < 9; j++ {
		if j != col && b[row][j] == num {
			return false
		}
	}

	// Check column
	for i := 0; i < 9; i++ {
		if i != row && b[i][col] == num {
			return false
		}
	}

	// Check 3x3 box
	startRow := (row / 3) * 3
	startCol := (col / 3) * 3
	for i := startRow; i < startRow+3; i++ {
		for j := startCol; j < startCol+3; j++ {
			if i != row && j != col && b[i][j] == num {
				return false
			}
		}
	}

	return true
}

// ServeHTTP implements the http.Handler interface
func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.mux.ServeHTTP(w, r)
}

// Start starts the HTTP server on the given port
func (s *Server) Start(port int) error {
	addr := fmt.Sprintf(":%d", port)
	fmt.Printf("Starting Sudoku API server on http://localhost%s\n", addr)
	return http.ListenAndServe(addr, s)
}
