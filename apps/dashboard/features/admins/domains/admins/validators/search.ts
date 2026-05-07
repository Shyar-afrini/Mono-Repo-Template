import { z } from "zod";

export const adminSearchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(2, "admins.search.validation.tooShort")
    .max(50, "admins.search.validation.tooLong"),
});

