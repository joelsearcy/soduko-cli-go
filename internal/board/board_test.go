package board

import (
	"testing"
)

func TestBoardGenerationAndSolvability(t *testing.T) {
	g := NewGenerator()
	for d := Easy; d <= Expert; d++ {
		b, err := g.Generate(d)
		if err != nil {
			t.Fatalf("failed to generate board: %v", err)
		}
		if !g.IsSolvable(b) {
			t.Errorf("generated board is not solvable for difficulty %v", d)
		}
	}
}
