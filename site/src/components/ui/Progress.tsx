import { Progress as KProgress } from "@kobalte/core/progress";
import { splitProps, type ComponentProps } from "solid-js";

interface ProgressProps extends ComponentProps<typeof KProgress> {
  label?: string;
  showValueLabel?: boolean;
}

export default function Progress(props: ProgressProps) {
  const [local, rest] = splitProps(props, ["label", "showValueLabel", "class"]);

  return (
    <KProgress {...rest} class={`kb-progress ${local.class ?? ""}`}>
      {(local.label || local.showValueLabel) && (
        <div class="kb-progress__label-container">
          {local.label && (
            <KProgress.Label class="kb-progress__label">
              {local.label}
            </KProgress.Label>
          )}
          {local.showValueLabel !== false && (
            <KProgress.ValueLabel class="kb-progress__value-label" />
          )}
        </div>
      )}
      <KProgress.Track class="kb-progress__track">
        <KProgress.Fill class="kb-progress__fill" />
      </KProgress.Track>
    </KProgress>
  );
}
