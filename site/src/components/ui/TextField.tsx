import { TextField as KTextField } from "@kobalte/core/text-field";
import { splitProps } from "solid-js";
import type { ComponentProps, JSXElement } from "solid-js";

interface TextFieldProps extends ComponentProps<typeof KTextField> {
  label?: string;
  description?: string;
  error?: string;
  multiline?: boolean;
}

export default function TextField(props: TextFieldProps) {
  const [local, rest] = splitProps(props, [
    "label", "description", "error", "multiline", "class",
  ]);

  return (
    <KTextField {...rest} class={`kb-text-field ${local.class ?? ""}`} validationState={local.error ? "invalid" : "valid"}>
      {local.label && (
        <KTextField.Label class="kb-text-field__label">
          {local.label}
        </KTextField.Label>
      )}
      {local.multiline ? (
        <KTextField.TextArea
          class="kb-text-field__textarea"
          autoResize
        />
      ) : (
        <KTextField.Input class="kb-text-field__input" />
      )}
      {local.description && (
        <KTextField.Description class="kb-text-field__description">
          {local.description}
        </KTextField.Description>
      )}
      {local.error && (
        <KTextField.ErrorMessage class="kb-text-field__error">
          {local.error}
        </KTextField.ErrorMessage>
      )}
    </KTextField>
  );
}
