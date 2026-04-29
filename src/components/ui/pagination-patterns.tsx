'use client';

import type { ReactNode } from 'react';

type PaginationSummaryProps = {
  wrapperClassName: string;
  textClassName: string;
  children: ReactNode;
  controls?: ReactNode;
};

type PagerControlsProps = {
  wrapperClassName: string;
  navButtonClassName: string;
  activePageClassName: string;
  prevIcon: ReactNode;
  nextIcon: ReactNode;
};

export function PaginationSummary({
  wrapperClassName,
  textClassName,
  children,
  controls,
}: PaginationSummaryProps) {
  return (
    <div className={wrapperClassName}>
      <span className={textClassName}>{children}</span>
      {controls}
    </div>
  );
}

export function PagerControls({
  wrapperClassName,
  navButtonClassName,
  activePageClassName,
  prevIcon,
  nextIcon,
}: PagerControlsProps) {
  return (
    <div className={wrapperClassName}>
      <button className={navButtonClassName}>{prevIcon}</button>
      <button className={activePageClassName}>1</button>
      <button className={navButtonClassName}>{nextIcon}</button>
    </div>
  );
}
