export interface WorkingDaysQuery {
  days?: number;
  hours?: number;
  date?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface SuccessResponse {
  date: string; // formato UTC ISO 8601
}
