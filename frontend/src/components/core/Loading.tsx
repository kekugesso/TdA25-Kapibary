export default function Loading({
  height = "h-page",
  iconSize = "h-16 w-16",
}: {
  height?: string;
  iconSize?: string;
}) {
  return (
    <article
      className={`flex justify-center items-center cursor-wait ${height}`}
    >
      <div
        className={`animate-spin animate-infinite animate-ease-linear animate-normal rounded-full border-b-2 border-blue-light dark:border-blue-dark ${iconSize}`}
      ></div>
    </article>
  );
}
