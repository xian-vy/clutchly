import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getSpeciesAbbreviation = (name: string) => {
  return name.split(' ')
    .map(word => word[0]?.toUpperCase())
    .join('');
};


export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export const formatChartAmount = (value: number): string => {
  const format = (val: number, suffix: string) => {
    const formatted = (val).toFixed(1);
    return `${formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted}${suffix}`;
  };

  if (value >= 1000000) {
    return format(value / 1000000, 'M');
  } else if (value >= 1000) {
    return format(value / 1000, 'k');
  } else if (value >= 100) {
    return format(value / 100, 'h')  
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

export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return '0';
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

export function getCurrentMonthDateRange(): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  return {
    dateFrom: formatDate(firstDay),
    dateTo: formatDate(lastDay)
  };
}

export function toTitleCase(str : string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
}
