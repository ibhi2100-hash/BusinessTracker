import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;

  action?: React.ReactNode;

  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        `
        flex
        items-start
        justify-between
        gap-4
        mb-6
        `,
        className
      )}
    >
      <div>
        <h1
          className="
          text-2xl
          md:text-3xl
          font-bold
          tracking-tight
          "
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="
            mt-1
            text-sm
            text-gray-400
            "
          >
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}