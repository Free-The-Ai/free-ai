import { Toast } from "@kobalte/core/toast";
import { Portal } from "solid-js/web";

export function ToastRegion() {
  return (
    <Portal>
      <Toast.Region duration={5000} limit={3} pauseOnInteraction>
        <Toast.List class="kb-toast__list" />
      </Toast.Region>
    </Portal>
  );
}
