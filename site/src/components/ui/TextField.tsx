import { Field } from '@base-ui/react/field';
import { Input } from '@base-ui/react/input';
import { soundPlay, soundEnabled } from '../../lib/sound/singleton';

const TYPING_THROTTLE_MS = 120;
let lastTypingSound = 0;

interface TextFieldProps {
  label?: string;
  description?: string;
  error?: string;
  multiline?: boolean;
  sound?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

export default function TextField({
  label,
  description,
  error,
  multiline,
  sound = true,
  value,
  defaultValue,
  onChange,
  placeholder,
  className,
  name,
  disabled,
  required,
  id,
}: TextFieldProps) {
  const handleInput = () => {
    if (sound && soundEnabled()) {
      const now = Date.now();
      if (now - lastTypingSound >= TYPING_THROTTLE_MS) {
        lastTypingSound = now;
        soundPlay('interaction.typing');
      }
    }
  };

  return (
    <Field.Root
      className={['kb-text-field', className].filter(Boolean).join(' ')}
      invalid={!!error}
      disabled={disabled}
      name={name}
    >
      {label && <Field.Label className="kb-text-field__label">{label}</Field.Label>}
      {multiline ? (
        <textarea
          className="kb-text-field__textarea"
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => onChange?.(e.target.value)}
          onInput={handleInput}
          disabled={disabled}
          required={required}
          id={id}
        />
      ) : (
        <Input
          className="kb-text-field__input"
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onValueChange={(val) => onChange?.(val)}
          onInput={handleInput}
          disabled={disabled}
          required={required}
          id={id}
        />
      )}
      {description && <Field.Description className="kb-text-field__description">{description}</Field.Description>}
      {error && <Field.Error className="kb-text-field__error">{error}</Field.Error>}
    </Field.Root>
  );
}
