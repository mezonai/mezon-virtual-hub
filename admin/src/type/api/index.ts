import { SortOrder } from "../enum";

export interface IPaginationResponse<T = any> {
  result: T[];
  page: number;
  size: number;
  total: number;
  total_page: number;
  has_previous_page: boolean;
  has_next_page: boolean;
}

export interface IPaginationParams<T> {
  page: number;
  limit: number;
  search: string;
  sort_by: keyof T;
  order: SortOrder;
}
