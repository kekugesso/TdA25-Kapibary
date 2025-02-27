"use client";
import { createContext, useContext } from "react";

export interface PaginationData<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PaginationContextProps<T> {
  page: number;
  setPage: (n: number) => void;
  pageSize: number;
  setPageSize: (n: number) => void;
  search: string;
  setSearch: (text: string) => void;

  data: PaginationData<T>;
  error: Error | null;
  isLoading: boolean;
  refetch: () => void;
}

const PaginationContext = createContext<PaginationContextProps<any> | null>(
  null,
);

export function usePagination<T>() {
  const context = useContext<PaginationContextProps<T> | null>(
    PaginationContext,
  );
  if (!context)
    throw new Error("usePagination must be used within a PaginationManager");
  return context as PaginationContextProps<T>;
}

export default PaginationContext;
