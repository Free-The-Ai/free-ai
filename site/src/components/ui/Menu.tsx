import { DropdownMenu as KMenu } from "@kobalte/core/dropdown-menu";
import { splitProps } from "solid-js";
import type { ComponentProps, JSX, ValidComponent } from "solid-js";
import { ChevronDownIcon } from "./icons";
import type { SoundRole } from "../../lib/sound/types";
import { soundPlay } from "../../lib/sound/singleton";

export type { Placement } from "@kobalte/core/popper";

/**
 * Kobalte `DropdownMenu` wrapper styled for the Hyperstudio dark theme.
 *
 * Submenu hover uses a built-in prediction cone ("safe triangle"): while the
 * pointer travels diagonally from a `Menu.SubTrigger` toward its
 * `Menu.SubContent`, Kobalte keeps the submenu open by testing the pointer
 * against a grace-area polygon derived from the submenu content bounds. No
 * extra wiring is required — see `src/lib/safeTriangle.ts` for the reusable,
 * configurable primitive used by custom hover surfaces.
 */

export interface MenuRootProps extends ComponentProps<typeof KMenu> {}

/** Menu root. Accepts `placement` and `gutter` (popper geometry). */
export function MenuRoot(props: MenuRootProps) {
  return <KMenu {...props} />;
}

export interface MenuTriggerProps
  extends Omit<ComponentProps<typeof KMenu.Trigger>, "as"> {
  as?: ValidComponent;
  sound?: SoundRole | false;
}

/** Trigger button. Plays a tap sound unless `sound` is false. */
export function MenuTrigger(props: MenuTriggerProps) {
  const [local, rest] = splitProps(props, [
    "as",
    "class",
    "sound",
    "onClick",
    "children",
  ]);

  const handleClick: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = (event) => {
    if (local.sound !== false) soundPlay(local.sound ?? "interaction.tap");
    if (typeof local.onClick === "function") local.onClick(event);
  };

  return (
    <KMenu.Trigger
      as={local.as}
      class={`kb-menu__trigger ${local.class ?? ""}`}
      data-sound=""
      {...rest}
      onClick={handleClick}
    >
      {local.children}
      <ChevronDownIcon class="kb-menu__chevron" />
    </KMenu.Trigger>
  );
}

export interface MenuContentProps extends ComponentProps<typeof KMenu.Content> {}

/** Floating panel. */
export function MenuContent(props: MenuContentProps) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <KMenu.Portal>
      <KMenu.Content class={`kb-menu__content ${local.class ?? ""}`} {...rest} />
    </KMenu.Portal>
  );
}

export interface MenuItemProps extends ComponentProps<typeof KMenu.Item> {}

/** Selectable item. Highlight state drives `data-highlighted` styling. */
export function MenuItem(props: MenuItemProps) {
  const [local, rest] = splitProps(props, ["class"]);
  return <KMenu.Item class={`kb-menu__item ${local.class ?? ""}`} {...rest} />;
}

export interface MenuSubProps extends ComponentProps<typeof KMenu.Sub> {}
/** Submenu root. */
export function MenuSub(props: MenuSubProps) {
  return <KMenu.Sub {...props} />;
}

export interface MenuSubTriggerProps
  extends ComponentProps<typeof KMenu.SubTrigger> {}
/** Item that opens a submenu. Safe-triangle grace area is built in. */
export function MenuSubTrigger(props: MenuSubTriggerProps) {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <KMenu.SubTrigger class={`kb-menu__item kb-menu__sub-trigger ${local.class ?? ""}`} {...rest}>
      <span class="kb-menu__item-label">{local.children}</span>
      <ChevronDownIcon class="kb-menu__chevron kb-menu__chevron--sub" />
    </KMenu.SubTrigger>
  );
}

export interface MenuSubContentProps
  extends ComponentProps<typeof KMenu.SubContent> {}
/** Floating submenu panel. */
export function MenuSubContent(props: MenuSubContentProps) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <KMenu.Portal>
      <KMenu.SubContent class={`kb-menu__content ${local.class ?? ""}`} {...rest} />
    </KMenu.Portal>
  );
}

export const MenuSeparator = (props: ComponentProps<typeof KMenu.Separator>) => (
  <KMenu.Separator class="kb-menu__separator" {...props} />
);
export const MenuGroup = (props: ComponentProps<typeof KMenu.Group>) => (
  <KMenu.Group {...props} />
);
export const MenuGroupLabel = (props: ComponentProps<typeof KMenu.GroupLabel>) => (
  <KMenu.GroupLabel class="kb-menu__group-label" {...props} />
);
export const MenuItemLabel = (props: ComponentProps<typeof KMenu.ItemLabel>) => (
  <KMenu.ItemLabel class="kb-menu__item-label" {...props} />
);
export const MenuItemDescription = (
  props: ComponentProps<typeof KMenu.ItemDescription>,
) => (
  <KMenu.ItemDescription class="kb-menu__item-description" {...props} />
);

/** Composable Menu namespace mirroring Kobalte's DropdownMenu. */
export const Menu = {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  Sub: MenuSub,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
  Group: MenuGroup,
  GroupLabel: MenuGroupLabel,
  ItemLabel: MenuItemLabel,
  ItemDescription: MenuItemDescription,
  Separator: MenuSeparator,
};

export default Menu;
