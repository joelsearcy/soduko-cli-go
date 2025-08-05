# Sudoku CLI Go

A Go backend for a Sudoku application with CLI interface.

## Project Structure

```
.
├── internal/         # Private application code
│   ├── api/          # API server implementation
│   └── board/        # Board generation and validation
├── bin/              # Compiled binaries
├── go.mod            # Go module definition
└── main.go           # Main application entry point
```

## Features

- Sudoku board generation with adjustable difficulty (Easy, Medium, Hard, Expert)
- Board validation and solving
- All generated boards are guaranteed to be solvable
- Instant board generation
- Track number of boards solved and abandoned per user
- Clean architecture with separation of concerns
- Unit tests for all core logic

## Development

```bash
go run main.go
```

## Building

```bash
go build -o bin/sudoku-cli main.go
```

## Testing

```bash
go test ./...
```

## Getting Started

1. Ensure you have Go 1.20+ installed.
2. Clone the repository.
3. Build and run the application:
   ```bash
   go run main.go
   ```
4. Run tests:
   ```bash
   go test ./...
   ```

## Project Structure
- `main.go` - Main application entry point
- `internal/` - Application logic (board generation, user tracking, etc.)
- `internal/api/` - API server implementation
- `internal/board/` - Board generation and validation logic
- `bin/` - Compiled binaries

## License
MIT
