# Mono-repo Workspace

This is a mono-repo containing both the Go backend and TypeScript frontend for the Sudoku application.

## Getting Started

### Prerequisites
- Go 1.21+
- Node.js 18+
- npm or yarn

### Development Setup

1. **Backend Development**
   ```bash
   cd backend
   go mod tidy
   go run cmd/server/main.go
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Building for Production

1. **Backend**
   ```bash
   cd backend
   go build -o ../bin/sudoku-server cmd/server/main.go
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm run build
   ```

### Testing

1. **Backend**
   ```bash
   cd backend
   go test ./...
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm test
   ```

## Project Structure

```
.
├── backend/              # Go backend
│   ├── cmd/
│   │   └── server/       # Main server application
│   ├── internal/
│   │   ├── board/        # Sudoku game logic
│   │   └── api/          # REST API handlers (future)
│   └── go.mod
├── frontend/             # TypeScript React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── bin/                  # Built binaries
├── .github/              # GitHub configuration
└── docs/                 # Documentation
```

## Development Workflow

1. Start backend server: `cd backend && go run cmd/server/main.go`
2. Start frontend dev server: `cd frontend && npm start`
3. Make changes and test
4. Run tests: `go test ./...` and `npm test`
5. Build for production when ready
