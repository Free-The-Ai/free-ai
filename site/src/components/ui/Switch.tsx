import { Switch as KSwitch } from "@kobalte/core/switch";
import { splitProps, type ComponentProps } from "solid-js";

interface SwitchProps extends ComponentProps<typeof KSwitch> {
  label?: string;
}

export default function Switch(props: SwitchProps) {
  const [local, rest] = splitProps(props, ["label", "class"]);

  return (
    <KSwitch {...rest} class={`kb-switch ${local.class ?? ""}`}>
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
