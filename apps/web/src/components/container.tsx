import type { ComponentPropsWithoutRef, ElementType } from "react";
import { clsx } from "clsx";

type ContainerProps<T extends ElementType> = {
  as?: T;
  className?: string;
} & ComponentPropsWithoutRef<T>;

export function Container<T extends ElementType = "div">({
  as,
  className,
  ...props
}: ContainerProps<T>) {
  const Component = (as ?? "div") as ElementType;
  return <Component className={clsx("container", className)} {...props} />;
}
