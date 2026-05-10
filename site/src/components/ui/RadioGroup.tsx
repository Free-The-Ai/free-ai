import { RadioGroup as KRadioGroup } from "@kobalte/core/radio-group";
import { splitProps, type ComponentProps } from "solid-js";

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps extends ComponentProps<typeof KRadioGroup> {
  label?: string;
  options: RadioOption[];
}

export default function RadioGroup(props: RadioGroupProps) {
  const [local, rest] = splitProps(props, ["label", "options", "class"]);

  return (
    <KRadioGroup {...rest} class={`kb-radio-group ${local.class ?? ""}`}>
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
