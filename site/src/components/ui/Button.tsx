import { Button as KButton } from "@kobalte/core/button";
import { splitProps } from "solid-js";
import type { ComponentProps, ValidComponent } from "solid-js";

type Variant = "primary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<ComponentProps<typeof KButton>, "as"> {
  variant?: Variant;
  size?: Size;
  as?: ValidComponent;
}

const sizeMap: Record<Size, string | undefined> = { sm: "sm", md: undefined, lg: "lg" };

export default function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, ["variant", "size", "class"]);
  const classes = () =>
    ["kb-button", local.class].filter(Boolean).join(" ");

  return (
    <KButton
      as={rest.as}
      class={classes()}
      data-variant={local.variant ?? "ghost"}
      data-size={sizeMap[local.size ?? "md"]}
      {...rest}
    />
  );
}
