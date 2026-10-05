import { ReactNode } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[13rem] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  Icon,
  description,
  href,
  cta,
}: {
  name: string;
  className: string;
  Icon: any;
  description: string;
  href: string;
  cta: string;
}) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-1 flex flex-col justify-start overflow-hidden rounded-xl",
      "bg-card border border-border/50",
      "transform-gpu transition-all duration-300 hover:border-border hover:shadow-lg",
      className
    )}
  >
    {/* Large background icon */}
    <div className="pointer-events-none absolute -right-8 -bottom-8 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-300">
      <Icon className="h-48 w-48 text-primary" strokeWidth={1} />
    </div>
    <div className="z-10 flex transform-gpu flex-col gap-1 p-6 transition-transform duration-300 group-hover:translate-y-2">
      <Icon className="h-10 w-10 origin-left transform-gpu text-muted-foreground transition-all duration-300 ease-in-out group-hover:scale-90 group-hover:text-primary" />
      <h3 className="text-lg font-semibold text-foreground mt-2">
        {name}
      </h3>
      <p className="max-w-lg text-muted-foreground text-sm">{description}</p>
      <div className="mt-4 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
        <Button variant="link" asChild size="sm" className="p-0 h-auto no-underline hover:no-underline">
          <Link to={href}>
            {cta}
          </Link>
        </Button>
      </div>
    </div>
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-muted/10" />
  </div>
);

export { BentoCard, BentoGrid };
