import { Dialog as KDialog } from "@kobalte/core/dialog";
import { splitProps } from "solid-js";
import type { ComponentProps, JSXElement } from "solid-js";

interface DialogProps extends ComponentProps<typeof KDialog> {
  trigger?: JSXElement;
  title?: string;
  description?: string;
  children?: JSXElement;
}

export default function Dialog(props: DialogProps) {
  const [local, rest] = splitProps(props, [
    "trigger", "title", "description", "children", "class",
  ]);

  return (
    <KDialog {...rest} class={`kb-dialog ${local.class ?? ""}`}>
      {local.trigger && (
        <KDialog.Trigger as="div" class="kb-dialog__trigger">
          {local.trigger}
        </KDialog.Trigger>
      )}
      <KDialog.Portal>
        <KDialog.Overlay class="kb-dialog__overlay" />
        <KDialog.Content class="kb-dialog__content">
          {local.title && (
            <KDialog.Title class="kb-dialog__title">{local.title}</KDialog.Title>
          )}
          {local.description && (
            <KDialog.Description class="kb-dialog__description">
              {local.description}
            </KDialog.Description>
          )}
          {local.children}
          <KDialog.CloseButton class="kb-dialog__close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </KDialog.CloseButton>
        </KDialog.Content>
      </KDialog.Portal>
    </KDialog>
  );
}
