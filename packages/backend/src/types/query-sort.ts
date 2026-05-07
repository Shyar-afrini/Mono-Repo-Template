import z from "zod";

export const SortOptionSchema = z.object({
  field: z.string().optional(),
  direction: z.enum(["asc", "desc"]).optional(),
});

export type SortOption = z.infer<typeof SortOptionSchema>;

export function parseSortBy(sortBy?: string): SortOption[] {
  if (!sortBy) return [];

  return sortBy
    .split(",")
    .map((pair) => {
      const [field, dir] = pair.split(":").map((v) => v.trim());
      const direction: SortOption["direction"] =
        dir === "desc" ? "desc" : "asc"; // default asc
      return { field, direction };
    })
    .filter((s) => s.field); // ignore empty
}
