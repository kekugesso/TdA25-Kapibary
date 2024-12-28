type updatedAtType = "24hours" | "7days" | "1month" | "3months";

enum updatedAt {
  "24hours" = "24hours",
  "7days" = "7days",
  "1month" = "1month",
  "3months" = "3months",
}

type difficultyType = "beginner" | "easy" | "medium" | "hard" | "extreme";

enum difficulty {
  beginner = "beginner",
  easy = "easy",
  medium = "medium",
  hard = "hard",
  extreme = "extreme",
}

type SearchQueryType = {
  difficulty?: difficultyType;
  updatedAt?: updatedAtType;
  many: boolean;
};

export type { difficultyType, updatedAtType, SearchQueryType };
export { difficulty, updatedAt };
