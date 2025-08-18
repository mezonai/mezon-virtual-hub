export interface IPaginationResponse<T = any> {
  result: T[];
  page: number;
  size: number;
  total: number;
  total_page: number;
  has_previous_page: boolean;
  has_next_page: boolean;
}
