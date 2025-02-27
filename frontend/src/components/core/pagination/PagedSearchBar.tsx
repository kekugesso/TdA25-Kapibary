import Image from "next/image";
import { useState } from "react";
import { usePagination } from "./PaginationContext";

export function PagedSearchBar() {
  const { setSearch, search } = usePagination();
  const [value, setValue] = useState(search);
  return (
    <div className="flex items-center space-x-2 rounded-full p-2 shadow-lg bg-white dark:bg-black text-black dark:text-white">
      <input
        type="text"
        placeholder="Hledat..."
        className="pl-5 flex-grow bg-transparent focus:outline-none dark:text-white text-black"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && setSearch(value)}
      />

      <button
        onClick={() => setSearch(value)}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:scale-110 transition-all focus:outline-none"
      >
        <Image
          src="/img/magnifying_glass.svg"
          alt="Search"
          width={32}
          height={32}
          className="dark:invert"
        />
      </button>
    </div>
  );
}
