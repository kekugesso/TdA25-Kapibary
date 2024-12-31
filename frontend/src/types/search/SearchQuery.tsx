import { difficultyType } from "@/types/search/difficulty";
import { updatedAtType } from "@/types/search/updatedAt";

type SearchQueryType = {
  difficulty?: difficultyType;
  updatedAt?: updatedAtType;
  many: boolean;
};

export type { SearchQueryType };
