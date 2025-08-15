export interface AuthResponseApi {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponseError {
  code: string;
  data: null;
  message: string;
  path: string;
  success: false;
  timestamp: string;
}
