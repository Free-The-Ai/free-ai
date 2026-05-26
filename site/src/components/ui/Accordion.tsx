import { For, createSignal, type JSXElement } from "solid-js";
import { ChevronDownIcon } from "./icons";
import type { SoundRole } from "../../lib/sound/types";
import { soundPlay } from "../../lib/sound/singleton";

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
  expandSound?: SoundRole | false;
  collapseSound?: SoundRole | false;
  volume?: number;
}) {
  const defaultOpen = new Set(props.defaultValue ?? (props.items.length > 0 ? [props.items[0].value] : []));
  const [openItems, setOpenItems] = createSignal<Set<string>>(new Set(defaultOpen));

  function toggleItem(item: AccordionItem, event: Event) {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    const current = new Set(openItems());
    const wasOpen = current.has(item.value);

    if (props.multiple) {
      if (wasOpen) current.delete(item.value);
      else current.add(item.value);
    } else {
      if (wasOpen) current.clear();
      else {
        current.clear();
        current.add(item.value);
      }
    }

    setOpenItems(current);

    // Play sound
    if (wasOpen && props.collapseSound !== false) {
      soundPlay(props.collapseSound ?? "overlay.collapse", { volume: props.volume });
    } else if (!wasOpen && props.expandSound !== false) {
      soundPlay(props.expandSound ?? "overlay.expand", { volume: props.volume });
    }
  }

  return (
    <div class="kb-accordion">
      <For each={props.items}>
        {(item) => (
          <details
            class="kb-accordion__item"
            id={item.value}
            open={openItems().has(item.value)}
            data-disabled={item.disabled ? "" : undefined}
          >
            <summary
              class="kb-accordion__trigger"
              aria-disabled={item.disabled ? "true" : undefined}
              data-sound=""
              onClick={(event) => toggleItem(item, event)}
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
