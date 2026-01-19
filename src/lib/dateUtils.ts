import { format } from "date-fns";

/**
 * Formats a date string or Date object to European format (d/M/yyyy)
 */
export const formatDateEU = (date: string | Date): string => {
  return format(new Date(date), "d/M/yyyy");
};

/**
 * Formats a date to short European format (d MMM)
 */
export const formatDateShortEU = (date: string | Date): string => {
  return format(new Date(date), "d MMM");
};

/**
 * Formats a date with time in European format
 */
export const formatDateTimeEU = (date: string | Date): string => {
  return format(new Date(date), "d/M/yyyy HH:mm");
};
