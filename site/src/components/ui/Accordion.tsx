import { Accordion as KAccordion } from "@kobalte/core/accordion";
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
  return (
    <KAccordion
      class="kb-accordion"
      defaultValue={props.defaultValue ?? (props.items.length > 0 ? [props.items[0].value] : [])}
      multiple={props.multiple ?? true}
      collapsible
    >
      <For each={props.items}>
        {(item) => (
          <KAccordion.Item class="kb-accordion__item" value={item.value} id={item.value} disabled={item.disabled}>
            <KAccordion.Header class="kb-accordion__header" as="h3">
              <KAccordion.Trigger class="kb-accordion__trigger">
                <span class="kb-accordion__trigger-content">
                  {item.eyebrow && <span class="kb-accordion__eyebrow">{item.eyebrow}</span>}
                  <span class="kb-accordion__label">{item.label}</span>
                </span>
                <ChevronDownIcon class="kb-accordion__chevron" aria-hidden />
              </KAccordion.Trigger>
            </KAccordion.Header>
            <KAccordion.Content class="kb-accordion__content">
              <div class="kb-accordion__body">{item.children}</div>
            </KAccordion.Content>
          </KAccordion.Item>
        )}
      </For>
    </KAccordion>
  );
}
