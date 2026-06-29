import { Select } from '@base-ui/react/select';
import { soundPlay } from '../../lib/sound/singleton';
import type { SoundRole } from '../../lib/sound/types';
import { CheckmarkIcon, ChevronDownIcon } from './icons';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  name?: string;
  sound?: SoundRole | false;
  volume?: number;
}

export default function SelectComponent({
  label,
  placeholder = 'Select...',
  options,
  value,
  defaultValue,
  onChange,
  className,
  disabled,
  name,
  sound,
  volume,
}: SelectProps) {
  const items = options.map((o) => ({ label: o.label, value: o.value }));

  const handleValueChange = (val: string | null) => {
    if (sound !== false) soundPlay(sound ?? 'interaction.subtle', { volume });
    onChange?.(val ?? '');
  };

  return (
    <Select.Root
      items={items}
      value={value ?? null}
      defaultValue={defaultValue ?? null}
      onValueChange={handleValueChange}
      disabled={disabled}
      name={name}
    >
      {label && <Select.Label className="kb-select__label">{label}</Select.Label>}
      <Select.Trigger className={['kb-select__trigger', className].filter(Boolean).join(' ')}>
        <Select.Value placeholder={placeholder}>
          {(val: string | null) => options.find((o) => o.value === val)?.label ?? placeholder}
        </Select.Value>
        <Select.Icon className="kb-select__icon">
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="kb-select__positioner">
          <Select.Popup className="kb-select__content">
            <Select.List className="kb-select__listbox">
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  disabled={option.disabled}
                  className="kb-select__item"
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator className="kb-select__item-indicator">
                    <CheckmarkIcon />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
