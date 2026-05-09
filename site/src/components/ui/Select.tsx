import { Select as KSelect } from "@kobalte/core/select";
import { splitProps, For } from "solid-js";
import type { ComponentProps } from "solid-js";
import { CheckmarkIcon, ChevronDownIcon } from "./icons";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<
    ComponentProps<typeof KSelect>,
    "options" | "itemComponent" | "children"
  > {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
}

export default function Select(props: SelectProps) {
  const [local, rest] = splitProps(props, [
    "label", "placeholder", "options", "class",
  ]);

  return (
    <KSelect
      {...rest}
      class={`kb-select ${local.class ?? ""}`}
      options={local.options}
      optionValue="value"
      optionTextValue="label"
      optionDisabled="disabled"
      placeholder={local.placeholder}
      itemComponent={(itemProps) => (
        <KSelect.Item item={itemProps.item} class="kb-select__item">
          <KSelect.ItemLabel>{itemProps.item.textValue}</KSelect.ItemLabel>
          <KSelect.ItemIndicator class="kb-select__item-indicator">
            <CheckmarkIcon />
          </KSelect.ItemIndicator>
        </KSelect.Item>
      )}
    >
      {local.label && (
        <KSelect.Label class="kb-select__label">{local.label}</KSelect.Label>
      )}
      <KSelect.Trigger class="kb-select__trigger" aria-label={local.label}>
        <KSelect.Value<string> class="kb-select__value">
          {(state) => state.selectedOption() ?? local.placeholder ?? "Select..."}
        </KSelect.Value>
        <KSelect.Icon class="kb-select__icon">
          <ChevronDownIcon />
        </KSelect.Icon>
      </KSelect.Trigger>
      <KSelect.Portal>
        <KSelect.Content class="kb-select__content">
          <KSelect.Listbox class="kb-select__listbox" />
        </KSelect.Content>
      </KSelect.Portal>
    </KSelect>
  );
}
