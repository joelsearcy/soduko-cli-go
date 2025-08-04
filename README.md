# Sudoku Application

A full-stack Sudoku application with Go backend and TypeScript React frontend.

## Project Structure

```
.
├── backend/          # Go backend API server
│   ├── cmd/          # Main applications
│   ├── internal/     # Private application code
│   └── go.mod        # Go module definition
├── frontend/         # TypeScript React frontend
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── package.json  # Node.js dependencies
└── README.md         # This file
```

## Features

### Backend (Go)
- Sudoku board generation with adjustable difficulty (Easy, Medium, Hard, Expert)
- Board validation and solving
- REST API for frontend communication
- Clean architecture with separation of concerns

### Frontend (TypeScript/React)
- Interactive Sudoku game interface
- Light/Dark theme toggle
- Click-to-select cells with digit popover (3x3 grid)
- Hint mode to gray out invalid options
- Responsive design

## Development

### Backend
```bash
cd backend
go run cmd/server/main.go
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Building

### Backend
```bash
cd backend
go build -o ../bin/sudoku-server cmd/server/main.go
```

### Frontend
```bash
cd frontend
npm run build
```

## Testing

### Backend
```bash
cd backend
go test ./...
```

### Frontend
```bash
cd frontend
npm test
```

This is a Go backend for a Sudoku application.

## Features
- Generate new Sudoku boards with adjustable difficulty (easy, medium, hard, expert)
- All generated boards are guaranteed to be solvable
- Instant board generation
- Track number of boards solved and abandoned per user
- Clean architecture and idiomatic Go project structure
- Unit tests for all core logic

## Getting Started

1. Ensure you have Go 1.20+ installed.
2. Clone the repository.
3. Build and run the server:
   ```bash
   go run ./cmd/server
   ```
4. Run tests:
   ```bash
   go test ./...
   ```

## Project Structure
- `cmd/server` - Main entrypoint for the backend server
- `internal/` - Application logic (board generation, user tracking, etc.)
- `pkg/` - Reusable packages
- `test/` - Unit and integration tests

## License
MIT
