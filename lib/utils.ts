import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export const formatChartAmount = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  } else if (value >= 100) {
    return `${Math.round(value / 100)}h`;
  }
  return value.toString();
};

export function calculateAgeInMonths(date: Date): number {
  const now = new Date();
  const years = now.getFullYear() - date.getFullYear();
  const months = now.getMonth() - date.getMonth();
  
  return years * 12 + months;
} 

export function extractLastTwoDigitsOfYear(dateString : string | null): string {
  if (!dateString) {
    return "--";
  }
  try {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2);
    return year;
  } catch (error : unknown) {
    console.error("Invalid date format:", error);
    return "--";
  }
}