import { For, type JSXElement } from "solid-js";
import { ChevronDownIcon } from "./icons";

export interface AccordionItem {
  value: string;
  label: string;
  eyebrow?: string;
  disabled?: boolean;
  children: JSXElement;
}

export default function Accordion(props: {
  items: AccordionItem[];
  defaultValue?: string[];
  multiple?: boolean;
}) {
  const defaultOpen = new Set(props.defaultValue ?? (props.items.length > 0 ? [props.items[0].value] : []));

  return (
    <div class="kb-accordion">
      <For each={props.items}>
        {(item) => (
          <details class="kb-accordion__item" id={item.value} open={defaultOpen.has(item.value)} data-disabled={item.disabled ? "" : undefined}>
            <summary
              class="kb-accordion__trigger"
              aria-disabled={item.disabled ? "true" : undefined}
              onClick={(event) => item.disabled && event.preventDefault()}
            >
              <span class="kb-accordion__trigger-content">
                {item.eyebrow && <span class="kb-accordion__eyebrow">{item.eyebrow}</span>}
                <span class="kb-accordion__label">{item.label}</span>
              </span>
              <ChevronDownIcon class="kb-accordion__chevron" aria-hidden />
            </summary>
            <div class="kb-accordion__content">
              <div class="kb-accordion__body">{item.children}</div>
            </div>
          </details>
        )}
      </For>
    </div>
  );
}
