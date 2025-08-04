package board

import (
	"errors"
	"math/rand"
)

// Difficulty represents the level of challenge for a Sudoku board.
type Difficulty int

const (
	Easy Difficulty = iota
	Medium
	Hard
	Expert
)

// Board represents a 9x9 Sudoku board.
type Board [9][9]int

// Generator is responsible for generating Sudoku boards.
type Generator interface {
	Generate(d Difficulty) (Board, error)
	IsSolvable(b Board) bool
}

type generator struct{}

// NewGenerator returns a new Sudoku board generator.
func NewGenerator() Generator {
	return &generator{}
}

var ErrUnsolvable = errors.New("could not generate a solvable board")

// Generate creates a new Sudoku board of the given difficulty.
func (g *generator) Generate(d Difficulty) (Board, error) {
	var board Board
	if !fillBoard(&board) {
		return board, ErrUnsolvable
	}
	removeCells(&board, d)
	return board, nil
}

// IsSolvable checks if a board is solvable (has a unique solution)
func (g *generator) IsSolvable(b Board) bool {
	return hasUniqueSolution(b)
}

// --- Internal helpers ---

func fillBoard(b *Board) bool {
	return solveHelper(b, 0, 0, true)
}

func solveHelper(b *Board, row, col int, randomize bool) bool {
	if row == 9 {
		return true
	}
	nextRow, nextCol := row, col+1
	if nextCol == 9 {
		nextRow++
		nextCol = 0
	}
	nums := [9]int{1, 2, 3, 4, 5, 6, 7, 8, 9}
	if randomize {
		rand.Shuffle(9, func(i, j int) { nums[i], nums[j] = nums[j], nums[i] })
	}
	if b[row][col] != 0 {
		return solveHelper(b, nextRow, nextCol, randomize)
	}
	for _, n := range nums {
		if isValid(*b, row, col, n) {
			b[row][col] = n
			if solveHelper(b, nextRow, nextCol, randomize) {
				return true
			}
			b[row][col] = 0
		}
	}
	return false
}

func isValid(b Board, row, col, n int) bool {
	for i := 0; i < 9; i++ {
		if b[row][i] == n || b[i][col] == n {
			return false
		}
	}
	startRow, startCol := (row/3)*3, (col/3)*3
	for i := 0; i < 3; i++ {
		for j := 0; j < 3; j++ {
			if b[startRow+i][startCol+j] == n {
				return false
			}
		}
	}
	return true
}

func removeCells(b *Board, d Difficulty) {
	var clues int
	switch d {
	case Easy:
		clues = rand.Intn(6) + 41 // 41-46 clues (easier)
	case Medium:
		clues = rand.Intn(6) + 35 // 35-40 clues
	case Hard:
		clues = rand.Intn(6) + 29 // 29-34 clues
	case Expert:
		clues = rand.Intn(6) + 22 // 22-27 clues
	default:
		clues = 41
	}
	totalCells := 81
	toRemove := totalCells - clues
	positions := rand.Perm(totalCells)
	for i := 0; i < toRemove; i++ {
		r := positions[i] / 9
		c := positions[i] % 9
		backup := b[r][c]
		b[r][c] = 0
		copyBoard := *b
		if !hasUniqueSolution(copyBoard) {
			b[r][c] = backup // revert if not unique
		}
	}
}

func hasUniqueSolution(b Board) bool {
	count := 0
	solveCount(&b, 0, 0, &count)
	return count == 1
}

func solveCount(b *Board, row, col int, count *int) {
	if *count > 1 {
		return
	}
	if row == 9 {
		*count++
		return
	}
	nextRow, nextCol := row, col+1
	if nextCol == 9 {
		nextRow++
		nextCol = 0
	}
	if b[row][col] != 0 {
		solveCount(b, nextRow, nextCol, count)
		return
	}
	for n := 1; n <= 9; n++ {
		if isValid(*b, row, col, n) {
			b[row][col] = n
			solveCount(b, nextRow, nextCol, count)
			b[row][col] = 0
		}
	}
}
