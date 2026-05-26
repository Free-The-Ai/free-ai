import { Button as KButton } from "@kobalte/core/button";
import { splitProps } from "solid-js";
import type { ComponentProps, ValidComponent } from "solid-js";
import type { SoundRole } from "../../lib/sound/types";
import { soundPlay } from "../../lib/sound/singleton";

type Variant = "primary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<ComponentProps<typeof KButton>, "as"> {
  variant?: Variant;
  size?: Size;
  as?: ValidComponent;
  sound?: SoundRole | false;
  volume?: number;
}

const sizeMap: Record<Size, string | undefined> = { sm: "sm", md: undefined, lg: "lg" };

export default function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, ["variant", "size", "class", "sound", "volume", "onClick"]);

  const handleClick = (e: MouseEvent) => {
    if (local.sound !== false) {
      soundPlay(local.sound ?? "interaction.tap", { volume: local.volume });
    }
    local.onClick?.(e);
  };

  const classes = () =>
    ["kb-button", local.class].filter(Boolean).join(" ");

  return (
    <KButton
      as={rest.as}
      class={classes()}
      data-variant={local.variant ?? "ghost"}
      data-size={sizeMap[local.size ?? "md"]}
      data-sound=""
      {...rest}
      onClick={handleClick}
    />
  );
}
