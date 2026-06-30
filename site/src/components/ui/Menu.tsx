import { Menu as BaseMenu } from '@base-ui/react/menu';
import { soundPlay } from '../../lib/sound/singleton';
import type { SoundRole } from '../../lib/sound/types';
import { CheckmarkIcon, ChevronDownIcon } from './icons';

export type Side = 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';

export interface MenuRootProps extends Omit<React.ComponentProps<typeof BaseMenu.Root>, 'side'> {
  side?: Side;
}

export function MenuRoot({ children, ...rest }: MenuRootProps) {
  return <BaseMenu.Root {...rest}>{children}</BaseMenu.Root>;
}

export interface MenuTriggerProps extends Omit<React.ComponentProps<typeof BaseMenu.Trigger>, 'render'> {
  sound?: SoundRole | false;
}

export function MenuTrigger({ sound, className, onClick, children, ...rest }: MenuTriggerProps) {
  return (
    <BaseMenu.Trigger
      className={['kb-menu__trigger', className].filter(Boolean).join(' ')}
      data-sound=""
      onClick={(e) => {
        if (sound !== false) soundPlay(sound ?? 'interaction.tap');
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
      <ChevronDownIcon className="kb-menu__chevron" />
    </BaseMenu.Trigger>
  );
}

export interface MenuContentProps extends Omit<React.ComponentProps<typeof BaseMenu.Positioner>, 'side'> {
  side?: Side;
}

export function MenuContent({ side = 'bottom', className, children, ...rest }: MenuContentProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner className="kb-menu__positioner" side={side} collisionPadding={8} {...rest}>
        <BaseMenu.Popup className={['kb-menu__content', className].filter(Boolean).join(' ')}>
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

export interface MenuItemProps extends React.ComponentProps<typeof BaseMenu.Item> {}

export function MenuItem({ className, ...rest }: MenuItemProps) {
  return <BaseMenu.Item className={['kb-menu__item', className].filter(Boolean).join(' ')} {...rest} />;
}

export interface MenuSubProps extends React.ComponentProps<typeof BaseMenu.SubmenuRoot> {}

export function MenuSub({ children, ...rest }: MenuSubProps) {
  return <BaseMenu.SubmenuRoot {...rest}>{children}</BaseMenu.SubmenuRoot>;
}

export interface MenuSubTriggerProps extends React.ComponentProps<typeof BaseMenu.SubmenuTrigger> {}

export function MenuSubTrigger({ className, children, ...rest }: MenuSubTriggerProps) {
  return (
    <BaseMenu.SubmenuTrigger
      className={['kb-menu__item', 'kb-menu__sub-trigger', className].filter(Boolean).join(' ')}
      {...rest}
    >
      <span className="kb-menu__item-label">{children}</span>
      <ChevronDownIcon className="kb-menu__chevron kb-menu__chevron--sub" />
    </BaseMenu.SubmenuTrigger>
  );
}

export interface MenuSubContentProps extends React.ComponentProps<typeof BaseMenu.Positioner> {}

export function MenuSubContent({ side = 'inline-end', className, children, ...rest }: MenuSubContentProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner className="kb-menu__positioner" side={side} collisionPadding={8} {...rest}>
        <BaseMenu.Popup className={['kb-menu__content', className].filter(Boolean).join(' ')}>
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

export function MenuSeparator(props: React.ComponentProps<typeof BaseMenu.Separator>) {
  return <BaseMenu.Separator className="kb-menu__separator" {...props} />;
}

export function MenuGroup(props: React.ComponentProps<typeof BaseMenu.Group>) {
  return <BaseMenu.Group {...props} />;
}

export function MenuGroupLabel({ className, ...rest }: React.ComponentProps<typeof BaseMenu.GroupLabel>) {
  return <BaseMenu.GroupLabel className={['kb-menu__group-label', className].filter(Boolean).join(' ')} {...rest} />;
}

export function MenuItemLabel({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <span className={['kb-menu__item-label', className].filter(Boolean).join(' ')}>{children}</span>;
}

export interface MenuCheckboxItemProps extends React.ComponentProps<typeof BaseMenu.CheckboxItem> {}

export function MenuCheckboxItem({ className, children, ...rest }: MenuCheckboxItemProps) {
  return <BaseMenu.CheckboxItem className={['kb-menu__item', 'kb-menu__checkbox-item', className].filter(Boolean).join(' ')} {...rest}>{children}</BaseMenu.CheckboxItem>;
}

export function MenuCheckboxItemIndicator({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <BaseMenu.CheckboxItemIndicator className={['kb-menu__checkbox-indicator', className].filter(Boolean).join(' ')}>{children}</BaseMenu.CheckboxItemIndicator>;
}

export const Menu = {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  CheckboxItem: MenuCheckboxItem,
  CheckboxItemIndicator: MenuCheckboxItemIndicator,
  Sub: MenuSub,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
  Group: MenuGroup,
  GroupLabel: MenuGroupLabel,
  ItemLabel: MenuItemLabel,
  Separator: MenuSeparator,
};

export default Menu;
