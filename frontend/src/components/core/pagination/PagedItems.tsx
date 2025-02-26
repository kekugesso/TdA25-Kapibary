import React, { useEffect } from "react";
import { usePagination } from "./PaginationContext";
import Loading from "../Loading";
import { useErrorModal } from "../ErrorModalProvider";

export function PagedItems<T>({
  children,
}: {
  children: (items: T[]) => React.ReactNode;
}) {
  const { data, isLoading, error, page } = usePagination<T>();
  const { displayError } = useErrorModal();
  if (error) displayError(error);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page]);

  return isLoading || error ? <Loading /> : children(data.results);
}

export default PagedItems;
