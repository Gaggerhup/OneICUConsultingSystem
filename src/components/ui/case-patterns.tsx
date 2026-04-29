'use client';

import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';

type ClickableCaseTextProps = {
  children: ReactNode;
  onOpen: () => void;
  className?: string;
  wrapper?: 'span' | 'div';
};

type CasePatientCellProps = {
  leading?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  wrapperClassName?: string;
  titleClassName?: string;
  metaClassName?: string;
  onOpen: () => void;
  titleWrapper?: 'span' | 'div';
};

function handleInteractiveKeyDown(
  event: KeyboardEvent<HTMLElement>,
  onOpen: () => void,
) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    event.stopPropagation();
    onOpen();
  }
}

export function ClickableCaseText({
  children,
  onOpen,
  className,
  wrapper = 'span',
}: ClickableCaseTextProps) {
  const Component = wrapper;

  return (
    <Component
      className={className}
      role="button"
      tabIndex={0}
      style={{ cursor: 'pointer' }}
      onClick={(event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        onOpen();
      }}
      onKeyDown={(event: KeyboardEvent<HTMLElement>) => handleInteractiveKeyDown(event, onOpen)}
    >
      {children}
    </Component>
  );
}

export function CasePatientCell({
  leading,
  title,
  meta,
  wrapperClassName,
  titleClassName,
  metaClassName,
  onOpen,
  titleWrapper = 'span',
}: CasePatientCellProps) {
  const content = (
    <>
      {leading}
      <div>
        <ClickableCaseText
          className={titleClassName}
          onOpen={onOpen}
          wrapper={titleWrapper}
        >
          {title}
        </ClickableCaseText>
        {meta ? <div className={metaClassName}>{meta}</div> : null}
      </div>
    </>
  );

  if (!wrapperClassName) {
    return content;
  }

  return <div className={wrapperClassName}>{content}</div>;
}
