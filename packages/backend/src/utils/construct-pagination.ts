import { PaginationQuery } from "../types";

export const constructPagination = (params: PaginationQuery) => {
  const limit = params.limit ? parseInt(params.limit) : 20;
  const page = params.page ? parseInt(params.page) : 1;
  const offset = (page - 1) * limit;

  return {
    limit,
    offset,
  };
};

export const constructPaginatedMetadata = (
  totalCount: number,
  limit: number,
  offset: number,
) => {
  return {
    totalCount,
    hasMorePages: totalCount > offset + limit,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: Math.floor(offset / limit) + 1,
  };
};
