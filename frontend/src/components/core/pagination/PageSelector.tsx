import { usePagination } from "./PaginationContext";

export function PageSelector() {
  const { page, setPage, pageSize, setPageSize, data } = usePagination<any>();

  return (
    <div className="flex items-center space-x-3 w-full p-2">
      <div>
        {Math.min((page - 1) * pageSize, data.count)} -{" "}
        {Math.min(page * pageSize, data.count)} z {data.count}
      </div>

      <div className="flex-1" />
      <button
        onClick={() => setPage(Math.max(page - 1, 1))}
        disabled={data.previous === null}
        className={`p-2 ${data.previous === null ? "cursor-not-allowed text-gray-100 dark:text-gray-500" : ""}`}
      >
        &lt;
      </button>
      {[...Array(5)].map((_, i) => {
        const n =
          page < 3
            ? i + 1
            : page > data.count / pageSize - 2
              ? Math.ceil(data.count / pageSize - 4 + i)
              : page + i - 2;
        return (
          <>
            {page > 3 && i === 0 && (
              <>
                <button key={1} onClick={() => setPage(1)} className="p-2">
                  1
                </button>
                <span>...</span>
              </>
            )}
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`${n === page ? "underline" : ""} p-2`}
            >
              {n}
            </button>
            {page < data.count / pageSize - 2 && i === 4 && (
              <>
                <span>...</span>
                <button
                  key={Math.ceil(data.count / pageSize)}
                  onClick={() => setPage(Math.ceil(data.count / pageSize))}
                  className="p-2"
                >
                  {Math.ceil(data.count / pageSize)}
                </button>
              </>
            )}
          </>
        );
      })}
      <button
        onClick={() => setPage(page + 1)}
        disabled={data.next === null}
        className={`p-2 ${data.next === null ? "cursor-not-allowed text-gray-100 dark:text-gray-500" : ""}`}
      >
        &gt;
      </button>
      <div className="flex-1" />
      <label htmlFor="page-size">Zobrazit:</label>
      <select
        id="page-size"
        value={pageSize}
        onChange={(e) => setPageSize(Number(e.target.value))}
      >
        <option value={50}>50</option>
        <option value={100}>100</option>
        <option value={250}>250</option>
        <option value={500}>500</option>
      </select>
    </div>
  );
}

export default PageSelector;
