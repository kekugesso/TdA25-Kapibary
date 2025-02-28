import Link from "next/link";

export default function ConditionalLink({
  href,
  children,
  className = "",
  disabled = false,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  [key: string]: any;
}) {
  return disabled ? (
    <div className={className} {...props}>
      {children}
    </div>
  ) : (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}
