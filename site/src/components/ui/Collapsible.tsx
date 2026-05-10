import { splitProps, type JSXElement } from "solid-js";
import { ChevronDownIcon } from "./icons";

interface CollapsibleProps {
  title: string;
  children: JSXElement;
  class?: string;
  open?: boolean;
}

export default function Collapsible(props: CollapsibleProps) {
  const [local] = splitProps(props, ["title", "children", "class", "open"]);

  return (
    <details class={`kb-collapsible ${local.class ?? ""}`} open={local.open}>
      <summary class="kb-collapsible__trigger">
        <span class="kb-collapsible__title">{local.title}</span>
        <ChevronDownIcon class="kb-collapsible__chevron" />
      </summary>
      <div class="kb-collapsible__content">
        <div class="kb-collapsible__body">{local.children}</div>
      </div>
    </details>
  );
}
