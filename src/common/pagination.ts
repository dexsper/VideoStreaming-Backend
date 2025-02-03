export interface IPagination<PaginationEntity> {
  results: PaginationEntity[];
  hasNextPage: boolean;
}
