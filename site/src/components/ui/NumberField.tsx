import { NumberField as KNumberField } from "@kobalte/core/number-field";
import { splitProps } from "solid-js";
import type { ComponentProps } from "solid-js";

interface NumberFieldProps extends ComponentProps<typeof KNumberField> {
  label?: string;
}

export default function NumberField(props: NumberFieldProps) {
  const [local, rest] = splitProps(props, ["label", "class"]);

  return (
    <KNumberField {...rest} class={`kb-number-field ${local.class ?? ""}`}>
      {local.label && (
        <KNumberField.Label class="kb-number-field__label">
          {local.label}
        </KNumberField.Label>
      )}
      <KNumberField.Input class="kb-number-field__input" />
    </KNumberField>
  );
}
