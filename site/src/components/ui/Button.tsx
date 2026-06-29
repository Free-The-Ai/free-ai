import { Button as BaseButton } from '@base-ui/react/button';
import { soundPlay } from '../../lib/sound/singleton';
import type { SoundRole } from '../../lib/sound/types';

type ButtonVariant = 'primary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<React.ComponentProps<typeof BaseButton>, 'render'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  sound?: SoundRole | false;
  volume?: number;
}

export default function Button({
  variant = 'ghost',
  size = 'md',
  sound,
  volume,
  className,
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <BaseButton
      data-variant={variant}
      data-size={size === 'md' ? undefined : size}
      data-sound=""
      className={['kb-button', className].filter(Boolean).join(' ')}
      onClick={(e) => {
        if (sound !== false) soundPlay(sound ?? 'interaction.tap', { volume });
        onClick?.(e);
      }}
      {...rest}
    />
  );
}
