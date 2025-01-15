type difficultyType = "beginner" | "easy" | "medium" | "hard" | "extreme";

enum difficulty {
  beginner = "beginner",
  easy = "easy",
  medium = "medium",
  hard = "hard",
  extreme = "extreme",
}

function DifficultyToString(difficulty: difficultyType): string {
  switch (difficulty) {
    case "beginner":
      return "Začátečník";
    case "easy":
      return "Lehká";
    case "medium":
      return "Střední";
    case "hard":
      return "Těžká";
    case "extreme":
      return "Extrémní";
  }
}

export type { difficultyType };
export { difficulty, DifficultyToString };
