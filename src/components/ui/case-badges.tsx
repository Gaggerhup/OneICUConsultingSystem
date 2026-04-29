'use client';

type PriorityBadgeProps = {
  value: string;
  baseClassName: string;
  variantClassName: string;
};

type StatusWithDotBadgeProps = {
  value: string;
  wrapperClassName: string;
  dotBaseClassName: string;
  dotVariantClassName: string;
  textBaseClassName: string;
  textVariantClassName: string;
};

type StatusPillProps = {
  value: string;
  className: string;
};

export function PriorityBadge({
  value,
  baseClassName,
  variantClassName,
}: PriorityBadgeProps) {
  return <span className={`${baseClassName} ${variantClassName}`}>{value}</span>;
}

export function StatusWithDotBadge({
  value,
  wrapperClassName,
  dotBaseClassName,
  dotVariantClassName,
  textBaseClassName,
  textVariantClassName,
}: StatusWithDotBadgeProps) {
  return (
    <div className={wrapperClassName}>
      <span className={`${dotBaseClassName} ${dotVariantClassName}`}></span>
      <span className={`${textBaseClassName} ${textVariantClassName}`}>
        {value}
      </span>
    </div>
  );
}

export function StatusPill({ value, className }: StatusPillProps) {
  return <span className={className}>{value}</span>;
}
