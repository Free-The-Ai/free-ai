import { Toast, toaster } from "@kobalte/core/toast";
import { Portal } from "solid-js/web";
import { Match, Switch } from "solid-js";
import { CheckmarkIcon } from "./icons";

type ToastVariant = "info" | "success" | "error";

export function showToast(title: string, description?: string, variant: ToastVariant = "info") {
  return toaster.show((props) => (
    <Toast toastId={props.toastId} class={`kb-toast kb-toast--${variant}`}>
      <div class="kb-toast__content">
        <span class="kb-toast__icon" aria-hidden="true">
          <Switch>
            <Match when={variant === "success"}>
              <CheckmarkIcon />
            </Match>
            <Match when={variant === "error"}>!</Match>
            <Match when={variant === "info"}>i</Match>
          </Switch>
        </span>
        <div class="kb-toast__body">
          <Toast.Title class="kb-toast__title">{title}</Toast.Title>
          {description && (
            <Toast.Description class="kb-toast__description">{description}</Toast.Description>
          )}
        </div>
        <Toast.CloseButton class="kb-toast__close" aria-label="Dismiss">&times;</Toast.CloseButton>
      </div>
      <Toast.ProgressTrack class="kb-toast__progress-track">
        <Toast.ProgressFill class="kb-toast__progress-fill" />
      </Toast.ProgressTrack>
    </Toast>
  ));
}

export function ToastRegion() {
  return (
    <Portal>
      <Toast.Region duration={5000} limit={3} pauseOnInteraction>
        <Toast.List class="kb-toast__list" />
      </Toast.Region>
    </Portal>
  );
}
