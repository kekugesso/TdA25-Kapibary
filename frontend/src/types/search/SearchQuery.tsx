import { difficultyType } from "@/types/search/difficulty";
import { updatedAtType } from "@/types/search/updatedAt";

type SearchQueryType = {
  difficulty?: difficultyType[];
  updatedAt?: updatedAtType;
};

export type { SearchQueryType };
