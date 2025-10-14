import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

type ProseProps = HTMLAttributes<HTMLDivElement>;

export function Prose({ children, className, ...props }: ProseProps) {
  return (
    <div className={clsx("prose", className)} {...props}>
      {children}
    </div>
  );
}
