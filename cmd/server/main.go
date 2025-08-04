package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/joelsearcy/sudoku-go/internal/board"
)

func main() {
	fmt.Println("Welcome to Sudoku CLI!")
	fmt.Println("Select difficulty: 1=Easy, 2=Medium, 3=Hard, 4=Expert")
	fmt.Print("> ")
	var diffInput string
	reader := bufio.NewReader(os.Stdin)
	diffLevel := board.Easy
	if input, err := reader.ReadString('\n'); err == nil {
		diffInput = strings.TrimSpace(input)
		switch diffInput {
		case "2":
			diffLevel = board.Medium
		case "3":
			diffLevel = board.Hard
		case "4":
			diffLevel = board.Expert
		default:
			diffLevel = board.Easy
		}
	}

	gen := board.NewGenerator()
	b, err := gen.Generate(diffLevel)
	if err != nil {
		fmt.Println("Failed to generate board:", err)
		return
	}

	// Make a copy for user guesses
	userBoard := b
	// Track which cells are mutable (originally blank)
	var mutable [9][9]bool
	for i := 0; i < 9; i++ {
		for j := 0; j < 9; j++ {
			if b[i][j] == 0 {
				mutable[i][j] = true
			}
		}
	}

	for {
		clearScreen()
		fmt.Println("Current board:")
		printBoardWithMutable(userBoard, mutable)

		// Check if all mutable cells are filled
		allFilled := true
		for i := 0; i < 9; i++ {
			for j := 0; j < 9; j++ {
				if mutable[i][j] && userBoard[i][j] == 0 {
					allFilled = false
				}
			}
		}
		if allFilled {
			// Check if the user's board is a valid solution
			if isSolved(userBoard) {
				fmt.Println("\nCongratulations! You solved the puzzle!")
				break
			} else {
				fmt.Println("\nAll cells are filled, but the solution is not correct. Please check your guesses.")
			}
		}

		fmt.Print("Enter command (<row> <col> <num> | clear <row> <col> | quit): ")
		line, err := reader.ReadString('\n')
		if err != nil {
			fmt.Println("Error reading input:", err)
			continue
		}
		line = strings.TrimSpace(line)
		if line == "quit" {
			fmt.Println("Goodbye!")
			break
		}
		parts := strings.Fields(line)
		if len(parts) == 0 {
			continue
		}
		if parts[0] == "clear" {
			if len(parts) != 3 {
				fmt.Println("Usage: clear <row> <col>")
				continue
			}
			row, _ := strconv.Atoi(parts[1])
			col, _ := strconv.Atoi(parts[2])
			if !validCell(row, col) {
				fmt.Println("Invalid row or col")
				continue
			}
			if !mutable[row-1][col-1] {
				fmt.Println("Cell is not editable.")
				continue
			}
			userBoard[row-1][col-1] = 0
		} else if len(parts) == 3 {
			row, _ := strconv.Atoi(parts[0])
			col, _ := strconv.Atoi(parts[1])
			num, _ := strconv.Atoi(parts[2])
			if !validCell(row, col) || num < 1 || num > 9 {
				fmt.Println("Invalid row, col, or num")
				continue
			}
			if !mutable[row-1][col-1] {
				fmt.Println("Cell is not editable.")
				continue
			}
			// Only allow valid guesses for the current board state
			if !isValidGuess(userBoard, row-1, col-1, num) {
				fmt.Println("Invalid guess for this cell.")
				continue
			}
			userBoard[row-1][col-1] = num
		} else {
			fmt.Println("Unknown command")
		}
	}
}

// clearScreen clears the terminal output for a cleaner CLI experience.
func clearScreen() {
	// ANSI escape code to clear screen and move cursor to top-left
	fmt.Print("\033[2J\033[H")
}

// printBoardWithMutable prints the board, showing mutable cells in brackets, with fixed-width columns for alignment.
func printBoardWithMutable(b board.Board, mutable [9][9]bool) {
	// Header row
	fmt.Print("   ")
	for j := 1; j <= 9; j++ {
		if j > 1 && (j-1)%3 == 0 {
			fmt.Print("  ")
		}
		fmt.Printf(" %d ", j)
	}
	fmt.Println()

	// Separator row
	for i, row := range b {
		if i%3 == 0 {
			fmt.Println("  +----------+----------+----------+")
		}
		fmt.Printf("%d |", i+1)
		for j, val := range row {
			if j > 0 && j%3 == 0 {
				fmt.Print(" |")
			}
			if mutable[i][j] {
				if val == 0 {
					fmt.Print(" . ")
				} else {
					fmt.Printf("[%d]", val)
				}
			} else {
				if val == 0 {
					fmt.Print("   ")
				} else {
					fmt.Printf(" %d ", val)
				}
			}
		}
		fmt.Println(" |")
	}
	fmt.Println("  +----------+----------+----------+")
}

// isSolved checks if the board is a valid, completely filled Sudoku solution.
func isSolved(b board.Board) bool {
	// Check rows and columns
	for i := 0; i < 9; i++ {
		rowCheck := [10]bool{}
		colCheck := [10]bool{}
		for j := 0; j < 9; j++ {
			r := b[i][j]
			c := b[j][i]
			if r < 1 || r > 9 || rowCheck[r] {
				return false
			}
			if c < 1 || c > 9 || colCheck[c] {
				return false
			}
			rowCheck[r] = true
			colCheck[c] = true
		}
	}
	// Check 3x3 boxes
	for boxRow := 0; boxRow < 3; boxRow++ {
		for boxCol := 0; boxCol < 3; boxCol++ {
			boxCheck := [10]bool{}
			for i := 0; i < 3; i++ {
				for j := 0; j < 3; j++ {
					val := b[boxRow*3+i][boxCol*3+j]
					if val < 1 || val > 9 || boxCheck[val] {
						return false
					}
					boxCheck[val] = true
				}
			}
		}
	}
	return true
}

func validCell(row, col int) bool {
	return row >= 1 && row <= 9 && col >= 1 && col <= 9
}

// isValidGuess checks if placing num at (row, col) is valid for the current board state.
func isValidGuess(b board.Board, row, col, num int) bool {
	if b[row][col] != 0 {
		return false
	}
	// Check row and column
	for i := 0; i < 9; i++ {
		if b[row][i] == num || b[i][col] == num {
			return false
		}
	}
	// Check 3x3 box
	startRow, startCol := (row/3)*3, (col/3)*3
	for i := 0; i < 3; i++ {
		for j := 0; j < 3; j++ {
			if b[startRow+i][startCol+j] == num {
				return false
			}
		}
	}
	return true
}
