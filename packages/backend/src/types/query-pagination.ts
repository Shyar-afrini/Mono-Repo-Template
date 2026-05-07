import z from "zod";

const paginationParams = z.object({
  limit: z.string().optional(),
  page: z.string().optional(),
});

type PaginationQuery = z.infer<typeof paginationParams>;

export { paginationParams, type PaginationQuery };

export type PaginationConstruct<T> = {
  data?: T;
  meta?: {
    totalCount?: number;
    hasMorePages?: boolean;
    totalPages?: number;
    currentPage?: number;
  };
};
