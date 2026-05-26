import { Select as KSelect } from "@kobalte/core/select";
import { splitProps } from "solid-js";
import type { ComponentProps } from "solid-js";
import { CheckmarkIcon, ChevronDownIcon } from "./icons";
import type { SoundRole } from "../../lib/sound/types";
import { soundPlay } from "../../lib/sound/singleton";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<
    ComponentProps<typeof KSelect>,
    "options" | "itemComponent" | "children" | "value" | "defaultValue" | "onChange" | "optionValue" | "optionTextValue" | "optionDisabled"
  > {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  sound?: SoundRole | false;
  volume?: number;
}

export default function Select(props: SelectProps) {
  const [local, rest] = splitProps(props, [
    "label", "placeholder", "options", "class", "value", "defaultValue", "onChange",
    "sound", "volume",
  ]);

  const findOption = (value: string | undefined) =>
    value === undefined ? undefined : local.options.find((option) => option.value === value);

  const handleChange = (option: SelectOption | null) => {
    if (local.sound !== false) {
      soundPlay(local.sound ?? "interaction.subtle", { volume: local.volume });
    }
    local.onChange?.(option?.value ?? "");
  };

  return (
    <KSelect<SelectOption>
      {...rest}
      class={`kb-select ${local.class ?? ""}`}
      options={local.options}
      optionValue="value"
      optionTextValue="label"
      optionDisabled="disabled"
      placeholder={local.placeholder}
      value={findOption(local.value)}
      defaultValue={findOption(local.defaultValue)}
      onChange={handleChange}
      itemComponent={(itemProps) => (
        <KSelect.Item item={itemProps.item} class="kb-select__item">
          <KSelect.ItemLabel>{itemProps.item.rawValue.label}</KSelect.ItemLabel>
          <KSelect.ItemIndicator class="kb-select__item-indicator">
            <CheckmarkIcon />
          </KSelect.ItemIndicator>
        </KSelect.Item>
      )}
    >
      {local.label && (
        <KSelect.Label class="kb-select__label">{local.label}</KSelect.Label>
      )}
      <KSelect.Trigger class="kb-select__trigger" aria-label={local.label} data-sound="">
        <KSelect.Value<SelectOption> class="kb-select__value">
          {(state) => state.selectedOption()?.label ?? local.placeholder ?? "Select..."}
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
