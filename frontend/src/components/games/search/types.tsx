type difficulty = "beginner" | "easy" | "medium" | "hard" | "extreme";
type updatedAt = "24hours" | "7days" | "1month" | "3months";

type SearchQuery = {
  difficulty?: difficulty;
  updatedAt?: updatedAt;
  many: boolean;
};

export type { difficulty, updatedAt, SearchQuery };
