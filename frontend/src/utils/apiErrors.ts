import axios from "axios";
import type { ApiErrorBody, FieldErrors } from "../types/quiz";

export const mapValidationErrors = (error: unknown): FieldErrors | null => {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return null;

  const details = error.response?.data?.details;
  if (!details) return null;

  return details.reduce<FieldErrors>((acc, detail) => {
    acc[detail.field] = detail.message;
    return acc;
  }, {});
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return fallback;

  return error.response?.data?.error || fallback;
};

// Helper funcn to instantly check if the JWT token is expired/invalid
export const isUnauthorized = (error: unknown): boolean => {
  return axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403);
};