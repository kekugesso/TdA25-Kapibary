import Image from "next/image";

export default function CoverElement({
  hideCover,
  title,
  subtitle,
  linkTitle,
  linkText,
  linkAction,
}: {
  hideCover: boolean;
  title: string;
  subtitle: string;
  linkTitle: string;
  linkText: string;
  linkAction: () => void;
}) {
  return (
    <div
      className={`absolute w-full h-full flex flex-col items-center justify-center text-center px-4 transition-all duration-700 ${!hideCover ? "z-10 opacity-100" : "opacity-0"}`}
    >
      <Image
        src="/img/logo_blue.svg"
        alt="logo"
        width={100}
        height={100}
        className="mb-4"
      />
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <p className="mt-4">{subtitle}</p>
      <div className="mt-4">
        <h3 className="text-xl font-bold text-white">{linkTitle}</h3>
        <button
          onClick={linkAction}
          className="text-blue-light dark:text-blue-dark hover:text-blue-dark dark:hover:text-blue-light underline font-bold text-xl"
        >
          {linkText}
        </button>
      </div>
    </div>
  );
}
