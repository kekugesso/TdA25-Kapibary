"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PaginationContext, {
  PaginationContextProps,
  PaginationData,
} from "./PaginationContext";
import { useSearchParams } from "next/navigation";

export interface PaginationManagerProps<T> {
  queryKey: string[];
  fetcherAction: (params: {
    page: number;
    pageSize: number;
  }) => Promise<PaginationData<T>>;
  defaultPageSize?: number;
  children: React.ReactNode;
}

export function Pagination<T>({
  queryKey,
  fetcherAction,
  defaultPageSize = 100,
  children,
}: PaginationManagerProps<T>) {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get("page");
    return pageParam ? Number.parseInt(pageParam) : 1;
  });
  const [pageSize, setPageSize] = useState(() => {
    const pageSizeParam = searchParams.get("page_size");
    return pageSizeParam ? Number.parseInt(pageSizeParam) : defaultPageSize;
  });

  const setSearchParams = useCallback((key: string, value: string) => {
    const newSearchParams = new URLSearchParams(window.location.search);
    newSearchParams.set(key, value);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${newSearchParams.toString()}`,
    );
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetcherAction({ page, pageSize }),
  });

  useEffect(() => {
    if (!data) return;
    if (page <= 0) {
      setPage(1);
      setSearchParams("page", "1");
    }
    if (data.count < page * pageSize) {
      const maxPage = Math.ceil(data.count / pageSize);
      setPage(maxPage);
      setSearchParams("page", maxPage.toString());
    }
    if (pageSize <= 0) {
      setPageSize(defaultPageSize);
      setSearchParams("page_size", defaultPageSize.toString());
    }
  }, [data, page, pageSize, defaultPageSize, setSearchParams]);

  useEffect(() => {
    refetch();
  }, [page, pageSize, refetch]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSearchParams("page", newPage.toString());
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setSearchParams("page_size", newPageSize.toString());
  };

  const contextValue: PaginationContextProps<T> = {
    page,
    setPage: handlePageChange,
    pageSize,
    setPageSize: handlePageSizeChange,
    data: data || { results: [], count: 0, next: null, previous: null },
    error,
    isLoading: isLoading || !data,
    refetch,
  };

  return (
    <PaginationContext.Provider value={contextValue}>
      {children}
    </PaginationContext.Provider>
  );
}

export default Pagination;
