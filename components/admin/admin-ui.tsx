import Link from 'next/link';
import type { MouseEventHandler, ReactNode } from 'react';

type ActionTone = 'preview' | 'share' | 'edit' | 'delete' | 'neutral';

type ActionButtonProps = {
  children: ReactNode;
  icon: ReactNode;
  tone?: ActionTone;
  href?: string;
  target?: string;
  disabled?: boolean;
  title?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export function ActionButton({ children, icon, tone = 'neutral', href, target, disabled, title, onClick }: ActionButtonProps) {
  const className = `table-action-button action-${tone}`;
  const content = <>{icon}<span>{children}</span></>;

  if (href && !disabled) {
    return <Link className={className} href={href} target={target} title={title}>{content}</Link>;
  }

  return <button type="button" className={className} disabled={disabled} title={title} onClick={onClick}>{content}</button>;
}

type ActionGroupProps = {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
};

export function ActionGroup({ children, columns = 2 }: ActionGroupProps) {
  return <div className={`table-action-group table-action-columns-${columns}`}>{children}</div>;
}

type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: StatusTone }) {
  return <span className={`badge admin-status-badge badge-${tone}`}>{children}</span>;
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state compact-empty admin-empty-state"><div className="empty-icon">{icon}</div><h2>{title}</h2><p>{description}</p>{action}</div>;
}
