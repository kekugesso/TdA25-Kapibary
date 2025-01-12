type updatedAtType = "24hours" | "7days" | "1month" | "3months";

enum updatedAt {
  "24hours" = "24hours",
  "7days" = "7days",
  "1month" = "1month",
  "3months" = "3months",
}

function UpdatedAtToString(updatedAt: updatedAtType): string {
  switch (updatedAt) {
    case "24hours":
      return "Poslední den";
    case "7days":
      return "Poslední týden";
    case "1month":
      return "Poslední měsíc";
    case "3months":
      return "Poslední tři měsíce a více";
  }
}

function UpdatedAtFromStringDate(date: string): updatedAtType {
  const now = new Date();
  const updatedAt = new Date(date);
  const diff = now.getTime() - updatedAt.getTime();
  const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
  if (diffDays <= 1) return "24hours";
  if (diffDays <= 7) return "7days";
  if (diffDays <= 30) return "1month";
  return "3months";
}

export type { updatedAtType };
export { updatedAt, UpdatedAtToString, UpdatedAtFromStringDate };
