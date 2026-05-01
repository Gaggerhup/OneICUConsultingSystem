'use client';

import type { ReactNode } from 'react';
import { Search } from 'lucide-react';

type PageHeaderProps = {
  title: string;
  subtitle: string;
  wrapperClassName: string;
  titleClassName?: string;
  subtitleClassName?: string;
  leftClassName?: string;
  rightContent?: ReactNode;
};

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  wrapperClassName: string;
  iconClassName: string;
  inputClassName?: string;
};

type TableEmptyStateProps = {
  colSpan: number;
  cellClassName: string;
  contentClassName: string;
  icon: ReactNode;
  message: string;
  description?: string;
  descriptionClassName?: string;
  action?: ReactNode;
};

export function PageHeader({
  title,
  subtitle,
  wrapperClassName,
  titleClassName,
  subtitleClassName,
  leftClassName,
  rightContent,
}: PageHeaderProps) {
  return (
    <div className={wrapperClassName}>
      <div className={leftClassName}>
        <h1 className={titleClassName}>{title}</h1>
        <p className={subtitleClassName}>{subtitle}</p>
      </div>
      {rightContent}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
  wrapperClassName,
  iconClassName,
  inputClassName,
}: SearchFieldProps) {
  return (
    <div className={wrapperClassName}>
      <Search size={18} className={iconClassName} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName}
      />
    </div>
  );
}

export function TableEmptyState({
  colSpan,
  cellClassName,
  contentClassName,
  icon,
  message,
  description,
  descriptionClassName,
  action,
}: TableEmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className={cellClassName}>
        <div className={contentClassName}>
          {icon}
          <p>{message}</p>
          {description ? <span className={descriptionClassName}>{description}</span> : null}
          {action}
        </div>
      </td>
    </tr>
  );
}
