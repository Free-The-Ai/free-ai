import { Skeleton as KSkeleton } from "@kobalte/core/skeleton";
import type { JSX } from "solid-js";

type SkeletonProps = {
  width?: string;
  height?: string;
  radius?: number;
  circle?: boolean;
  animate?: boolean;
  visible?: boolean;
  class?: string;
  children?: JSX.Element;
};

export default function Skeleton(props: SkeletonProps) {
  return (
    <div class={props.class ?? "kb-skeleton"}>
      <KSkeleton
        width={props.width ? parseInt(props.width, 10) : undefined}
        height={props.height ? parseInt(props.height, 10) : undefined}
        radius={props.radius}
        circle={props.circle}
        animate={props.animate}
        visible={props.visible}
      />
      {props.children}
    </div>
  );
}
