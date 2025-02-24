export default function Loading({ height = "h-page" }: { height?: string }) {
  return (
    <article
      className={`flex justify-center items-center cursor-wait ${height}`}
    >
      <div className="animate-spin animate-infinite animate-ease-linear animate-normal rounded-full h-16 w-16 border-b-2 border-blue-light dark:border-blue-dark"></div>
    </article>
  );
}
