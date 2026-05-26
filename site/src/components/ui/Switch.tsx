import { Switch as KSwitch } from "@kobalte/core/switch";
import { splitProps, type ComponentProps } from "solid-js";
import type { SoundRole } from "../../lib/sound/types";
import { soundPlay } from "../../lib/sound/singleton";

interface SwitchProps extends ComponentProps<typeof KSwitch> {
  label?: string;
  sound?: SoundRole | false;
  volume?: number;
}

export default function Switch(props: SwitchProps) {
  const [local, rest] = splitProps(props, ["label", "class", "sound", "volume", "onChange"]);

  const handleChange = (checked: boolean) => {
    if (local.sound !== false) {
      soundPlay(local.sound ?? "interaction.toggle", { volume: local.volume });
    }
    local.onChange?.(checked);
  };

  return (
    <KSwitch {...rest} class={`kb-switch ${local.class ?? ""}`} onChange={handleChange}>
      <KSwitch.Input />
      <KSwitch.Control class="kb-switch__control">
        <KSwitch.Thumb class="kb-switch__thumb" />
      </KSwitch.Control>
      {local.label && (
        <KSwitch.Label class="kb-switch__label">{local.label}</KSwitch.Label>
      )}
    </KSwitch>
  );
}
