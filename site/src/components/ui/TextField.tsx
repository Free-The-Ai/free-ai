import { TextField as KTextField } from "@kobalte/core/text-field";
import { splitProps } from "solid-js";
import type { ComponentProps, JSXElement } from "solid-js";
import { soundPlay, soundEnabled } from "../../lib/sound/singleton";

const TYPING_THROTTLE_MS = 120;
let lastTypingSound = 0;

interface TextFieldProps extends ComponentProps<typeof KTextField> {
  label?: string;
  description?: string;
  error?: string;
  multiline?: boolean;
  /** Set to false to disable typing sounds. */
  sound?: boolean;
}

export default function TextField(props: TextFieldProps) {
  const [local, rest] = splitProps(props, [
    "label", "description", "error", "multiline", "class", "sound",
  ]);

  const handleInput = () => {
    if (local.sound !== false && soundEnabled()) {
      const now = Date.now();
      if (now - lastTypingSound >= TYPING_THROTTLE_MS) {
        lastTypingSound = now;
        soundPlay("interaction.typing");
      }
    }
  };

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
          onInput={handleInput}
        />
      ) : (
        <KTextField.Input class="kb-text-field__input" onInput={handleInput} />
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
