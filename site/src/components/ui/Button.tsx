import { Button as KButton } from "@kobalte/core/button";
import { splitProps } from "solid-js";
import type { ComponentProps, ValidComponent } from "solid-js";
import type { SoundRole } from "../../lib/sound/types";
import { soundPlay } from "../../lib/sound/singleton";
import type { Density } from "../../lib/theme";

type Variant = "primary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

/** Per-instance control-height overrides scoped to a single button. */
const DENSITY_HEIGHT: Record<Density, string> = {
  compact: "34px",
  comfortable: "40px",
  spacious: "46px",
};

interface ButtonProps extends Omit<ComponentProps<typeof KButton>, "as"> {
  variant?: Variant;
  size?: Size;
  /** Override the global density for this button only (sets --control-height locally). */
  density?: Density;
  as?: ValidComponent;
  sound?: SoundRole | false;
  volume?: number;
}

const sizeMap: Record<Size, string | undefined> = { sm: "sm", md: undefined, lg: "lg" };

export default function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, ["variant", "size", "density", "class", "sound", "volume", "onClick", "style"]);

  const handleClick = (e: MouseEvent) => {
    if (local.sound !== false) {
      soundPlay(local.sound ?? "interaction.tap", { volume: local.volume });
    }
    local.onClick?.(e);
  };

  const classes = () =>
    ["kb-button", local.class].filter(Boolean).join(" ");

  const style = () =>
    local.density
      ? { "--control-height": DENSITY_HEIGHT[local.density], ...((local.style as Record<string, string>) ?? {}) }
      : local.style;

  return (
    <KButton
      as={rest.as}
      class={classes()}
      style={style()}
      data-variant={local.variant ?? "ghost"}
      data-size={sizeMap[local.size ?? "md"]}
      data-sound=""
      {...rest}
      onClick={handleClick}
    />
  );
}
