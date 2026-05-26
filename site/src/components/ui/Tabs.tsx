import { Tabs as KTabs } from "@kobalte/core/tabs";
import { splitProps, type ComponentProps, type JSXElement } from "solid-js";
import type { SoundRole } from "../../lib/sound/types";
import { soundPlay } from "../../lib/sound/singleton";

export interface Tab {
  value: string;
  label: string;
  disabled?: boolean;
}

interface TabsProps extends ComponentProps<typeof KTabs> {
  tabs: Tab[];
  children: (activeTab: string) => JSXElement;
  sound?: SoundRole | false;
  volume?: number;
}

export default function Tabs(props: TabsProps) {
  const [local, rest] = splitProps(props, ["tabs", "children", "class", "sound", "volume", "onChange"]);

  const handleChange = (value: string) => {
    if (local.sound !== false) {
      soundPlay(local.sound ?? "navigation.tab", { volume: local.volume });
    }
    local.onChange?.(value);
  };

  return (
    <KTabs {...rest} class={`kb-tabs ${local.class ?? ""}`} onChange={handleChange}>
      <KTabs.List class="kb-tabs__list">
        {local.tabs.map((tab) => (
          <KTabs.Trigger
            class="kb-tabs__trigger"
            value={tab.value}
            disabled={tab.disabled}
            data-sound=""
          >
            {tab.label}
          </KTabs.Trigger>
        ))}
        <KTabs.Indicator class="kb-tabs__indicator" />
      </KTabs.List>
      {local.tabs.map((tab) => (
        <KTabs.Content class="kb-tabs__content" value={tab.value}>
          {local.children(tab.value)}
        </KTabs.Content>
      ))}
    </KTabs>
  );
}
