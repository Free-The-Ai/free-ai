import { RadioGroup as KRadioGroup } from "@kobalte/core/radio-group";
import { splitProps, type ComponentProps } from "solid-js";
import type { SoundRole } from "../../lib/sound/types";
import { soundPlay } from "../../lib/sound/singleton";

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps extends ComponentProps<typeof KRadioGroup> {
  label?: string;
  options: RadioOption[];
  sound?: SoundRole | false;
  volume?: number;
}

export default function RadioGroup(props: RadioGroupProps) {
  const [local, rest] = splitProps(props, ["label", "options", "class", "sound", "volume", "onChange"]);

  const handleChange = (value: string) => {
    if (local.sound !== false) {
      soundPlay(local.sound ?? "interaction.toggle", { volume: local.volume });
    }
    local.onChange?.(value);
  };

  return (
    <KRadioGroup {...rest} class={`kb-radio-group ${local.class ?? ""}`} onChange={handleChange} data-sound="">
      {local.label && (
        <KRadioGroup.Label class="kb-radio-group__label">
          {local.label}
        </KRadioGroup.Label>
      )}
      <div class="kb-radio-group__items">
        {local.options.map((opt) => (
          <KRadioGroup.Item
            class="kb-radio-group__item"
            value={opt.value}
            disabled={opt.disabled}
          >
            <KRadioGroup.ItemInput />
            <KRadioGroup.ItemControl class="kb-radio-group__control" />
            <KRadioGroup.ItemLabel class="kb-radio-group__item-label">
              {opt.label}
            </KRadioGroup.ItemLabel>
          </KRadioGroup.Item>
        ))}
      </div>
    </KRadioGroup>
  );
}
