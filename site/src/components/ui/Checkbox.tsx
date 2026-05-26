import { Checkbox as KCheckbox } from "@kobalte/core/checkbox";
import { splitProps, type ComponentProps } from "solid-js";
import { CheckmarkIcon } from "./icons";
import type { SoundRole } from "../../lib/sound/types";
import { soundPlay } from "../../lib/sound/singleton";

interface CheckboxProps extends ComponentProps<typeof KCheckbox> {
  label?: string;
  description?: string;
  error?: string;
  sound?: SoundRole | false;
  volume?: number;
}

export default function Checkbox(props: CheckboxProps) {
  const [local, rest] = splitProps(props, [
    "label", "description", "error", "class", "sound", "volume", "onChange",
  ]);

  const handleChange = (checked: boolean | "indeterminate") => {
    if (checked !== "indeterminate" && local.sound !== false) {
      soundPlay(local.sound ?? "interaction.toggle", { volume: local.volume });
    }
    local.onChange?.(checked);
  };

  return (
    <KCheckbox
      {...rest}
      class={`kb-checkbox ${local.class ?? ""}`}
      validationState={local.error ? "invalid" : "valid"}
      onChange={handleChange}
      data-sound=""
    >
      <KCheckbox.Input />
      <KCheckbox.Control class="kb-checkbox__control">
        <KCheckbox.Indicator class="kb-checkbox__indicator">
          <CheckmarkIcon />
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
