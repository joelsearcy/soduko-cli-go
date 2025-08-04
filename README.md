# Sudoku Go Backend

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
