interface SkeletonProps {
  width?: string;
  height?: string;
  radius?: number;
  circle?: boolean;
  animate?: boolean;
  visible?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function Skeleton({
  width,
  height,
  radius,
  circle,
  animate = true,
  visible = true,
  className,
  children,
}: SkeletonProps) {
  if (!visible) return <>{children}</>;

  const style: React.CSSProperties = {
    width: width,
    height: height,
    borderRadius: circle ? '50%' : radius,
  };

  return (
    <div className={className ?? 'kb-skeleton'}>
      <div data-animate={animate ? '' : undefined} style={style} />
      {children}
    </div>
  );
}
