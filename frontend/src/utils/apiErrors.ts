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