import { PaginationResultInterface } from './pagination.results.interface';

export interface IPagination<PaginationEntity> {
  results: PaginationEntity[];
  page_total: number;
  total: number;
}

export class Pagination<PaginationEntity>
  implements IPagination<PaginationEntity>
{
  results: PaginationEntity[];
  page_total: number;
  total: number;

  constructor(paginationResults: PaginationResultInterface<PaginationEntity>) {
    this.results = paginationResults.results;
    this.page_total = paginationResults.results.length;
    this.total = paginationResults.total;
  }
}
