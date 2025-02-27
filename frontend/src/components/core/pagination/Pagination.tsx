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
    search: string;
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
  const [search, setSearch] = useState(() => {
    const searchParam = searchParams.get("search");
    return searchParam ? searchParam : "";
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
  const removeSearchParams = useCallback((key: string) => {
    const newSearchParams = new URLSearchParams(window.location.search);
    newSearchParams.delete(key);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${newSearchParams.toString()}`,
    );
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetcherAction({ page, pageSize, search }),
  });

  useEffect(() => {
    if (!data) return;
    if (page <= 0) {
      setPage(1);
      setSearchParams("page", "1");
    }
    if (data.count < page * pageSize && data.count > 0) {
      const maxPage = Math.ceil(data.count / pageSize);
      setPage(maxPage);
      setSearchParams("page", maxPage.toString());
    }
    if (pageSize <= 0) {
      setPageSize(defaultPageSize);
      setSearchParams("page_size", defaultPageSize.toString());
    }
    if (search === "") removeSearchParams("search");
    if (page === 1) removeSearchParams("page");
    if (pageSize === defaultPageSize) removeSearchParams("page_size");
  }, [
    data,
    page,
    search,
    pageSize,
    defaultPageSize,
    setSearchParams,
    removeSearchParams,
  ]);

  useEffect(() => {
    refetch();
  }, [page, pageSize, search, refetch]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSearchParams("page", newPage.toString());
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setSearchParams("page_size", newPageSize.toString());
  };

  const handleSearch = (newSearch: string) => {
    setSearch(newSearch);
    setSearchParams("search", newSearch);
  };

  const contextValue: PaginationContextProps<T> = {
    page,
    setPage: handlePageChange,
    pageSize,
    setPageSize: handlePageSizeChange,
    search,
    setSearch: handleSearch,
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
