import React from "react";
import { usePagination } from "./PaginationContext";
import Loading from "../Loading";
import { useErrorModal } from "../ErrorModalProvider";

export function PagedItems<T>({
  children,
}: {
  children: (items: T[]) => React.ReactNode;
}) {
  const { data, isLoading, error } = usePagination<T>();
  const { displayError } = useErrorModal();
  if (error) displayError(error);
  console.log(data);

  return isLoading || error ? <Loading /> : children(data.results);
}

export default PagedItems;
