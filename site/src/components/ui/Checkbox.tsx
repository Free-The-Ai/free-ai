import { Checkbox as KCheckbox } from "@kobalte/core/checkbox";
import { splitProps, type ComponentProps } from "solid-js";

interface CheckboxProps extends ComponentProps<typeof KCheckbox> {
  label?: string;
  description?: string;
  error?: string;
}

export default function Checkbox(props: CheckboxProps) {
  const [local, rest] = splitProps(props, [
    "label", "description", "error", "class",
  ]);

  return (
    <KCheckbox
      {...rest}
      class={`kb-checkbox ${local.class ?? ""}`}
      validationState={local.error ? "invalid" : "valid"}
    >
      <KCheckbox.Input />
      <KCheckbox.Control class="kb-checkbox__control">
        <KCheckbox.Indicator class="kb-checkbox__indicator">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8l3.5 3.5L13 5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </KCheckbox.Indicator>
      </KCheckbox.Control>
      {(local.label || local.description || local.error) && (
        <div>
          {local.label && (
            <KCheckbox.Label class="kb-checkbox__label">
              {local.label}
            </KCheckbox.Label>
          )}
          {local.description && (
            <KCheckbox.Description class="kb-checkbox__description">
              {local.description}
            </KCheckbox.Description>
          )}
          {local.error && (
            <KCheckbox.ErrorMessage class="kb-checkbox__error">
              {local.error}
            </KCheckbox.ErrorMessage>
          )}
        </div>
      )}
    </KCheckbox>
  );
}
